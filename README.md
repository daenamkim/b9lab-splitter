![b9lab](./b9lab.png)

# B9lab Splitter

[![Netlify Status](https://api.netlify.com/api/v1/badges/d5e81b62-0c65-45ce-9fa3-0de46006bb9a/deploy-status)](https://app.netlify.com/sites/b9lab-splitter/deploys)

This is the first project of B9lab, BLOCKSTARS-ETH-2. :tada:

[Live Demo](https://splitter.oootoko.net)

### Basic

- there are 3 people: Alice, Bob and Carol.
- we can see the balance of the Splitter contract on the Web page.
- whenever Alice sends ether to the contract for it to be split, half of it goes to Bob and the other half to Carol.
- we can see the balances of Alice, Bob and Carol on the Web page.
- Alice can use the Web page to split her ether.

### App Development

```sh
$ cd app
$ yarn
```

```sh
$ yarn serve:ganache
```

And you need to run Ganache environment as well.
Open another terminal and run below,

```sh
$ yarn serve:ganache:eth
```

For running with MetaMask (Ropsten), just run below

```sh

$ yarn serve
```

If you want change network, contract address, account lists, you need to change below

```js
const NETWORK = 'ropsten';

// ...

const CONTRACT_ADDR =
  process.env.NODE_ENV === 'ganache'
    ? '0xCfEB869F69431e42cdB54A4F4f105C19C080A601'
    : // CHANGE FOR DEV
      '0xB77E02c16d4a49fC54bA33FB6a86672D0daE152F';

// ...

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
```

### Ethereum Solidity Development

Install all packages you need for development.

```sh
$ cd ethereum
$ yarn
```

Test, complile, deploy, and migrate a contract.

```sh
$ yarn test
```
