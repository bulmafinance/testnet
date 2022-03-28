import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  var erc20Address:String;

  if (config.erc20Token.deployNew) {
    // If we deployed this, we have the deployment files
    const deployedErc20 = await deployments.get(`ERC20_${config.erc20Token.name.replace(/\s/g, "")}`);
    erc20Address = deployedErc20.address;
  } else {
    // Already separately deployed ERC20, we use config.erc20Token.address
    erc20Address = config.erc20Token.address;
  }

  await deploy(`VestingPool_${config.erc20Token.name.replace(/\s/g, "")}`, {
    from: deployer,
    contract: "VestingPool",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [erc20Address]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};

export default func;
func.id = 'deploy_vesting_pool'; // id required to prevent reexecution
func.tags = ['FullDeployment', "FullVestingVoucherDeployment", "FullIVODeployment", "NewVestingVoucher", 'NewFlexibleVoucher', 'VestingPool'];
