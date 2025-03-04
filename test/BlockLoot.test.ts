import { expect } from "chai";
import { ethers } from "hardhat";
import { BlockLoot } from "../typechain-types";
import { Signer } from "ethers";

function formatEther(value: BigInt) {
  return ethers.formatEther(value.toString()) + " ETH";
}

describe("BlockLoot", function () {
  let token: BlockLoot;
  let ownerAddress: Signer;
  let address1: Signer;
  let address2: Signer;

  beforeEach(async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    ownerAddress = owner;
    address1 = addr1;
    address2 = addr2;

    const Token = await ethers.getContractFactory("BlockLoot");
    const res = await Token.deploy(owner);
    await res.waitForDeployment();
    token = res;
  });

  describe("deployment", function () {
    it("should have name BlockLoot", async () => {
      expect(await token.name()).to.equal("BlockLoot");
    });
    it("should have symbol BLT", async () => {
      expect(await token.symbol()).to.equal("BLT");
    });
    it("should have right owner address", async () => {
      expect(await token.owner()).to.equal(await ownerAddress.getAddress());
    });
    it("should have fee 5%", async () => {
      expect(await token.feePercent()).to.equal(5);
    });
  });

  describe("admin functions", function () {
    it("should update fee", async () => {
      await token.updateFeePercent(7);
      expect(await token.feePercent()).to.equal(7);
    });
    it("should failed update fee when fee more than 10", async () => {
      await expect(token.updateFeePercent(11)).to.be.revertedWith(
        "Fee too high, max 10%"
      );
    });
    it("should failed update fee when fee less than 0", async () => {
      await expect(token.updateFeePercent(0)).to.be.revertedWith(
        "Fee must be greater than zero"
      );
    });

    it("should owner can change fee", async () => {
      const contractSigner = token.connect(address1);
      await expect(
        contractSigner.updateFeePercent(7)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("nft mint", function () {
    it("should mint nft", async () => {
      const tokenURI = "ipfs://QmXYZ123...";
      const res = await token.mintNFT(tokenURI);
      await res.wait();

      expect(await token.tokenURI(1)).to.equal(tokenURI);
      expect(await token.ownerOf(1)).to.equal(await ownerAddress.getAddress());
    });
    it("should token ID increment every mint", async () => {
      const tokenURI1 = "ipfs://QmXYZ123...";
      const tokenURI2 = "ipfs://QmXYZ456...";
      const res1 = await token.mintNFT(tokenURI1);
      const res2 = await token.mintNFT(tokenURI2);
      await res1.wait();
      await res2.wait();

      expect(await token.tokenURI(1)).to.equal(tokenURI1);
      expect(await token.tokenURI(2)).to.equal(tokenURI2);
    });
    it("should emit event Transfer when minting", async function () {
      const tokenURI = "ipfs://QmXYZ123...";
      await expect(token.mintNFT(tokenURI))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, await ownerAddress.getAddress(), 1);
    });
  });

  describe("list nft", () => {
    beforeEach(async () => {
      // mint nft first before running test
      await token.mintNFT("ipfs://QmXYZ123...");
    });

    it("should success listing nft", async () => {
      await token.listNFT(1, ethers.parseEther("1"));
      const listing = await token.listings(1);
      expect(listing.seller).to.equal(await ownerAddress.getAddress());
      expect(listing.price).to.equal(ethers.parseEther("1"));

      // make sure nft approve to contract
      expect(await token.getApproved(1)).to.equal(await token.getAddress());
    });

    it("should failed if not the owner trying to list", async () => {
      const contractSigner = token.connect(address1);
      await expect(
        contractSigner.listNFT(1, ethers.parseEther("1"))
      ).to.be.revertedWith("You are not the owner of this NFT");
    });

    it("should failed if nft price is 0", async () => {
      await expect(token.listNFT(1, 0)).to.be.revertedWith(
        "Price must be greater than 0"
      );
    });
  });

  describe("cancel listing", () => {
    it("should remove listing", async () => {
      await token.mintNFT("ipfs://QmXYZ123...");
      await token.listNFT(1, ethers.parseEther("1"));
      await token.cancelListing(1);

      const listing = await token.listings(1);
      expect(listing[0]).to.equal(ethers.ZeroAddress);
    });

    it("should failed when address not a seller", async () => {
      await token.mintNFT("ipfs://QmXYZ123");
      await token.listNFT(1, ethers.parseEther("1"));

      await expect(token.connect(address1).cancelListing(1)).to.be.revertedWith(
        "You are not the seller"
      );
    });

    it("should fail if listing does not exist", async () => {
      await expect(
        token.connect(address1).cancelListing(999)
      ).to.be.revertedWith("You are not the seller");
    });
  });

  describe("buy nft", () => {
    beforeEach(async () => {
      // mint nft first before running test
      await token.mintNFT("ipfs://QmXYZ123...");
      await token.listNFT(1, ethers.parseEther("2"));
    });

    it("should revert if nft not listed", async () => {
      await expect(token.connect(address1).buyNft(2)).to.be.revertedWith(
        "NFT not listed"
      );
    });

    it("should revert if incorrect price", async () => {
      await expect(
        token.connect(address1).buyNft(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Incorrect price");
    });

    it("should transfer NFT ownership to buyer", async () => {
      const contractSigner = token.connect(address1);
      await contractSigner.buyNft(1, { value: ethers.parseEther("2") });
      expect(await token.ownerOf(1)).to.equal(await address1.getAddress());
    });

    it("should transfer payment to seller and fee to marketplace", async () => {
      const price = ethers.parseEther("3"); // 3 ETH
      const feePercent = 5n; // 5% in format BigInt
      const feeAmount = (price * feePercent) / 100n; // Fee calculated manually
      const sellerAmount = price - feeAmount; // the remainder received by seller

      const ownerBalanceBefore = await ethers.provider.getBalance(ownerAddress);
      const sellerBalanceBefore = await ethers.provider.getBalance(address1);
      const buyerBalanceBefore = await ethers.provider.getBalance(address2);

      await token.connect(address1).mintNFT("ipfs://QmXYZ123...");
      await token.connect(address1).listNFT(2, price);

      const tx = await token.connect(address2).buyNft(2, { value: price });
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice; // count gas fee buyer

      const ownerBalanceAfter = await ethers.provider.getBalance(ownerAddress);
      const sellerBalanceAfter = await ethers.provider.getBalance(address1);
      const buyerBalanceAfter = await ethers.provider.getBalance(address2);

      console.log(
        "Owner received:",
        formatEther(ownerBalanceAfter - ownerBalanceBefore)
      );
      console.log(
        "Seller received:",
        formatEther(sellerBalanceAfter - sellerBalanceBefore)
      );
      console.log(
        "Buyer spent (with gas):",
        formatEther(buyerBalanceBefore - buyerBalanceAfter)
      );

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(feeAmount);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.be.closeTo(
        sellerAmount,
        ethers.parseEther("0.001")
      );
      expect(buyerBalanceBefore - buyerBalanceAfter).to.be.closeTo(
        price + gasUsed,
        ethers.parseEther("0.01")
      );
    });

    it("should remove from listings after purchase", async () => {
      const contractSigner = token.connect(address1);
      await contractSigner.buyNft(1, { value: ethers.parseEther("2") });
      const listing = await token.listings(1);
      expect(listing[0]).to.equal(ethers.ZeroAddress);
    });
  });
});
