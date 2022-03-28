import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  if (config.erc20Token.deployNew) {
    await deploy(`ERC20_${config.erc20Token.name.replace(/\s/g, "")}`, {
      contract: "ERC20Token",
      from: deployer,
      log: true,
      args: [deployer, config.erc20Token.name, config.erc20Token.symbol, config.erc20Token.totalSupply],
      autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });
  }
};

export default func;
func.id = 'deploy_erc20_token'; // id required to prevent reexecution
func.tags = ['FullDeployment', 'FullVestingVoucherDeployment', 'FullIVODeployment', 'NewVestingVoucher', 'NewFlexibleVoucher', 'NewConvertibleVoucher', 'ERC20Token', ];
