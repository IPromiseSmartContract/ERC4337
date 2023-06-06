import { ethers } from "ethers";
import { EntryPoint__factory, DepositPaymaster__factory, SimpleAccountFactory__factory, PaymasterFactory__factory } from "./typechain-types";
import { config as envConfig } from "dotenv";
envConfig();

const { SEPOLIA_URL, SEPOLIA_PRIVATE_KEYS } = process.env;
const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_URL);
const signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEYS!, provider);
const enrtryPointAddress = "0x9FA609A4430218a20aF170e246c1E35fbaCc3485";
const entryPoint = EntryPoint__factory.connect(enrtryPointAddress, signer);
const paymaterFactoryAddress = "0x5D0870C57B807278f54F624f1196014C6D1E0933"
const paymasterFactory = PaymasterFactory__factory.connect(paymaterFactoryAddress, signer);
const paymaterAddress = "0xb0555ef9f0D4D40A456E9949bf187f0d1793094f"
const paymaster = DepositPaymaster__factory.connect(paymaterAddress, signer);
const SimpleAccountFactoryAddress = "0xE334Ac1DD0e0f89c2B1e45a9a4cA42EC00b57067"
const simpleAccountFactory = SimpleAccountFactory__factory.connect(SimpleAccountFactoryAddress, signer);

async function createPaymaster(enrtryPointAddress: string) {
    // Success !!
    /*  Create a new Paymaster. 
        call function :
            paymasterFactory.createPaymaster
    */
    try {
        const tx = await paymasterFactory.createPaymaster(enrtryPointAddress);
        await tx.wait();
        console.log(tx);
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function addStake(unstakeDelaySec: number, stakeValue: string) {
    // Success !!
    /*  For Paymaster owner stake ETH into entrypoint. 
        call function :  
            paymaster.addStake -> entrypoint.addStake
    */
    try {
        const ownerAddress = await paymaster.getOwner()
        console.log("owner Address:", ownerAddress, "signer Address", signer.address);
        const value = ethers.utils.parseEther(stakeValue);
        const tx = await paymaster.addStake(unstakeDelaySec, { value: value });
        await tx.wait();
        const result = await entryPoint.deposits(paymaster.address);
        console.log(result);
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function depositTo(depositValue: string, paymasterAccount: string) {
    // Success !!
    /*  Deposit ETH into entrypoint for fee and assign to a paymaster (which has already stake ETH). 
        call function :
            entrypoint.depositTo
    */
    try {
        const value = ethers.utils.parseEther(depositValue);
        const tx = await entryPoint.depositTo(paymasterAccount, { value: value });
        await tx.wait();
        const result = await entryPoint.deposits(paymasterAccount);
        console.log(result);
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function addToken(tokenAddress: string, tokenPriceOracle: string) {
    // Success !!
    /*  Add a new Token for customer to pay for gas fee. 
        call function :
            paymaster.addToken
    */
    try {
        const tx = await paymaster.addToken(tokenAddress, tokenPriceOracle);
        await tx.wait();
        const result = await paymaster.oracles(tokenAddress);
        console.log(result);
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function createAA(ownerAddress: string, salt: number) {
    // Success !!
    /*  Create a new simple account. 
        call function :
            simpleAccountFactory.createAccount
    */
    try {
        const tx = await simpleAccountFactory.createAccount(ownerAddress, salt);
        await tx.wait();
        const result = await simpleAccountFactory.getAddress(ownerAddress, salt);
        console.log(tx);
        console.log(result);
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

async function addDepositFor(token: string, account: string, amount: number) {
    /* Hasn't done yet */ 
    try {
        const TokenAddress = token
        const simpleAccountFactory = SimpleAccountFactory__factory.connect(TokenAddress, signer);
        const tokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
        const address = "0xD10893cA2A290f02b05810beAE5027EBB43EaE94"; 
        const tx = await paymaster.addDepositFor(tokenAddress, address, 1);

        await tx.wait();

        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

// createPaymaster(enrtryPointAddress);
// addStake(13, '0.01');
// depositTo('0.01', paymaterAddress)
// addToken('0x1C02053E9565DF6178eCaAD166D4cB9F8431107b', '0xEc6E432Cd61DAD1BAd43D32dE10e78Ac3785c790')
// createAA(signer.address, 0)
