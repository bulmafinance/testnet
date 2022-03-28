import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  // Get our IVOSolver
  var deployedIVOSolver = await deployments.get("IVOSolver");

  // Get our FlexibleDateVestingVoucherDescriptor
  var deployedFVDescriptor = await deployments.get("FlexibleDateVestingVoucherDescriptor");
  
  // Get our Vesting Voucher - this should be previously deployed
  var deployedVestingVoucher = await deployments.get(`ICToken_${config.erc20Token.name.replace(/\s/g, "")}`);

  // Deploy our CV pool
  var deployedFVPool = await deploy(`FlexibleDateVestingPool_${config.erc20Token.name.replace(/\s/g, "")}`, {
    from: deployer,
    contract: "FlexibleDateVestingPool",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedVestingVoucher.address]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // Finally, deploy our FV
  await deploy(`FlexibleDateVestingVoucher_${config.erc20Token.name.replace(/\s/g, "")}`, {
    from: deployer,
    contract: "FlexibleDateVestingVoucher",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedFVPool.address,
          deployedFVDescriptor.address,
          deployedIVOSolver.address,
          config.flexibleVoucher.unitDecimals,
          `${config.erc20Token.symbol} Flexible Date Vesting Voucher`,
          `fv${config.erc20Token.symbol}`]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};

export default func;
func.id = 'deploy_ivosolver'; // id required to prevent reexecution
func.tags = ['FullIVODeployment', 'IVOSolver'];
