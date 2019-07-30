import Web3 from 'web3';
import splitterJson from '../../ethereum/build/contracts/Splitter.json';
import truffleContract from 'truffle-contract';

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
    Vue.prototype.$getContract = async () => {
      // note that  v1.0.0-beta.55 doesn't work! /T.T/
      // so for safety, do install truffle not install web3 alone
      // https://stackoverflow.com/questions/56245575/getting-error-when-try-to-deploy-contract-from-node-js-using-truffle-contract
      const SplitterContract = truffleContract(splitterJson);
      SplitterContract.setProvider(window.web3Created.currentProvider);
      return await SplitterContract.deployed();
    };
  }
};

export const hosts = {
  GANACHE: 'http://127.0.0.1',
  METAMASK: 'metamask',
  ROPSTEN: 'https://ropsten.infura.io'
};
