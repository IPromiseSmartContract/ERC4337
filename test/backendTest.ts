import { ethers } from "hardhat";
import { expect } from "chai";
import {
    EntryPoint,
    PaymasterFactory,
    DepositPaymaster,
    SimpleAccountFactory,
    SenderFactory,
    MPCToken,
} from "../typechain-types";
import { config as envConfig } from "dotenv";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
envConfig();
describe("Backend Test:", async () => {
    let deployer: SignerWithAddress;
    let entryPoint: EntryPoint;
    let paymasterFactory: PaymasterFactory;
    let paymaster: DepositPaymaster;
    let token: MPCToken;
    let senderFactory: SenderFactory;
    let simpleAccountFactory: SimpleAccountFactory;

    before(async () => {
        [deployer] = await ethers.getSigners();

        const EntryPointFactory = await ethers.getContractFactory("EntryPoint");
        entryPoint = await EntryPointFactory.deploy(deployer.address);
        await entryPoint.deployed();

        const PaymasterFactory_Factory = await ethers.getContractFactory("PaymasterFactory");
        paymasterFactory = await PaymasterFactory_Factory.deploy();
        await paymasterFactory.deployed();
        const tx = await paymasterFactory.createPaymaster(entryPoint.address);
        const receipt = await tx.wait();
        const paymasterAddress = receipt.events?.[0].args?.paymaster as string;
        paymaster = (await ethers.getContractAt("DepositPaymaster", paymasterAddress)) as DepositPaymaster;

        const MPCTokenFactory = await ethers.getContractFactory("MPCToken");
        token = await MPCTokenFactory.deploy();
        await token.deployed();

        const SenderFactory__Factory = await ethers.getContractFactory("SenderFactory");
        senderFactory = await SenderFactory__Factory.deploy();
        await senderFactory.deployed();

        const simpleAccountFactory__Factory = await ethers.getContractFactory("SimpleAccountFactory");
        simpleAccountFactory = await simpleAccountFactory__Factory.deploy(entryPoint.address);
        await simpleAccountFactory.deployed();
    });

    describe("createPaymaster", async () => {
        it("should create a new Paymaster and increase the count", async () => {
            const tx = await paymasterFactory.createPaymaster(entryPoint.address);
            const receipt = await tx.wait();
            const _paymasterAddr = receipt.events?.[0].args?.paymaster as string;
            await expect(tx)
                .to.emit(paymasterFactory, "PaymasterCreated")
                .withArgs(_paymasterAddr, deployer.address);
        });
    });

    describe("addStake", () => {
        it("should add stake to the Paymaster and update the stake amount", async () => {
            const stakeBefore = (await entryPoint.deposits(paymaster.address)).stake;
            const value = ethers.utils.parseEther("0.01");
            const tx = await paymaster.addStake(100, { value: value });
            await tx.wait();
            const stakeAfter = (await entryPoint.deposits(paymaster.address)).stake;

            // Try to unlock before delay
            expect(paymaster.withdrawStake(deployer.address)).to.be.revertedWith(
                "StakeManager: Stake withdrawal is not due"
            );

            // Check if the stakeAfter is equal to stakeBefore + value
            expect(stakeAfter.toString()).to.equal(stakeBefore.add(value).toString());

            // Try to unlock after delay
            await expect(paymaster.unlockStake()).to.not.reverted;
            await ethers.provider.send("evm_increaseTime", [101]);
            await ethers.provider.send("evm_mine", []);
            await expect(paymaster.withdrawStake(deployer.address)).to.not.reverted;
        });
    });

    describe("depositTo", async () => {
        it("should deposit ETH to the Paymaster and update the deposit amount", async () => {
            const depositBefore = (await entryPoint.deposits(paymaster.address)).deposit;
            const value = ethers.utils.parseEther("0.01");
            const tx = await entryPoint.depositTo(paymaster.address, { value: value });
            await tx.wait();
            const depositAfter = (await entryPoint.deposits(paymaster.address)).deposit;
            // Check if the depositAfter is equal to depositBefore + value
            expect(depositAfter.toString()).to.equal(depositBefore.add(value).toString());
        });
    });

    describe("addToken", () => {
        it("should add a new token to the Paymaster and verify the oracle address", async () => {
            const _MPCTokenFactory = await ethers.getContractFactory("MPCToken");
            const _token = await _MPCTokenFactory.deploy();
            await _token.deployed();

            // If the token was already added, it will be reverted.
            const tokenPriceOracle = "0xEc6E432Cd61DAD1BAd43D32dE10e78Ac3785c790";
            const tx = await paymaster.addToken(_token.address, tokenPriceOracle);
            await tx.wait();
            const result = await paymaster.oracles(_token.address);

            // Check if the oracle address of tokenAddress is added
            expect(result).to.equal(tokenPriceOracle);
        });
    });

    describe("createAA", () => {
        it("should create a new simple account and verify the account address", async () => {
            const salt = 0;
            await simpleAccountFactory.createAccount(deployer.address, salt);

            // Check if the account address is equal to the expected address
            const accountAddr = await simpleAccountFactory.getAddress(deployer.address, salt);

            expect(accountAddr).not.to.be.undefined;
        });
    });

    it("create sender account", async () => {
        const salt = 9487;
        const callCode = simpleAccountFactory.interface.encodeFunctionData("createAccount", [
            deployer.address,
            salt,
        ]);
        const initCode = `${simpleAccountFactory.address}${callCode.substring(2)}}`;
        console.log(initCode);
        // TODO: the test will fail with `Error: invalid arrayify value`
        // However, it works fine in the real environment
        const rtn = await senderFactory.callStatic.createSender(initCode);
        expect(rtn).not.to.be.empty;
    });

    describe("addDepositFor", () => {
        it("should add a token deposit for the Paymaster and update the deposit amount", async () => {
            const approveAmount = 1;
            const ownerAddress = await deployer.getAddress();
            const approveTx = await token.approve(paymaster.address, approveAmount);
            await approveTx.wait();
            const allowance = await token.allowance(ownerAddress, paymaster.address);

            // add token for paymaster
            const oracleAddress = "0xEc6E432Cd61DAD1BAd43D32dE10e78Ac3785c790";
            await paymaster.addToken(token.address, oracleAddress);

            // Check if the allowance is equal to the amount
            expect(allowance.toString()).to.equal(approveAmount.toString());

            const depositAmountBefore = (await paymaster.depositInfo(token.address, paymaster.address))
                .amount;
            const tx = await paymaster.addDepositFor(token.address, paymaster.address, approveAmount);
            await tx.wait();
            const depositAmountAfter = (await paymaster.depositInfo(token.address, paymaster.address))
                .amount;

            // Check if depositAmountAfter is equal to depositAmountBefore + amount
            expect(depositAmountAfter.toString()).to.equal(
                depositAmountBefore.add(approveAmount).toString()
            );
        });
    });
});
