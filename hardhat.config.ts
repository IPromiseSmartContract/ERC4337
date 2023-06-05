import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    sepolia: {
      url: `${process.env.SEPOLIA_URL}` ?? "",
      accounts: process.env.SEPOLIA_PRIVATE_KEYS?.split(",") ?? [],
    }
  },
  etherscan: {
    apiKey: {
      "sepolia": process.env.ETHERSCAN_API_KEY ?? "",
    }
  }
};

export default config;
