import { Contract } from 'ethers';
// import { PermitPaymaster } from './../typechain-types/contracts/sample/PermitPaymaster';
import { ethers } from "hardhat";
import { expect } from "chai";
import {
    EntryPoint,
    PaymasterFactory,
    DepositPaymaster,
    SimpleAccountFactory,
    MPCToken__factory,
    MPCToken,
    PermitPaymaster__factory,
    PermitPaymaster,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// Get v, r ,s to call permit()
async function getPermitSignature(signer: SignerWithAddress, token: Contract, spender: string, value: number, deadline: number) {
    const [nonce, name, version, chainId] = await Promise.all([
        token.nonces(signer.address),
        token.name(),
        "1",
        signer.getChainId(),
    ])

    return ethers.utils.splitSignature(
        await signer._signTypedData(
        {
            name,
            version,
            chainId,
            verifyingContract: token.address,
        },
        {
            Permit: [
            {
                name: "owner",
                type: "address",
            },
            {
                name: "spender",
                type: "address",
            },
            {
                name: "value",
                type: "uint256",
            },
            {
                name: "nonce",
                type: "uint256",
            },
            {
                name: "deadline",
                type: "uint256",
            },
            ],
        },
        {
            owner: signer.address,
            spender,
            value,
            nonce,
            deadline,
        }
        )
    )
}
describe("Permit Paymaster Test:", async () => {
    let deployer: SignerWithAddress;
    let entryPoint: EntryPoint;
    let paymasterFactory: PaymasterFactory;
    let paymaster: DepositPaymaster;
    let token: MPCToken;
    let permitPaymaster: PermitPaymaster;

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
    });

    describe("permitAddDepositFor", () => {
        it("should add a token deposit for the Paymaster and update the deposit amount", async () => {
            const PermitPaymaster__factory = await ethers.getContractFactory("PermitPaymaster");
            permitPaymaster = await PermitPaymaster__factory.deploy(entryPoint.address, deployer.address);
            await permitPaymaster.deployed();

            // add token for paymaster
            const oracleAddress = "0xEc6E432Cd61DAD1BAd43D32dE10e78Ac3785c790";
            await permitPaymaster.addToken(token.address, oracleAddress);
            const approveAmount = 1
            const deadline = Math.floor(Date.now() / 1000) + 3600;

            const { v, r, s } = await getPermitSignature(
                deployer,
                token,
                permitPaymaster.address,
                approveAmount,
                deadline
            )
            const permitData = {
                approveAmount: approveAmount,
                deadline: deadline,
                v: v,
                r: r,
                s: s
            };
            const depositAmountBefore = (await permitPaymaster.depositInfo(token.address, permitPaymaster.address))
                .amount;
            // console.log(depositAmountBefore)
            const tx = await permitPaymaster.permitAddDepositFor(token.address, permitPaymaster.address, permitData);
            // const tx = await paymaster.addDepositFor(token.address, paymaster.address, approveAmount);
            // await tx.wait();
            const depositAmountAfter = (await permitPaymaster.depositInfo(token.address, permitPaymaster.address))
                .amount;
            // console.log(depositAmountAfter)
            // Check if depositAmountAfter is equal to depositAmountBefore + amount
            expect(depositAmountAfter.toString()).to.equal(
                depositAmountBefore.add(approveAmount).toString()
            );
        });
    });
});
