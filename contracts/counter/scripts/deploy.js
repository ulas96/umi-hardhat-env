const { ethers } = require("hardhat");
const {
  AccountAddress,
  EntryFunction,
  FixedBytes,
} = require("@aptos-labs/ts-sdk");
const { TransactionPayloadEntryFunction } = require("@aptos-labs/ts-sdk");

async function main() {
  const contractName = "counter";
  const [deployer] = await ethers.getSigners();
  const moduleAddress = deployer.address.replace(
    "0x",
    "0x000000000000000000000000"
  );

  const Counter = await ethers.getContractFactory(contractName);
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  console.log(`Counter is deployed to: ${deployer.address}::${contractName}`);

  const address = AccountAddress.fromString(moduleAddress);
  const addressBytes = [33, 0, ...address.toUint8Array()];
  const signer = new FixedBytes(new Uint8Array(addressBytes));

  const entryFunction = EntryFunction.build(
    `${moduleAddress}::${contractName}`,
    "initialize",
    [],
    [signer]
  );
  const transactionPayload = new TransactionPayloadEntryFunction(entryFunction);
  const payload = transactionPayload.bcsToHex();
  const request = {
    to: deployer.address,
    data: payload.toString(),
  };
  await deployer.sendTransaction(request);
  console.log("Initialize transaction sent");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
