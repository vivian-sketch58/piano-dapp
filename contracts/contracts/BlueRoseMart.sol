// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BlueRoseMart is ReentrancyGuard {
    IERC20 public immutable usdc;

    enum Status { Listed, AwaitingDelivery, Sold, Cancelled }

    struct Listing {
        uint256 id;
        address seller;
        address buyer;
        string brand;
        string model;
        uint16 yearMade;
        string condition;   // "Excellent", "Good", "Fair"
        string description;
        string imageHash;   // IPFS CID
        uint256 price;      // in USDC (6 decimals)
        Status status;
    }

    uint256 public nextId;
    mapping(uint256 => Listing) public listings;

    event PianoListed(uint256 indexed id, address indexed seller, uint256 price);
    event PianoPurchased(uint256 indexed id, address indexed buyer);
    event DeliveryConfirmed(uint256 indexed id);
    event ListingCancelled(uint256 indexed id);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function listPiano(
        string calldata brand,
        string calldata model,
        uint16 yearMade,
        string calldata condition,
        string calldata description,
        string calldata imageHash,
        uint256 price
    ) external returns (uint256 id) {
        require(price > 0, "Price must be > 0");
        id = nextId++;
        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            buyer: address(0),
            brand: brand,
            model: model,
            yearMade: yearMade,
            condition: condition,
            description: description,
            imageHash: imageHash,
            price: price,
            status: Status.Listed
        });
        emit PianoListed(id, msg.sender, price);
    }

    // Buyer calls this — USDC is held in contract as escrow
    function buyPiano(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        require(l.status == Status.Listed, "Not available");
        require(msg.sender != l.seller, "Seller cannot buy own listing");
        require(usdc.transferFrom(msg.sender, address(this), l.price), "USDC transfer failed");
        l.buyer = msg.sender;
        l.status = Status.AwaitingDelivery;
        emit PianoPurchased(id, msg.sender);
    }

    // Buyer confirms piano received — releases USDC to seller
    function confirmDelivery(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        require(l.status == Status.AwaitingDelivery, "Not awaiting delivery");
        require(msg.sender == l.buyer, "Only buyer can confirm");
        l.status = Status.Sold;
        require(usdc.transfer(l.seller, l.price), "USDC release failed");
        emit DeliveryConfirmed(id);
    }

    // Seller can cancel only if no buyer yet
    function cancelListing(uint256 id) external {
        Listing storage l = listings[id];
        require(msg.sender == l.seller, "Only seller can cancel");
        require(l.status == Status.Listed, "Cannot cancel at this stage");
        l.status = Status.Cancelled;
        emit ListingCancelled(id);
    }

    function getListing(uint256 id) external view returns (Listing memory) {
        return listings[id];
    }

    function getAllListings() external view returns (Listing[] memory) {
        Listing[] memory result = new Listing[](nextId);
        for (uint256 i = 0; i < nextId; i++) {
            result[i] = listings[i];
        }
        return result;
    }
}
