# BulmaFinance Vouchers and Voucher Market Smart Contracts
## INSTALL

```bash
npm install
```

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

4. Deploy with: 
### Testnet (Stardust)
```bash
npx hardhat deploy --network stardust --tags <tag>
```

### Mainnet (Andromeda)
```bash
npx hardhat deploy --network andromeda --tags <tag>
```

## Contract Verification
### Testnet (Stardust)
```bash
npx hardhat etherscan-verify --network stardust --license MIT --solc-input
```

### Mainnet (Andromeda)
```bash
npx hardhat etherscan-verify --network andromeda --license MIT --solc-input
```