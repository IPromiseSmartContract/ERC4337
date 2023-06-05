import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const SenderFactory = await ethers.getContractFactory("SenderFactory");
  const factory = await SenderFactory.deploy();
  await factory.deployed();


  const EntryPointFactory = await ethers.getContractFactory("EntryPoint");
  const entryPoint = await EntryPointFactory.deploy(factory.address,);
  await entryPoint.deployed();

  console.log("=====================================")
  console.log("Deployer address:", signer.address);
  console.log("SenderFactory deployed to:", factory.address);
  console.log("EntryPoint deployed to:", entryPoint.address);
  console.log("=====================================")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
