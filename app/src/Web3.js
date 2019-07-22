import Web3 from 'web3';
import splitterAbi from '../../ethereum/build/contracts/Splitter.json';

const CONTRACT_ADDR =
  process.env.NODE_ENV === 'ganache'
    ? '0xCfEB869F69431e42cdB54A4F4f105C19C080A601'
    : // CHANGE FOR DEV
      '0x99a17a2f365a3c72017fb4b163431cdb487b2505';

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
          const web3 = new Web3(
            process.env.NODE_ENV === 'ganache'
              ? 'http://127.0.0.1:8545'
              : window.web3
              ? window.web3.currentProvider
              : `https://ropsten.infura.io/v3/${
                  process.env.VUE_APP_INFURA_API_KEY
                }`
          );
          // eslint-disable-next-line no-console
          console.log('Web3 web3 initialized');
          resolve(web3);
        }, 100);
      });
    };

    Vue.prototype.$isHost = (web3, host) => {
      return web3.eth.net.currentProvider.host.indexOf(host) > -1
        ? true
        : false;
    };

    Vue.prototype.$getAccounts = async web3 => {
      return process.env.NODE_ENV === 'ganache'
        ? await web3.eth.getAccounts()
        : [
            // CHANGE FOR DEV
            '0x672b39F0D2609a6FeC23358f4b8D8c92104BAF56',
            '0x3F37278403BF4Fa7c2B8fa0D21Af353c554641A1',
            '0x5D0af8790F21375C65A75C3822d75fEe75BfC649'
          ];
    };
    Vue.prototype.$getContract = web3 => {
      return new web3.eth.Contract(splitterAbi.abi, CONTRACT_ADDR);
    };
  }
};

export const hosts = {
  GANACHE: 'http://127.0.0.1',
  METAMASK: 'metamask',
  ROPSTEN: 'https://ropsten.infura.io'
};
