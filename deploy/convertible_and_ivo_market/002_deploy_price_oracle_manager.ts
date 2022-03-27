import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy out default Manual Price Oracle (where prices of Convertible Voucher underlyings are manually set)
  var defaultManualPriceOracle = await deploy('ManualPriceOracle', {
    from: deployer,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // TODO: Deploy other oracles that are on Metis

  // Deploy our PriceOracleManager (which maps vouchers to their respective oracles for getting the price)
  await deploy('PriceOracleManager', {
    from: deployer,
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [defaultManualPriceOracle.address]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_price_oracle_manager'; // id required to prevent reexecution
func.tags = ['FullIVODeployment', 'PriceOracleManager'];
