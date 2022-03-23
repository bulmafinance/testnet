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
            runs: 2000,
          },
        },
      },
    ],
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
    },
    andromeda: {
      url: "https://andromeda.metis.io/?owner=1088",
      accounts:
        [PRIVATE_KEY, PRIVATE_KEY2],
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
