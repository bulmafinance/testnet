# BulmaFinance Vouchers, Voucher Market and Initial Voucher Offering (IVO) Smart Contracts
## Install

```bash
npm install
```

## Deployment
1. Copy ".env.example" and rename as ".env". Fill in the environment variables. 
2. Create a deployment config in ./configs/all
3. Copy-Paste the contents to ./configs/current.ts - this will be the current config used
4. Use any of the following hardhat-deploy tags (e.g. ```--tags <tag>```):
    - ```FullDeployment```: Deploys everything - used for testing.
    - Vesting Vouchers and Market (Complete Deployments):
        - ```FullVestingVoucherDeployment```: A new complete deployment - deploys "ERC20Token" if enabled in config, then deploys "Solver", "VestingPool", "ICToken" and "Market"
        - ```NewVestingVoucher```: Only deploys contracts for creating a new Vesting Voucher with the ERC20 token underlying specified in config - deploys "ERC20Token" if enabled in config, then deploys "VestingPool" and "ICToken" while reusing the same "Solver"
    - Vesting Vouchers and Market (Individual Deployments):
        - ```ERC20Token```: Only deploy "ERC20Token"
        - ```Solver```: Only deploy "Solver"
        - ```VestingPool```: Only deploy "VestingPool" 
        - ```ICToken```: Only deploy "ICToken" 
        - ```Market```: Only deploy "Market"
    - IVO, Flexible & Convertible Vouchers and Markets (Complete Deployments):
        - ```FullIVODeployment```: A new complete deployment for IVOs, Flexible and Convertible Vouchers and Markets - deploys "ERC20Token" if enabled in config, then deploys "IVOSolver", "PriceOracleManager" followed by a Convertible Voucher, Flexible Voucher, and IVO and Convertible Voucher Markets.
        - ```NewConvertibleVoucher```: Only deploys contracts for creating a new Convertible Voucher with the ERC20 token underlying specified in config - deploys "ERC20Token" if enabled in config, then deploys a Convertible Voucher.
        - ```NewFlexibleVoucher```: Only deploys contracts for creating a new Flexible Voucher with the ERC20 token underlying specified in config - deploys "ERC20Token" if enabled in config, then deploys a Vesting Voucher followed by a Flexible Voucher.
    - IVO, Flexible & Convertible Vouchers and Markets (Individual Deployments):
        - ```IVOSolver```: Only deploy "IVOSolver"
        - ```PriceOracleManager```: Only deploy "PriceOracleManager"
        - ```DefaultSVGs```: Only deploy "DefaultSVGs" 
        - ```ConvertibleDescriptor```: Only deploy "ConvertibleDescriptor" 
        - ```FlexibleDescriptor```: Only deploy "FlexibleDescriptor"
        - ```IVOMarkets```: Only deploy "IVOMarkets"

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
npx hardhat etherscan-verify --network stardust --license MIT --solc-input --sleep
```

### Mainnet (Andromeda)
```bash
npx hardhat etherscan-verify --network andromeda --license MIT --solc-input --sleep
```

## Deployment Tests
Test the following deployments to test deployments:

1. ```FullDeployment```
2. ```FullVestingVoucherDeployment```, ```FullIVODeployment```, then change config and deploy ```NewVestingVoucher```, ```NewConvertibleVoucher```, ```NewFlexibleVoucher```

## Todos
- [] Implement missing functions in StringConvertor.sol
- [] Implement a new price Oracle for Metis network. It should inherit from IPriceManager.
