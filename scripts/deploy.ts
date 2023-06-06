import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const SenderFactory = await ethers.getContractFactory("SenderFactory");
  const factory = await SenderFactory.deploy();
  await factory.deployed();


  const EntryPointFactory = await ethers.getContractFactory("EntryPoint");
  const entryPoint = await EntryPointFactory.deploy(factory.address,);
  await entryPoint.deployed();

  const SimpleAccountFactory_Factory = await ethers.getContractFactory("SimpleAccountFactory");
  const simpleAccountFactory = await SimpleAccountFactory_Factory.deploy('0x9FA609A4430218a20aF170e246c1E35fbaCc3485');
  await simpleAccountFactory.deployed();

  const PaymasterFactory_Factory = await ethers.getContractFactory("PaymasterFactory");
  const paymasterFactory = await PaymasterFactory_Factory.deploy();
  await paymasterFactory.deployed();

  console.log("=====================================")
  console.log("Deployer address:", signer.address);
  // console.log("SenderFactory deployed to:", factory.address);
  // console.log("EntryPoint deployed to:", entryPoint.address);
  console.log("SimpleAccountFactory deployed to:", simpleAccountFactory.address);
  console.log("PaymasterFactory deployed to:", paymasterFactory.address);
  console.log("=====================================")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
