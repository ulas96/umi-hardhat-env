const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Move contract with account:", deployer.address);

  try {
    const Counter = await ethers.getContractFactory("counter");
    const counter = await Counter.deploy();

    const contractAddress = await counter.getAddress();
    console.log(`Contract address: ${contractAddress}`);
    console.log(`Module address: ${deployer.address}::Counter`);

    const deployTx = counter.deploymentTransaction();
    if (deployTx) {
      const receipt = await deployTx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    }
  } catch (error) {
    console.log(error);
  }
}
main().then(() => {
  console.log("Deployment completed successfully");
});
