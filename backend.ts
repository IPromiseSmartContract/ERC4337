import { ethers } from "ethers";
import { EntryPoint__factory, DepositPaymaster__factory } from "./typechain-types";
import { config as envConfig } from "dotenv";
envConfig();
/*
 * cd /backend and add .env file in this directory.
 * Let user input command and execute function.
 */
const { SEPOLIA_URL, SEPOLIA_PRIVATE_KEYS } = process.env;
const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_URL);
const signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEYS!, provider);
const enrtryPointAddress = "0x9FA609A4430218a20aF170e246c1E35fbaCc3485";
const entryPoint = EntryPoint__factory.connect(enrtryPointAddress, signer);
const paymaterAddress = "0x7626BE17071b0656f4F52eA3D0A2696De6019a72"
const paymaster = DepositPaymaster__factory.connect(paymaterAddress, signer);

async function addStake() {
    try {
        const unstakeDelaySec = 10; 
        const value = ethers.utils.parseEther("0.01"); 
        const tx = await entryPoint.addStake(unstakeDelaySec, { value: value });

        await tx.wait();

        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function addDepositFor() {
    /* customer deposit token to specific (choose by num) paymaster. */ 
    try {
        const tokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
        const address = "0xD10893cA2A290f02b05810beAE5027EBB43EaE94"; 
        const tx = await paymaster.addDepositFor(tokenAddress, address, 1);

        await tx.wait();

        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function withdrawTokensTo() {
    /* customer withdraw deposit token from paymaster. */ 
    try {
        const tokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
        const address = "0xD10893cA2A290f02b05810beAE5027EBB43EaE94"; 
        const tx = await paymaster.withdrawTokensTo(tokenAddress, address, 1);

        await tx.wait();

        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

addStake();