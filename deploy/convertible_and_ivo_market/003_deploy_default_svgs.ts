import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy our default CV SVG
  await deploy('DefaultConvertibleVoucherSVG', {
    from: deployer,
    args: ["#C53DAB", "#973DC5", "#1CCE9A"], // These values were taken from Solv's default CV SVG contract
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // Deploy our default FV SVG
  await deploy('DefaultFlexibleDateVestingVoucherSVG', {
    from: deployer,
    args: ["#C53DAB", "#91CCFF", "#1CCE9A"], // These values were taken from Solv's default FV SVG contract
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_default_svgs'; // id required to prevent reexecution
func.tags = ['FullIVODeployment', 'DefaultSVGs'];
