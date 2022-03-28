import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  // Get our default SVG
  const deployedFVDefaultSVG = await deployments.get("DefaultFlexibleDateVestingVoucherSVG");
  
  // Deploy FlexibleDateVestingVoucherDescriptor, only one is used for all FV vouchers
  var deployedCVDescriptor = await deploy('FlexibleDateVestingVoucherDescriptor', {
    from: deployer,
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedFVDefaultSVG.address]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_flexible_descriptor'; // id required to prevent reexecution
func.tags = ['FullDeployment', 'FullIVODeployment', 'FlexibleDescriptor'];
