import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy('Solver', {
    from: deployer,
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      methodName: "initialize",
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });
};

export default func;
func.id = 'deploy_solver'; // id required to prevent reexecution
func.tags = ['FullDeployment','FullVestingVoucherDeployment', "FullIVODeployment", 'Solver'];
