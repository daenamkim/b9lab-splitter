import Web3 from 'web3';
import splitterAbi from '../../ethereum/build/contracts/Splitter.json';
import { Accounts } from 'web3-eth-accounts';

const CONTRACT_ADDR =
  process.env.NODE_ENV === 'development'
    ? '0xCfEB869F69431e42cdB54A4F4f105C19C080A601'
    : // CHANGE FOR DEV
      '0x99a17a2f365a3c72017fb4b163431cdb487b2505';
const ACCOUNTS = [
  // CHANGE FOR DEV
  '0x672b39F0D2609a6FeC23358f4b8D8c92104BAF56',
  '0x3F37278403BF4Fa7c2B8fa0D21Af353c554641A1',
  '0x5D0af8790F21375C65A75C3822d75fEe75BfC649'
];
let web3Created;

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
          if (process.env.NODE_ENV === 'development') {
            web3Created = new Web3('http://127.0.0.1:8545');
          } else {
            if (typeof window.web3 !== 'undefined') {
              web3Created = new Web3(window.web3.currentProvider);
            } else {
              web3Created = new Web3(
                `https://ropsten.infura.io/v3/${
                  process.env.VUE_APP_INFURA_API_KEY
                }`
              );
            }
          }

          // eslint-disable-next-line no-console
          console.log('Web3 initialized');
          resolve(web3Created);
        }, 100);
      });
    };

    Vue.prototype.$isHost = host => {
      return web3Created.eth.net.currentProvider.host.indexOf(host) > -1
        ? true
        : false;
    };

    Vue.prototype.$getAccounts = async () => {
      return process.env.NODE_ENV === 'development'
        ? // accounts[0] is owner of contract in ganache
          (await web3Created.eth.getAccounts()).slice(1, 4)
        : // await web3Created.eth.getAccounts(); // TODO: This is just return one address
          ACCOUNTS;
    };
    Vue.prototype.$getContract = () => {
      return new web3Created.eth.Contract(splitterAbi.abi, CONTRACT_ADDR);
    };
  }
};

export const hosts = {
  GANACHE: 'http://127.0.0.1',
  METAMASK: 'metamask',
  ROPSTEN: 'https://ropsten.infura.io'
};
