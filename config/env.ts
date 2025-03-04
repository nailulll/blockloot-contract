import dotenv from "dotenv";
dotenv.config();

export const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
export const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY! || "";
export const SEPOLIA_ADDRESS = process.env.SEPOLIA_ADDRESS! || "";
