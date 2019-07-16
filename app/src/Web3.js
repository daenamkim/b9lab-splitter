import Web3 from 'web3';
import splitterAbi from '../../ethereum/build/contracts/Splitter.json';

const NETWORK = 'ropsten';
const CONTRACT_ADDR =
  process.env.NODE_ENV === 'ganache'
    ? '0xCfEB869F69431e42cdB54A4F4f105C19C080A601'
    : // CHANGE FOR DEV
      '0xB77E02c16d4a49fC54bA33FB6a86672D0daE152F';
const web3 = new Web3(
  process.env.NODE_ENV === 'ganache'
    ? 'http://127.0.0.1:8545'
    : window.web3
    ? window.web3.currentProvider
    : `https://ropsten.infura.io/v3/${process.env.VUE_APP_INFURA_API_KEY}`
);

export default web3;

export const getContract = () => {
  return new web3.eth.Contract(splitterAbi.abi, CONTRACT_ADDR, {
    defaultGasPrice: '200000'
  });
};

export const validateNetwork = async () => {
  return process.env.NODE_ENV === 'ganache'
    ? true
    : (await web3.eth.net.getNetworkType()) === NETWORK;
};

export const getAccounts = async () => {
  return process.env.NODE_ENV === 'ganache'
    ? await web3.eth.getAccounts()
    : [
        // CHANGE FOR DEV
        '0x672b39F0D2609a6FeC23358f4b8D8c92104BAF56',
        '0x3F37278403BF4Fa7c2B8fa0D21Af353c554641A1',
        '0x5D0af8790F21375C65A75C3822d75fEe75BfC649'
      ];
};

export const isHost = name => {
  return web3.eth.net.currentProvider === name ? true : false;
};
