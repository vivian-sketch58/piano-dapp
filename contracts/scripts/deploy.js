const { ethers, network } = require("hardhat");

const USDC_ADDRESSES = {
  hardhat: null,
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Network:", network.name);

  let usdcAddress = USDC_ADDRESSES[network.name];

  if (!usdcAddress) {
    console.log("Deploying MockUSDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("MockUSDC deployed to:", usdcAddress);
  }

  const BlueRoseMart = await ethers.getContractFactory("BlueRoseMart");
  const marketplace = await BlueRoseMart.deploy(usdcAddress);
  await marketplace.waitForDeployment();

  const marketplaceAddress = await marketplace.getAddress();
  console.log("BlueRoseMart deployed to:", marketplaceAddress);
  console.log("USDC address used:", usdcAddress);
  console.log("\nAdd these to your frontend .env.local:");
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
