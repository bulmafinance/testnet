import 'dotenv/config';
import {HardhatUserConfig, task} from 'hardhat/config';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import "@nomiclabs/hardhat-etherscan";
import 'hardhat-gas-reporter';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-deploy-tenderly';

const PRIVATE_KEY = process.env.PRIVATE_KEY! || '0000000000000000000000000000000000000000000000000000000000000000'
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2! || '0000000000000000000000000000000000000000000000000000000000000000'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const RINKEBY_INFURA_URL = process.env.RINKEBY_INFURA_URL || '';

task(
  "hello",
  "Prints 'Hello, World!'",
  async function (taskArguments, hre, runSuper) {
    console.log("Hello, World!");
  }
);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
    // ERC20 overrides
    overrides: {
      "src/token/ERC20Token.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
         }
      },

      // Vesting Voucher overrides
      "src/voucher/ICToken.sol": { // This is needed because ICToken contract code size exceeds 24576. This setting is also applied in solv's code
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
         }
      },
      "src/solver/Solver.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      },

      // IVO, Convertible and Flexible Vouchers overrides
      "src/ivo/commons/solver/IVOSolver.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }
      },
      "src/ivo/vouchers/convertible-voucher/oracle/ManualPriceOracle.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/convertible-voucher/oracle/PriceOracleManager.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },

      // Convertible Voucher overrides
      "src/ivo/vouchers/convertible-voucher/svgs/DefaultConvertibleVoucherSVG.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/convertible-voucher/ConveritbleVoucherDescriptor.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/convertible-voucher/ConvertiblePool.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/convertible-voucher/ConvertibleVoucher.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },

      // Flexible Vouchers overrides
      "src/ivo/vouchers/flexible-date-vesting-voucher/svgs/DefaultFlexibleDateVestingVoucherSVG.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/flexible-date-vesting-voucher/FlexibleDateVestingPool.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/flexible-date-vesting-voucher/FlexibleDateVestingVoucher.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/vouchers/flexible-date-vesting-voucher/FlexibleDateVestingVoucherDescriptor.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },

      // Markets
      "src/ivo/markets/vesting-offering-market/InitialVestingOfferingMarket.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/markets/convertible-offering-market/InitialConvertibleOfferingMarket.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
      "src/ivo/markets/convertible-marketplace/SolvConvertibleMarket.sol": {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        }
      },
    }
  },
  namedAccounts: {
    deployer: 0,
    secondary: 1 
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
    },
    localhost: {
      accounts: [PRIVATE_KEY, PRIVATE_KEY2],
    },
    rinkeby: {
      url: RINKEBY_INFURA_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY2],
    },
    stardust: {
      url: "https://stardust.metis.io/?owner=588",
      accounts:
        [PRIVATE_KEY, PRIVATE_KEY2],
      verify: {
        etherscan: {
          apiKey: "api-key",
          apiUrl: "https://stardust-explorer.metis.io",
        },
      },
    },
    andromeda: {
      url: "https://andromeda.metis.io/?owner=1088",
      accounts:
        [PRIVATE_KEY, PRIVATE_KEY2],
      verify: {
        etherscan: {
          apiKey: "api-key",
          apiUrl: "https://andromeda-explorer.metis.io",
        },
      },
    },
  },
  paths: {
    sources: 'src',
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 0,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
