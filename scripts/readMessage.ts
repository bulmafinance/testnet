import {getUnnamedAccounts, ethers, getNamedAccounts} from 'hardhat';

const messages = ['Hello', '你好', 'سلام', 'здравствуйте', 'Habari', 'Bonjour', 'नमस्ते'];

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  const tx = await p;
  try {
    await ethers.provider.send('evm_mine', []); // speed up on local network
  } catch (e) {}
  return tx.wait();
}

async function main() {
    const { deployer, secondary } = await getNamedAccounts();
    const sender = deployer;
    console.log(deployer);

    const greetingsRegistryContract = await ethers.getContract('GreetingsRegistry', sender);

    await waitFor(greetingsRegistryContract.setMessage("_Yay!"));

    var res = await greetingsRegistryContract.messages(sender);

    console.log(res);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
