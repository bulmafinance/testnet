// ICToken is Investment Certificate Token, which is basically the voucher
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  const deployedSolver = await deployments.get("Solver");
  const deployedVestingPool = await deployments.get(`VestingPool_${config.erc20Token.name.replace(/\s/g, "")}`);

  await deploy(`ICToken_${config.erc20Token.name.replace(/\s/g, "")}`, {
    from: deployer,
    contract: "ICToken",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedSolver.address,
            deployedVestingPool.address,
            `${config.erc20Token.symbol} Investment Certificate`,
            `ic${config.erc20Token.symbol}`, `https://api.bulmafinance/ic${config.erc20Token.symbol}/`,
            `https://api.bulmafinance/ic${config.erc20Token.symbol}/meta/contract`]
      }
    },
    
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};

export default func;
func.id = 'deploy_vesting_pool'; // id required to prevent reexecution
func.tags = ["FullDeployment", "TestFullDeployment", "NewVoucher"];
