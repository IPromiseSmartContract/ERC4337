import { ethers } from "ethers";
import { EntryPoint__factory, DepositPaymaster__factory, SimpleAccountFactory__factory, PaymasterFactory__factory } from "./typechain-types";
import { config as envConfig } from "dotenv";
import { expect } from "chai";
envConfig();

const { SEPOLIA_URL, SEPOLIA_PRIVATE_KEYS } = process.env;
const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_URL);
const signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEYS!, provider);
const enrtryPointAddress = "0x9FA609A4430218a20aF170e246c1E35fbaCc3485";
const entryPoint = EntryPoint__factory.connect(enrtryPointAddress, signer);
const paymaterFactoryAddress = "0x5D0870C57B807278f54F624f1196014C6D1E0933"
const paymasterFactory = PaymasterFactory__factory.connect(paymaterFactoryAddress, signer);
const paymaterAddress = "0x868CD7d2Baf6B468C3A179DdcD50255c332FEaFd"
const paymaster = DepositPaymaster__factory.connect(paymaterAddress, signer); // make sure you channge to your paymaster address
const SimpleAccountFactoryAddress = "0xE334Ac1DD0e0f89c2B1e45a9a4cA42EC00b57067"
const simpleAccountFactory = SimpleAccountFactory__factory.connect(SimpleAccountFactoryAddress, signer);

/** 
 * Create a new Paymaster
 * @param enrtryPointAddress : the entryPoint address that paymaster is connected to
 */
async function createPaymaster(enrtryPointAddress: string) {
    try {
        const countBefore = await paymasterFactory.count()
        const tx = await paymasterFactory.createPaymaster(enrtryPointAddress);
        await tx.wait();
        console.log("Paymaster address: ",await paymasterFactory.getPaymasterAddress(countBefore.toNumber()))
        const countAfter = await paymasterFactory.count();
        // After creating a new paymaster, paymasterFactory's count should add 1.
        expect(countAfter.toString()).to.equal(countBefore.add(1).toString());
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
    
}
/**
 * Paymaster add stake to entryPoint
 * @param unstakeDelaySec the new lock duration before the deposit can be withdrawn.
 * @param stakeValue the eth value paymaster wants to stake
 */ 
async function addStake(unstakeDelaySec: number, stakeValue: string) {
    try {
        const stakeBefore = (await entryPoint.deposits(paymaster.address)).stake;
        const value = ethers.utils.parseEther(stakeValue);
        const tx = await paymaster.addStake(unstakeDelaySec, { value: value });
        await tx.wait();
        const stakeAfter = (await entryPoint.deposits(paymaster.address)).stake;
        // Check if the stakeAfter == stakeBefore + stakeValue
        expect(stakeAfter.toString()).to.equal(stakeBefore.add(ethers.utils.parseEther(stakeValue)).toString());
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}
/**
 * Paymaster deposits ETH to entryPoint
 * @param depositValue : The velue paymaster wants to deposit
 * @param paymasterAccount : The paymaster account
 */ 
async function depositTo(depositValue: string, paymasterAccount: string) {
    try {
        const depositBefore = await (await entryPoint.deposits(paymasterAccount)).deposit;
        const value = ethers.utils.parseEther(depositValue);
        const tx = await entryPoint.depositTo(paymasterAccount, { value: value });
        await tx.wait();
        const depositAfter = await (await entryPoint.deposits(paymasterAccount)).deposit;
        // Check if the depositAfter == depositBefore + depositValue
        expect(depositAfter.toString()).to.equal(depositBefore.add(ethers.utils.parseEther(depositValue)).toString());
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}
/**
 * Paymaster add the token that it receives from AA account
 * @param tokenAddress : the token address it want to add
 * @param tokenPriceOracle : the token price's oracle
 */
async function addToken(tokenAddress: string, tokenPriceOracle: string) {
    try {
        const tx = await paymaster.addToken(tokenAddress, tokenPriceOracle);
        await tx.wait();
        const result = await paymaster.oracles(tokenAddress);
        // Check the oracle of tokenAddress is added
        expect(result).to.equal(tokenPriceOracle);
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}
/** 
 * Create a new simple account
 * @param ownerAddress : owner of simple account
 * @param salt : random number to use to create a new account
 */
async function createAA(ownerAddress: string, salt: number) {
    try {
        const tx = await simpleAccountFactory.createAccount(ownerAddress, salt);
        await tx.wait();
        const simpleAccountAddress = await simpleAccountFactory.getAddress(ownerAddress, salt);
        console.log('Simple Accoun Address:',simpleAccountAddress);
        expect(simpleAccountAddress).to.not.be.undefined;
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}
/** 
 * User deposit token into Paymaser
 * User should should call approve() first, so that paymaster can spend user's token
 * @param tokenAddress : The token address that usser wants to deposit
 * @param paymasterAddress : The paymaster address that user wants to deposit'
 * @param amount : The amount of token that user appoves
 */ 
async function addDepositFor(tokenAddress: string, paymasterAddress: string, amount: number) {
    try {
        const tokenABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)"
        ];
        const ownerAddress = await signer.getAddress()
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
        const approveTx = await tokenContract.approve(paymaster.address, amount);
        await approveTx.wait();
        const allowance = await tokenContract.allowance(ownerAddress, paymaster.address);
        // Check if the allowance is equal to the amount
        expect((allowance).toString()).to.be.equal((amount).toString());
        
        const depositAmountBefore = await (await paymaster.depositInfo(tokenAddress, paymasterAddress)).amount;
        console.log('depositAmountBefore ',depositAmountBefore);
        const tx = await paymaster.addDepositFor(tokenAddress, paymasterAddress, amount);
        await tx.wait();
        const depositAmountAfter = await (await paymaster.depositInfo(tokenAddress, paymasterAddress)).amount;
        console.log('depositAmountAfter ',depositAmountAfter);
        // Check if depositAmountAfter is equal to depositAmountBefore + amount
        expect(depositAmountAfter.toString()).to.be.equal((depositAmountBefore.add(amount)).toString())
        console.log("success");
    } catch (error) {
        console.error("error:", error);
    }
}

//createPaymaster(enrtryPointAddress);
//addStake(13, '0.01');
//depositTo('0.01', paymaterAddress)
//addToken('0xFF82bB6DB46Ad45F017e2Dfb478102C7671B13b3', '0xEc6E432Cd61DAD1BAd43D32dE10e78Ac3785c790')
//createAA(signer.address, 0)
//addDepositFor('0x1C02053E9565DF6178eCaAD166D4cB9F8431107b', '0x868CD7d2Baf6B468C3A179DdcD50255c332FEaFd', 1)
