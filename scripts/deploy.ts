import hre from "hardhat";
import { SEPOLIA_ADDRESS } from "../config/env";

async function main() {
  const BlockLoot = await hre.ethers.getContractFactory("BlockLoot");
  const blockLoot = await BlockLoot.deploy(SEPOLIA_ADDRESS);
  console.log(`Deployed to ${blockLoot.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
