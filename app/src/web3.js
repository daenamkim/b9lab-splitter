import Web3 from 'web3';
import splitterJson from '../../ethereum/build/contracts/Splitter.json';
import truffleContract from 'truffle-contract';

// TODO: replace with deployed()
const CONTRACT_ADDR = '0xCfEB869F69431e42cdB54A4F4f105C19C080A601';

export default {
  install: Vue => {
    window.isLoaded = false;
    window.addEventListener('load', () => {
      window.isLoaded = true;
    });

    Vue.prototype.$getWeb3 = () => {
      return new Promise(resolve => {
        const timer = setInterval(() => {
          if (!window.isLoaded) {
            return;
          }
          clearInterval(timer);
          // TODO: support Ganache only until adding user account process
          window.web3Created = new Web3('http://127.0.0.1:9545');

          // eslint-disable-next-line no-console
          console.log('web3 initialized as in window.web3Created');
          resolve(window.web3Created);
        }, 100);
      });
    };

    Vue.prototype.$isHost = host => {
      return window.web3Created.eth.net.currentProvider.host.indexOf(host) > -1
        ? true
        : false;
    };

    Vue.prototype.$getAccounts = async () => {
      return (await window.web3Created.eth.getAccounts()).slice(1, 4);
    };
    Vue.prototype.$getContract = () => {
      // TODO:
      // const SplitterContract = truffleContract(splitterJson);
      // SplitterContract.setProvider(window.web3Created.currentProvider);
      // return SplitterContract.deployed();
      return new window.web3Created.eth.Contract(
        splitterJson.abi,
        CONTRACT_ADDR
      );
    };
  }
};

export const hosts = {
  GANACHE: 'http://127.0.0.1',
  METAMASK: 'metamask',
  ROPSTEN: 'https://ropsten.infura.io'
};
