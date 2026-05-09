const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlueRoseMart", function () {
  let marketplace, usdc;
  let seller, buyer, other;

  const PRICE = ethers.parseUnits("500", 6); // 500 USDC

  beforeEach(async () => {
    [seller, buyer, other] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    const BlueRoseMart = await ethers.getContractFactory("BlueRoseMart");
    marketplace = await BlueRoseMart.deploy(await usdc.getAddress());

    await usdc.mint(buyer.address, ethers.parseUnits("10000", 6));
    await usdc.connect(buyer).approve(await marketplace.getAddress(), ethers.MaxUint256);
  });

  async function listPiano() {
    return marketplace.connect(seller).listPiano(
      "Yamaha", "U1", 2015, "Good", "Well maintained", "QmTestHash", PRICE
    );
  }

  it("seller can list a piano", async () => {
    await expect(listPiano())
      .to.emit(marketplace, "PianoListed")
      .withArgs(0, seller.address, PRICE);

    const l = await marketplace.getListing(0);
    expect(l.brand).to.equal("Yamaha");
    expect(l.status).to.equal(0n); // Listed
  });

  it("buyer can purchase a piano (funds go to escrow)", async () => {
    await listPiano();
    await expect(marketplace.connect(buyer).buyPiano(0))
      .to.emit(marketplace, "PianoPurchased")
      .withArgs(0, buyer.address);

    const bal = await usdc.balanceOf(await marketplace.getAddress());
    expect(bal).to.equal(PRICE);
    const l = await marketplace.getListing(0);
    expect(l.status).to.equal(1n); // AwaitingDelivery
  });

  it("buyer confirms delivery — USDC released to seller", async () => {
    await listPiano();
    await marketplace.connect(buyer).buyPiano(0);

    const sellerBefore = await usdc.balanceOf(seller.address);
    await expect(marketplace.connect(buyer).confirmDelivery(0))
      .to.emit(marketplace, "DeliveryConfirmed")
      .withArgs(0);

    const sellerAfter = await usdc.balanceOf(seller.address);
    expect(sellerAfter - sellerBefore).to.equal(PRICE);
    const l = await marketplace.getListing(0);
    expect(l.status).to.equal(2n); // Sold
  });

  it("seller can cancel before a buyer", async () => {
    await listPiano();
    await expect(marketplace.connect(seller).cancelListing(0))
      .to.emit(marketplace, "ListingCancelled")
      .withArgs(0);
  });

  it("seller cannot buy own listing", async () => {
    await listPiano();
    await usdc.mint(seller.address, PRICE);
    await usdc.connect(seller).approve(await marketplace.getAddress(), PRICE);
    await expect(marketplace.connect(seller).buyPiano(0))
      .to.be.revertedWith("Seller cannot buy own listing");
  });

  it("only buyer can confirm delivery", async () => {
    await listPiano();
    await marketplace.connect(buyer).buyPiano(0);
    await expect(marketplace.connect(other).confirmDelivery(0))
      .to.be.revertedWith("Only buyer can confirm");
  });
});
