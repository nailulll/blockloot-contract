// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BlockLoot is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenId; // Counter for token ID
    uint256 public feePercent = 5; // Fee marketplace

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => Listing) public listings; // Mapping token ID

    event Minted(address indexed owner, uint256 tokenId);

    constructor(
        address initialOwner
    ) ERC721("BlockLoot", "BLT") Ownable(initialOwner) {}

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // mint NFT to wallet user address
    function mintNFT(string memory _tokenURI) public returns (uint256) {
        _tokenId++;
        uint256 newItemId = _tokenId;

        _mint(msg.sender, newItemId); // mint NFT to caller
        _setTokenURI(newItemId, _tokenURI); // set metadata URI

        emit Minted(msg.sender, newItemId);

        return newItemId;
    }

    // listing nft to marketplace
    function listNFT(uint256 tokenId, uint256 price) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        require(price > 0, "Price must be greater than 0");

        listings[tokenId] = Listing(msg.sender, price); // store listing
        approve(address(this), tokenId); // Approve marketplace to transfer
    }

    function buyNft(uint256 tokenId) public payable {
        Listing memory item = listings[tokenId];

        require(item.seller != address(0), "NFT not listed");
        require(msg.value == item.price, "Incorrect price");

        // calculate fee marketplace
        uint256 fee = (msg.value * feePercent) / 100;
        uint256 sellerAmount = msg.value - fee;

        // transfer payment to seller and fee to marketplace
        payable(item.seller).transfer(sellerAmount);
        payable(owner()).transfer(fee);

        // transfer nft to buyyer
        _transfer(item.seller, msg.sender, tokenId);

        // remove listing
        delete listings[tokenId];
    }

    // update fee marketplace (only owner)
    function updateFeePercent(uint256 newFee) public onlyOwner {
        require(newFee <= 10, "Fee too high, max 10%"); // max fee 10%
        require(newFee > 0, "Fee must be greater than zero"); // fee must be greater than zero
        feePercent = newFee;
    }

    // delete listing NFT (opsional) from marketplace
    function cancelListing(uint256 tokenId) public {
        require(
            listings[tokenId].seller == msg.sender,
            "You are not the seller"
        );
        delete listings[tokenId];
    }
}
