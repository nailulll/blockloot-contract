import { expect } from "chai";
import { ethers } from "hardhat";
import { BlockLoot } from "../typechain-types";
import { Signer } from "ethers";

describe("BlockLoot", function () {
  let token: BlockLoot;
  let ownerAddress: Signer;

  beforeEach(async function () {
    const [owner] = await ethers.getSigners();
    ownerAddress = owner;

    const Token = await ethers.getContractFactory("BlockLoot");
    const res = await Token.deploy(owner);
    await res.waitForDeployment();
    token = res;
  });

  // describe("deployment", function () {
  //   it("should have name BlockLoot", async () => {
  //     expect(await token.name()).to.equal("BlockLoot");
  //   });
  //   it("should have symbol BLT", async () => {
  //     expect(await token.symbol()).to.equal("BLT");
  //   });
  //   it("should have right owner address", async () => {
  //     expect(await token.owner()).to.equal(await ownerAddress.getAddress());
  //   });
  //   it("should have fee 5%", async () => {
  //     expect(await token.feePercent()).to.equal(5);
  //   });
  // });

  // describe("nft mint", function () {
  //   it("should mint nft", async () => {
  //     const tokenURI = "ipfs://QmXYZ123...";
  //     const res = await token.mintNFT(tokenURI);
  //     await res.wait();

  //     expect(await token.tokenURI(1)).to.equal(tokenURI);
  //     expect(await token.ownerOf(1)).to.equal(await ownerAddress.getAddress());
  //   });
  //   it("should token ID increment every mint", async () => {
  //     const tokenURI1 = "ipfs://QmXYZ123...";
  //     const tokenURI2 = "ipfs://QmXYZ456...";
  //     const res1 = await token.mintNFT(tokenURI1);
  //     const res2 = await token.mintNFT(tokenURI2);
  //     await res1.wait();
  //     await res2.wait();

  //     expect(await token.tokenURI(1)).to.equal(tokenURI1);
  //     expect(await token.tokenURI(2)).to.equal(tokenURI2);
  //   });
  //   it("should emit event Transfer when minting", async function () {
  //     const tokenURI = "ipfs://QmXYZ123...";
  //     await expect(token.mintNFT(tokenURI))
  //       .to.emit(token, "Transfer")
  //       .withArgs(ethers.ZeroAddress, await ownerAddress.getAddress(), 1);
  //   });
  // });

  describe("");
});
