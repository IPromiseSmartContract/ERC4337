import { ethers } from "hardhat";
import { expect } from "chai";
import { EntryPoint__factory, DepositPaymaster__factory, SimpleAccountFactory__factory, PaymasterFactory__factory, EntryPoint, PaymasterFactory, DepositPaymaster, SimpleAccountFactory } from "../typechain-types";
import { config as envConfig } from "dotenv";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";
envConfig();
describe("Backend Test:", () => {
    const { SEPOLIA_URL, SEPOLIA_PRIVATE_KEYS } = process.env;
    let provider: JsonRpcProvider
    let signer: Wallet
    let entryPoint: EntryPoint
    let enrtryPointAddress: string
    let paymaterFactoryAddress: string
    let paymasterFactory: PaymasterFactory
    let paymaterAddress: string
    let paymaster: DepositPaymaster
    let SimpleAccountFactoryAddress: string
    let simpleAccountFactory: SimpleAccountFactory

    before(async () => {
        provider = new ethers.providers.JsonRpcProvider(SEPOLIA_URL);
        signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEYS!, provider);
        enrtryPointAddress = "0x9FA609A4430218a20aF170e246c1E35fbaCc3485";
        entryPoint = EntryPoint__factory.connect(enrtryPointAddress, signer);
        paymaterFactoryAddress = "0x5D0870C57B807278f54F624f1196014C6D1E0933"
        paymasterFactory = PaymasterFactory__factory.connect(paymaterFactoryAddress, signer);
        paymaterAddress = "0x868CD7d2Baf6B468C3A179DdcD50255c332FEaFd"
        paymaster = DepositPaymaster__factory.connect(paymaterAddress, signer); // make sure you channge to your paymaster address
        SimpleAccountFactoryAddress = "0xE334Ac1DD0e0f89c2B1e45a9a4cA42EC00b57067"
        simpleAccountFactory = SimpleAccountFactory__factory.connect(SimpleAccountFactoryAddress, signer);
    });
    describe("createPaymaster", () => {
        it("should create a new Paymaster and increase the count", async () => {
            const countBefore = await paymasterFactory.count();
            const tx = await paymasterFactory.createPaymaster(enrtryPointAddress);
            await tx.wait();
            const countAfter = await paymasterFactory.count();

            // After creating a new paymaster, paymasterFactory's count should increase by 1
            expect(countAfter.toString()).to.equal(countBefore.add(1).toString());
        });
    });

    describe("addStake", () => {
        it("should add stake to the Paymaster and update the stake amount", async () => {
            const stakeBefore = (await entryPoint.deposits(paymaster.address)).stake;
            const value = ethers.utils.parseEther("0.01");
            const tx = await paymaster.addStake(13, { value: value });
            await tx.wait();
            const stakeAfter = (await entryPoint.deposits(paymaster.address)).stake;

            // Check if the stakeAfter is equal to stakeBefore + value
            expect(stakeAfter.toString()).to.equal(stakeBefore.add(value).toString());
        });
    });

    describe("depositTo", () => {
        it("should deposit ETH to the Paymaster and update the deposit amount", async () => {
            const paymasterAccount = paymaterAddress;
            const depositBefore = await (await entryPoint.deposits(paymasterAccount)).deposit;
            const value = ethers.utils.parseEther("0.01");
            const tx = await entryPoint.depositTo(paymasterAccount, { value: value });
            await tx.wait();
            const depositAfter = await (await entryPoint.deposits(paymasterAccount)).deposit;

            // Check if the depositAfter is equal to depositBefore + value
            expect(depositAfter.toString()).to.equal(depositBefore.add(value).toString());
        });
    });

    describe("addToken", () => {
        it("should add a new token to the Paymaster and verify the oracle address", async () => {
            // If the token was already added, it will be reverted.
            const tokenAddress = "0xe84FbBbe0f576d46BC6D5315a9F981d25A8a9d79";
            const tokenPriceOracle = "0xEc6E432Cd61DAD1BAd43D32dE10e78Ac3785c790";
            const tx = await paymaster.addToken(tokenAddress, tokenPriceOracle);
            await tx.wait();
            const result = await paymaster.oracles(tokenAddress);

            // Check if the oracle address of tokenAddress is added
            expect(result).to.equal(tokenPriceOracle);
        });
    });

    describe("createAA", () => {
        it("should create a new simple account and verify the account address", async () => {
            const ownerAddress = signer.address;
            const salt = 0;
            const tx = await simpleAccountFactory.createAccount(ownerAddress, salt);
            await tx.wait();
            const simpleAccountAddress = await simpleAccountFactory.getAddress(ownerAddress, salt);

            // Check if the simpleAccountAddress is not undefined
            expect(simpleAccountAddress).to.not.be.undefined;
        });
    });

    describe("addDepositFor", () => {
        it("should add a token deposit for the Paymaster and update the deposit amount", async () => {
            const tokenAddress = "0x1C02053E9565DF6178eCaAD166D4cB9F8431107b";
            const paymasterAddress = "0x868CD7d2Baf6B468C3A179DdcD50255c332FEaFd";
            const amount = 1;

            const tokenABI = [
                "function approve(address spender, uint256 amount) public returns (bool)",
                "function allowance(address owner, address spender) public view returns (uint256)"
            ];
            const ownerAddress = await signer.getAddress();
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
            const approveTx = await tokenContract.approve(paymaster.address, amount);
            await approveTx.wait();
            const allowance = await tokenContract.allowance(ownerAddress, paymaster.address);

            // Check if the allowance is equal to the amount
            expect(allowance.toString()).to.equal(amount.toString());

            const depositAmountBefore = await (await paymaster.depositInfo(tokenAddress, paymasterAddress)).amount;
            const tx = await paymaster.addDepositFor(tokenAddress, paymasterAddress, amount);
            await tx.wait();
            const depositAmountAfter = await (await paymaster.depositInfo(tokenAddress, paymasterAddress)).amount;

            // Check if depositAmountAfter is equal to depositAmountBefore + amount
            expect(depositAmountAfter.toString()).to.equal(depositAmountBefore.add(amount).toString());
        }).timeout(70000);
    });
});
