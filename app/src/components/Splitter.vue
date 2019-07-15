<template>
  <v-container fluid>
    <v-layout text-xs-center justify-center row wrap>
      <v-flex xs12 md8 lg3 v-for="(user, index) in users" :key="index" padding>
        <v-card v-bind:color="getColor(index).name" dark hover>
          <v-card-title primary class="title">{{ user.name }}</v-card-title>
          <v-layout align-center justify-center column>
            <v-flex>
              <v-list two-line :style="{'background-color': getColor(index).code}">
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ user.account }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ user.balance }} ETH</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-flex>
            <v-flex>
              <v-text-field placeholder="Some Ether" clearable v-model="users[index].valueSend"></v-text-field>
            </v-flex>
            <v-flex>
              <v-btn
                depressed
                large
                v-bind:color="getColor(index).name"
                @click="splitEther(index)"
              >Split</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout text-xs-center justify-center row wrap>
      <v-flex xs12 md8 lg9 padding>
        <v-card dark hover>
          <v-card-title primary class="title">Deposit Info</v-card-title>
          <v-layout column padding>
            <v-flex v-if="depositInfo.length > 0">
              <v-list two-line subheader>
                <v-subheader>Contract</v-subheader>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ depositInfo[0].account }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{depositInfo[0].balance}} ETH</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-flex>
            <v-flex>
              <v-list two-line subheader>
                <v-subheader>Accounts</v-subheader>
                <v-list-tile v-for="(info, index) in depositInfo.slice(1)" :key="index">
                  <v-list-tile-content>
                    <v-list-tile-title>{{ info.account }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ info.balance }} ETH</v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-btn depressed large v-bind:color="getColor(index)">Withdraw</v-btn>
                </v-list-tile>
              </v-list>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Web3 from "web3";
let web3 = new Web3(
  "http://127.0.0.1:8545" // TODO: add staging and production on Ropsten
);
import splitterAbi from "../../../ethereum/build/contracts/Splitter.json";
import { setInterval } from "timers";

/* eslint-disable no-console */
export default {
  name: "Splitter",
  data: () => ({
    isRunning: false,
    owner: null,
    accounts: [],
    users: [],
    splitterContract: null,
    contractAddr: "0xCfEB869F69431e42cdB54A4F4f105C19C080A601", // TODO: reaplce in env variable
    depositInfo: []
  }),
  async created() {
    await this.initContract();
    await this.initAccounts();
  },
  methods: {
    async initContract() {
      this.splitterContract = new web3.eth.Contract(
        splitterAbi.abi,
        this.contractAddr,
        {
          defaultGasPrice: "200000"
        }
      );

      let accounts;
      try {
        accounts = await web3.eth.getAccounts();
        accounts = accounts.slice(1, 4);
      } catch (error) {
        console.error(error);
      }

      let info = {
        account: this.contractAddr,
        balance: this.toEther(await web3.eth.getBalance(this.contractAddr)),
        isContract: true
      };
      this.depositInfo.push(info);
      for (const account of accounts) {
        info = {
          account,
          balance: this.toEther(
            await this.splitterContract.methods
              .accounts(this.contractAddr)
              .call({ from: this.owner })
          ),
          isContract: false
        };
        this.depositInfo.push(info);
      }

      // TODO:
      // "Error: Subscriptions are not supported with the HttpProvider."
      // https://github.com/trufflesuite/truffle/issues/1633
      // this.splitterContract.events
      //   .LogSplit(
      //     {
      //       fromBlock: "latest"
      //     },
      //     (error, event) => {
      //       console.log(error, event);
      //       // TODO: update users
      //     }
      //   )
      //   .on("data", event => {
      //     console.log(event);
      //   })
      //   .on("changed", event => {
      //     console.log(event);
      //   })
      //   .on("error", console.error);
      // this.splitterContract.events
      //   .LogWithdraw(
      //     {
      //       fromBlock: "latest"
      //     },
      //     (error, event) => {
      //       console.log(error, event);
      //       // TODO: update users
      //     }
      //   )
      //   .on("data", event => {
      //     console.log(event);
      //   })
      //   .on("changed", event => {
      //     console.log(event);
      //   })
      //   .on("error", console.error);
    },
    async initAccounts() {
      let accounts;
      try {
        accounts = await web3.eth.getAccounts();
        this.owner = accounts[0];
        accounts = accounts.slice(1, 4);
      } catch (error) {
        console.error(error);
      }

      const names = ["Alice", "Bob", "Carol"];
      try {
        for (const i in accounts) {
          const user = {
            name: names[i],
            account: accounts[i],
            balance: this.toEther(await web3.eth.getBalance(accounts[i])),
            valueSend: 1
          };
          this.users.push(user);
        }
      } catch (error) {
        console.log(error);
      }

      // TODO: enable in dev mod only
      // alternative solution for "Error: Subscriptions are not supported with the HttpProvider."
      setInterval(() => {
        this.updateInfo();
      }, 1000);
    },
    async updateInfo() {
      for (const user of this.users) {
        user.balance = this.toEther(await web3.eth.getBalance(user.account));
      }
    },
    toEther(value) {
      return web3.utils.fromWei(String(value), "ether");
    },
    toWei(value) {
      return web3.utils.toWei(String(value), "ether");
    },
    getColor(index) {
      const colors = [
        { name: "purple", code: "#9c27b0" },
        { name: "indigo", code: "#3f51b5" },
        { name: "green lighten-2", code: "#81c784" }
      ];
      return colors[index % colors.length];
    },
    async splitEther(index) {
      // if (this.isRunning) {
      //   return;
      // }

      // this.isRunning = true;
      try {
        await this.splitterContract.methods.splitEther().send({
          from: this.users[index].account,
          value: this.toWei(this.users[index].valueSend)
        });
      } catch (error) {
        console.error(error);
      }
      // this.isRunning = false;
    }
  }
};
</script>

<style scoped>
.margin-bottom {
  margin-bottom: 30px;
}
.margin {
  margin: 10px;
}
.padding {
  padding: 10px;
}
.v-card {
  border-radius: 20px;
}
</style>
