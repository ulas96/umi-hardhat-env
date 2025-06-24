const { ethers } = require("hardhat");
const {
  AccountAddress,
  EntryFunction,
  FixedBytes,
} = require("@aptos-labs/ts-sdk");
const { TransactionPayloadEntryFunction } = require("@aptos-labs/ts-sdk");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Calling initialize on Move contract");
  console.log("Account:", deployer.address);

  try {
    const addressWithoutPrefix = deployer.address.slice(2).toLowerCase();
    const paddedAddress = addressWithoutPrefix.padStart(64, "0");
    const moduleAddress = "0x" + paddedAddress;

    console.log("Module identifier:", `${moduleAddress}::Counter`);

    const address = AccountAddress.fromString(moduleAddress);
    const addressBytes = [33, 0, ...address.toUint8Array()];
    const signer = new FixedBytes(new Uint8Array(addressBytes));

    const entryFunction = EntryFunction.build(
      `${moduleAddress}::Counter`, // Capital C to match Move contract
      "initialize",
      [],
      [signer]
    );

    const transactionPayload = new TransactionPayloadEntryFunction(
      entryFunction
    );
    const payloadResult = transactionPayload.bcsToHex();

    const payload =
      "0x" +
      Array.from(payloadResult.data)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    const request = {
      to: deployer.address, // Send to your own address
      data: payload,
    };

    const tx = await deployer.sendTransaction(request);

    console.log("Transaction hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Receipt: ", receipt);
  } catch (error) {
    console.log("Error: ", error);
  }
}

main()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
