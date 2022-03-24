# Notes

## Deployment
1. Create a deployment config in ./configs/all
2. Copy-Paste it to ./configs/current.ts - this will be the current config used
3. Use the following hardhat-deploy tags (e.g. ```--tags <tag>```):
    - ```FullDeployment```: A new complete deployment - deploys "ERC20Token" if enabled in config, then deploys "Solver", "VestingPool", "ICToken" and "Market"
    - ```NewVoucher```: Only deploys contracts for creating a new Voucher with the ERC20 token underlying specified in config - deploys "ERC20Token" if enabled in config, then deploys "VestingPool" and "ICToken" while reusing the same "Solver" and "Market"
    - ```ERC20Token```: Only deploy "ERC20Token"
    - ```Solver```: Only deploy "Solver"
    - ```VestingPool```: Only deploy "VestingPool" 
    - ```ICToken```: Only deploy "ICToken" 
    - ```Market```: Only deploy "Market"

4. Deploy with ```npx hardhat deploy --network stardust --tags <tag>```

## Contract Verification
### Testnet (Stardust)
```bash
npx hardhat etherscan-verify --network stardust --license MIT --solc-input
```

### Mainnet (Andromeda)
```bash
npx hardhat etherscan-verify --network andromeda --license MIT --solc-input
```

# Boilerplate for ethereum solidity smart contract development

## INSTALL

```bash
yarn
```

## TEST

There are 3 flavors of tests: hardhat, dapptools and forge

### hardhat

- One using hardhat that can leverage hardhat-deploy to reuse deployment procedures and named accounts:

```bash
yarn test
```

### [dapptools](https://dapp.tools)

```bash
dapp test
```

The latter requires additional step to set up your machine:

Install dapptools (Following instruction [here](https://github.com/dapphub/dapptools#installation)):

```bash
# user must be in sudoers
curl -L https://nixos.org/nix/install | sh

# Run this or login again to use Nix
. "$HOME/.nix-profile/etc/profile.d/nix.sh"

curl https://dapp.tools/install | sh
```

Then install solc with the correct version:

```bash
nix-env -f https://github.com/dapphub/dapptools/archive/master.tar.gz -iA solc-static-versions.solc_0_8_9
```

### forge

```bash
forge test
```

This require the installation of forge (see [foundry](https://github.com/gakonst/foundry))

## SCRIPTS

Here is the list of npm scripts you can execute:

Some of them relies on [./\_scripts.js](./_scripts.js) to allow parameterizing it via command line argument (have a look inside if you need modifications)
<br/><br/>

### `yarn prepare`

As a standard lifecycle npm script, it is executed automatically upon install. It generate config file and typechain to get you started with type safe contract interactions
<br/><br/>

### `yarn lint`, `yarn lint:fix`, `yarn format` and `yarn format:fix`

These will lint and format check your code. the `:fix` version will modifiy the files to match the requirement specified in `.eslintrc` and `.prettierrc.`
<br/><br/>

### `yarn compile`

These will compile your contracts
<br/><br/>

### `yarn void:deploy`

This will deploy your contracts on the in-memory hardhat network and exit, leaving no trace. quick way to ensure deployments work as intended without consequences
<br/><br/>

### `yarn test [mocha args...]`

These will execute your tests using mocha. you can pass extra arguments to mocha
<br/><br/>

### `yarn coverage`

These will produce a coverage report in the `coverage/` folder
<br/><br/>

### `yarn gas`

These will produce a gas report for function used in the tests
<br/><br/>

### `yarn dev`

These will run a local hardhat network on `localhost:8545` and deploy your contracts on it. Plus it will watch for any changes and redeploy them.
<br/><br/>

### `yarn local:dev`

This assumes a local node it running on `localhost:8545`. It will deploy your contracts on it. Plus it will watch for any changes and redeploy them.
<br/><br/>

### `yarn execute <network> <file.ts> [args...]`

This will execute the script `<file.ts>` against the specified network
<br/><br/>

### `yarn deploy <network> [args...]`

This will deploy the contract on the specified network.

Behind the scene it uses `hardhat deploy` command so you can append any argument for it
<br/><br/>

### `yarn export <network> <file.json>`

This will export the abi+address of deployed contract to `<file.json>`
<br/><br/>

### `yarn fork:execute <network> [--blockNumber <blockNumber>] [--deploy] <file.ts> [args...]`

This will execute the script `<file.ts>` against a temporary fork of the specified network

if `--deploy` is used, deploy scripts will be executed
<br/><br/>

### `yarn fork:deploy <network> [--blockNumber <blockNumber>] [args...]`

This will deploy the contract against a temporary fork of the specified network.

Behind the scene it uses `hardhat deploy` command so you can append any argument for it
<br/><br/>

### `yarn fork:test <network> [--blockNumber <blockNumber>] [mocha args...]`

This will test the contract against a temporary fork of the specified network.
<br/><br/>

### `yarn fork:dev <network> [--blockNumber <blockNumber>] [args...]`

This will deploy the contract against a fork of the specified network and it will keep running as a node.

Behind the scene it uses `hardhat node` command so you can append any argument for it
