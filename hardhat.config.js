require("@nomicfoundation/hardhat-toolbox");
require("@moved/hardhat-plugin");
require("dotenv").config();

module.exports = {
  defaultNetwork: "devnet",
  networks: {
    devnet: {
      url: "https://devnet.moved.network",
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
