import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  // Get our default SVG
  const deployedCVDefaultSVG = await deployments.get("DefaultConvertibleVoucherSVG");
  
  // Deploy ConvertibleVoucherDescriptor, only one is used for all CV vouchers
  var deployedCVDescriptor = await deploy('ConvertibleVoucherDescriptor', {
    from: deployer,
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedCVDefaultSVG.address]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_convertible_descriptor'; // id required to prevent reexecution
func.tags = ['FullIVODeployment', 'ConvertibleDescriptor'];
