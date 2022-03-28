import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../../configs/current';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { deployments } = await hre;

  // Get our IVOSolver
  var deployedIVOSolver = await deployments.get("IVOSolver");

  // Get our ConvertibleVoucherDescriptor
  var deployedCVDescriptor = await deployments.get("ConvertibleVoucherDescriptor");

  // Get our deployed token, or token address
  var erc20Address:String;
  if (config.erc20Token.deployNew) {
    // If we deployed this, we have the deployment files
    const deployedErc20 = await deployments.get(`ERC20_${config.erc20Token.name.replace(/\s/g, "")}`);
    erc20Address = deployedErc20.address;
  } else {
    // Already separately deployed ERC20, we use config.erc20Token.address
    erc20Address = config.erc20Token.address;
  }

  // Get our PriceOracleManager
  const deployedPriceOracleManager = await deployments.get("PriceOracleManager");

  // Deploy our CV pool
  var deployedCVPool = await deploy(`ConvertiblePool_${config.erc20Token.name.replace(/\s/g, "")}`, {
    from: deployer,
    contract: "ConvertiblePool",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [erc20Address, deployedPriceOracleManager.address, config.convertibleVoucher.priceDecimals, config.convertibleVoucher.valueDecimals]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // Finally, deploy our CV
  await deploy(`ConvertibleVoucher_${config.erc20Token.name.replace(/\s/g, "")}`, {
    from: deployer,
    contract: "ConvertibleVoucher",
    proxy: {
      proxyContract: "AdminUpgradeabilityProxy",
      viaAdminContract: 'ProxyAdmin',
      execute: {
        methodName: "initialize",
        args: [deployedCVPool.address,
          deployedCVDescriptor.address,
          deployedIVOSolver.address,
          config.convertibleVoucher.unitDecimals,
          `${config.erc20Token.symbol} Convertible Voucher`,
          `cv${config.erc20Token.symbol}`]
      }
    },
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};

export default func;
func.id = 'deploy_ivosolver'; // id required to prevent reexecution
func.tags = ['FullIVODeployment', 'IVOSolver'];
