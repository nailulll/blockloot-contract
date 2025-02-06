import hre from "hardhat";

async function main() {
  const BlockLoot = await hre.ethers.getContractFactory("BlockLoot");
  const blockLoot = await BlockLoot.deploy(process.env.SEPOLIA_ADDRESS || "");
  console.log(`Deployed to ${blockLoot.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
