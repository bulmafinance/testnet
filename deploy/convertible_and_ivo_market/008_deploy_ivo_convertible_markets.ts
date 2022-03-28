import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  const deployedIVOSolver = await deployments.get("IVOSolver");

  // Deploy the IVO market
  await deploy(`InitialVestingOfferingMarket`, {
    from: deployer,
    contract: "InitialVestingOfferingMarket",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedIVOSolver.address]
      }
    },
    
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // Deploy the Initial Convertible Offering Market
  await deploy(`InitialConvertibleOfferingMarket`, {
    from: deployer,
    contract: "InitialConvertibleOfferingMarket",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedIVOSolver.address]
      }
    },
    
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // Deploy the Convertible Marketplace
  await deploy(`SolvConvertibleMarketplace`, {
    from: deployer,
    contract: "SolvConvertibleMarketplace",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedIVOSolver.address]
      }
    },
    
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};

export default func;
func.id = 'deploy_vesting_pool'; // id required to prevent reexecution
func.tags = ["FullVoucherDeployment", "Market"];
