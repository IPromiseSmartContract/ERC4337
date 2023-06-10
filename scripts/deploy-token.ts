import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    const MPCTokenFactory = await ethers.getContractFactory("MPCToken", signer);
    const MPCToken = await MPCTokenFactory.deploy();
    await MPCToken.deployed();

    console.log("MPCToken deployed to:", MPCToken.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
