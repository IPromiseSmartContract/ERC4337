import * as fs from "fs";
import type { Deployment } from "./types";
import { exec } from "child_process";
import { ethers, network } from "hardhat";
import type { Network } from "@ethersproject/networks";

function validateJsonFilePath(path: string): boolean {
    try {
        fs.accessSync(path, fs.constants.F_OK); // Validate if path exists
        return true;
    } catch (error) {
        return false;
    }
}

function readJsonFile(path: string): any {
    const data = fs.readFileSync(path, "utf-8");
    return JSON.parse(data);
}

async function executeCommand(command: string): Promise<void> {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Command execution error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Command execution stderr: ${stderr}`);
            return;
        }
        console.log(`Command execution stdout: ${stdout}`);
    });
}

async function verifyContract(deployment: Deployment, network: Network) {
    const prefix = `npx hardhat verify --network ${network.name}`;
    const senderFactoryCmd = `${prefix} ${deployment.senderFactory.address}`;
    const entryPointCmd = `${prefix} ${deployment.entryPoint.address} ${deployment.senderFactory.address}`;
    const simpleAccountFactoryCmd = `${prefix} ${deployment.simpleAccountFactory.address} ${deployment.entryPoint.address}`;
    const paymasterFactoryCmd = `${prefix} ${deployment.paymasterFactory.address}`;

    await Promise.all([
        executeCommand(senderFactoryCmd),
        executeCommand(entryPointCmd),
        executeCommand(simpleAccountFactoryCmd),
        executeCommand(paymasterFactoryCmd),
    ]);
}

async function main() {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    readline.question("Please enter the path to the JSON file: ", async (path: string) => {
        if (validateJsonFilePath(path)) {
            const deployment = readJsonFile(path) as Deployment;
            console.log("Successfully read JSON file:", deployment);
            const network = await ethers.provider.getNetwork();
            if (deployment.network !== network.name) {
                console.error(
                    "[VERIFY] Network in JSON file is '%s', but current network is '%s'",
                    deployment.network,
                    network.name
                );
                throw new Error("[VERIFY] Network mismatch, ");
            }
            await verifyContract(deployment, network);
        } else {
            console.error("[VERIFY] Path does not exist or cannot read JSON file");
        }

        readline.close();
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
