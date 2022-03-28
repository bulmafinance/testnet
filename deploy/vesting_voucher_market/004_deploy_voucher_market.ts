import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  const deployedSolver = await deployments.get("Solver");

  await deploy(`ICMarket`, {
    from: deployer,
    contract: "SolvICMarket",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedSolver.address]
      }
    },
    
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};

export default func;
func.id = 'deploy_vesting_pool'; // id required to prevent reexecution
func.tags = ["FullVestingVoucherDeployment", "Market"];
