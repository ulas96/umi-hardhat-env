# umi-hardhat-env

Hardhat development environment for deploying Move smart contracts on UMI Network.

## Get Devnet Token

- To get tokens from faucet, go to https://faucet.uminetwork.com/.

- Connect your twitter account.

- Register your account address.

- Bridge your devnet tokens to UMI Devnet.

## Install Aptos CLI

- To install Aptos CLI:

`curl -fsSL "https://aptos.dev/scripts/install_cli.sh" | sh`

- To verify the installation:

`aptos help`

- If `aptos` is not automatically added as path varaible, it can be added with the following command. The path of the saved bin file is shown after installing Aptos CLI. Shell configuration file may be updated according to your configuration, in this case it is `~/.zshrc`

`echo 'export PATH="$PATH:/path/to/bin/file"' >> ~/.zshrc`

## Add Private Key to .env

**This is for development purposes only! Do not hardcode your actuall private key to anywhere!**

- To create a .env file:

`touch .env`

- To add your development private key to .env file, add following to your .env file and replace `dev-private-key` with your development private key:

`PRIVATE_KEY= "dev-private-key"`

## Change Acount Address in Move.toml:

- Change the account address in Move.toml, replace `dev-account-address` with your dev account address:

`[addresses]
dev = "dev-account-address"`

## Install Dependencies

- To install node_modules, on the top of directory:

`npm install`

- To verify dependecy installation:

`npx hardhat compile`

## Deploy Contracts

- To deploy contract, run the following command at the top of directory:

`npx hardhat run contracts/counter/scripts/deploy.js`
