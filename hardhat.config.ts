import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { INFURA_API_KEY, SEPOLIA_PRIVATE_KEY } from "./config/env";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    //   accounts: [SEPOLIA_PRIVATE_KEY],
    // },
    hardhat: {
      chainId: 1337,
    },
  },
};

export default config;
