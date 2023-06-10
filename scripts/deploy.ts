import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import type { Deployment } from "./types";

function saveJSON(obj: object) {
    const currentDate = new Date();
    const timestampInSeconds = Math.floor(currentDate.getTime() / 1000);

    const directoryPath = "deployment";
    const filePath = path.join(directoryPath, `${timestampInSeconds}.json`);
    const jsonString = JSON.stringify(obj, null, 2);

    fs.mkdir(directoryPath, { recursive: true }, (err) => {
        if (err) {
            console.error("Error creating directory:", err);
            return;
        }
    });

    fs.writeFile(filePath, jsonString, (err) => {
        if (err) {
            console.error("Error saving JSON object:", err);
        } else {
            console.log(`JSON object saved to ${filePath}`);
        }
    });
}

async function main() {
    const [signer] = await ethers.getSigners();

    const SenderFactory_Factory = await ethers.getContractFactory("SenderFactory");
    const senderFactory = await SenderFactory_Factory.deploy();
    await senderFactory.deployed();

    const EntryPointFactory = await ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPointFactory.deploy(senderFactory.address);
    await entryPoint.deployed();

    const SimpleAccountFactory_Factory = await ethers.getContractFactory("SimpleAccountFactory");
    const simpleAccountFactory = await SimpleAccountFactory_Factory.deploy(entryPoint.address);
    await simpleAccountFactory.deployed();

    const PaymasterFactory_Factory = await ethers.getContractFactory("PaymasterFactory");
    const paymasterFactory = await PaymasterFactory_Factory.deploy();
    await paymasterFactory.deployed();

    const tx = await paymasterFactory.createPaymaster(entryPoint.address);
    const receipt = await tx.wait();
    const paymasterAddress = receipt.events?.[0].args?.[0];

    console.log("=====================================");
    console.log("Deployer address:", signer.address);
    console.log("SenderFactory deployed to:", senderFactory.address);
    console.log("EntryPoint deployed to:", entryPoint.address);
    console.log("SimpleAccountFactory deployed to:", simpleAccountFactory.address);
    console.log("PaymasterFactory deployed to:", paymasterFactory.address);
    console.log("Paymaster deployed to:", paymasterAddress);
    console.log("=====================================");

    const deployments: Deployment = {
        network: ethers.provider.network.name,
        deployer: signer.address,
        senderFactory: {
            address: senderFactory.address,
            constructor: [],
        },
        entryPoint: {
            address: entryPoint.address,
            constructor: [senderFactory.address],
        },
        simpleAccountFactory: {
            address: simpleAccountFactory.address,
            constructor: [entryPoint.address],
        },
        paymasterFactory: {
            address: paymasterFactory.address,
            constructor: [],
        },
        paymaster: {
            address: paymasterAddress,
            constructor: [entryPoint.address, signer.address],
        },
    };

    saveJSON(deployments);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
