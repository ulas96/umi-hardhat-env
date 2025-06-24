const { ethers } = require("hardhat");
const { bcs } = require("@mysten/bcs");
const {
  AccountAddress,
  EntryFunction,
  FixedBytes,
} = require("@aptos-labs/ts-sdk");
const { TransactionPayloadEntryFunction } = require("@aptos-labs/ts-sdk");

const MoveCounter = bcs.struct("Counter", {
  value: bcs.u64(),
});

function extractOutput(data) {
  let uint8Array;
  if (typeof data === "string") {
    const hexString = data.startsWith("0x") ? data.slice(2) : data;
    uint8Array = new Uint8Array(
      hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
  } else if (Array.isArray(data)) {
    uint8Array = new Uint8Array(data);
  } else {
    uint8Array = new Uint8Array(data);
  }

  try {
    const vectorParser = bcs.vector(bcs.tuple([bcs.vector(bcs.u8())]));
    const parsed = vectorParser.parse(uint8Array);

    if (parsed.length > 0 && parsed[0].length > 0) {
      return new Uint8Array(parsed[0][0]);
    }
  } catch (error) {
    console.log("Vector parsing failed, trying direct parsing:", error.message);
  }

  return uint8Array;
}

async function fetchCounterValue() {
  const [deployer] = await ethers.getSigners();

  try {
    console.log("Account:", deployer.address);

    const addressWithoutPrefix = deployer.address.slice(2).toLowerCase();
    const paddedAddress = addressWithoutPrefix.padStart(64, "0");
    const moduleAddress = "0x" + paddedAddress;

    console.log("Module:", `${moduleAddress}::Counter`);

    const address = AccountAddress.fromString(moduleAddress);

    const entryFunction = EntryFunction.build(
      `${moduleAddress}::Counter`,
      "get",
      [],
      [address]
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
      to: deployer.address,
      data: payload,
    };

    const callResponse = await deployer.call(request);

    const output = extractOutput(callResponse);

    try {
      const counter = MoveCounter.parse(output);
      const counterValue = parseInt(counter.value);

      console.log("Decoded Counter Value:", counterValue);
      return counterValue;
    } catch (parseError) {
      console.log("BCS parsing failed:", parseError.message);

      try {
        const u64Value = bcs.u64().parse(output);
        const counterValue = parseInt(u64Value);
        console.log("Counter Value (as u64):", counterValue);
        return counterValue;
      } catch (u64Error) {
        console.log("u64 parsing also failed:", u64Error.message);

        if (output.length >= 8) {
          let value = 0n;
          for (let i = 0; i < 8; i++) {
            value += BigInt(output[i] || 0) << (BigInt(i) * 8n);
          }
          return parseInt(value.toString());
        }
      }
    }
  } catch (error) {
    console.log("Error fetching counter value:", error.message);
    return null;
  }
}

async function incrementAndCheckValue() {
  const [deployer] = await ethers.getSigners();

  try {
    console.log("Current Counter Value");
    const currentValue = await fetchCounterValue();

    console.log("Incrementing Counter");

    const addressWithoutPrefix = deployer.address.slice(2).toLowerCase();
    const paddedAddress = addressWithoutPrefix.padStart(64, "0");
    const moduleAddress = "0x" + paddedAddress;

    const address = AccountAddress.fromString(moduleAddress);
    const addressBytes = [33, 0, ...address.toUint8Array()];
    const signer = new FixedBytes(new Uint8Array(addressBytes));

    const entryFunction = EntryFunction.build(
      `${moduleAddress}::Counter`,
      "increment",
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
      to: deployer.address,
      data: payload,
    };

    const tx = await deployer.sendTransaction(request);
    console.log("Increment transaction:", tx.hash);

    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log("Increment successful!");

      console.log("New Counter Value");
      const newValue = await fetchCounterValue();

      if (currentValue !== null && newValue !== null) {
        console.log(`Counter changed from ${currentValue} to ${newValue}`);
      }
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

async function main() {
  await incrementAndCheckValue();
}

main()
  .then(() => {
    console.log("BCS decoding completed!");
  })
  .catch((error) => {
    console.error("Script failed:", error);
  });
