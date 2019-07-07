<template>
  <v-container fluid>
    <v-layout text-xs-center justify-center row wrap>
      <v-flex
        xs12
        md6
        lg3
        mr-20
        v-for="(user, index) in users"
        :key="index"
        :name="index"
        margin
        padding
      >
        <v-card v-bind:color="getColor(index)" dark hover>
          <v-card-title primary class="title">{{ user.name }}</v-card-title>
          <v-layout align-center justify-center column>
            <v-flex xs12>
              <v-card-text>{{ user.account }}</v-card-text>
            </v-flex>
            <v-flex xs12 margin-bottom>Balance: {{ user.balance }} ETH</v-flex>
            <v-flex xs12>
              <v-text-field placeholder="Some Ether" clearable v-model="users[index].valueSend"></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-btn depressed large v-bind:color="getColor(index)" @click="splitEther(index)">Split</v-btn>
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
  "http://127.0.0.1:8545" /* TODO: add production on Ropsten? */
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
    contractAddr: "0xCfEB869F69431e42cdB54A4F4f105C19C080A601"
  }),
  async created() {
    await this.initAccounts();
    await this.initContract();
    await this.initUsers();
  },
  methods: {
    async initAccounts() {
      try {
        this.accounts = await web3.eth.getAccounts();
        this.owner = this.accounts[0];
      } catch (error) {
        console.error(error);
      }
    },
    async initContract() {
      if (!this.accounts || this.accounts.length < 10) {
        return;
      }

      this.splitterContract = new web3.eth.Contract(
        splitterAbi.abi,
        this.contractAddr,
        {
          defaultGasPrice: "20000000000"
        }
      );

      // TODO:
      // "Error: Subscriptions are not supported with the HttpProvider."
      // https://github.com/trufflesuite/truffle/issues/1633
      // this.splitterContract.events
      //   .EtherSplit(
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
    // TODO: in manual input mode?
    async initUsers() {
      if (
        !this.accounts ||
        this.accounts.length < 10 ||
        !this.splitterContract
      ) {
        return;
      }

      // index 0 is for owner
      this.accounts.slice(1, 4).forEach(async (account, index) => {
        try {
          await this.splitterContract.methods
            .registerUser(this.getName(index))
            .send({
              from: account,
              gas: "500000"
            });
        } catch (error) {
          // console.error(error);
        }
      });

      try {
        const usersFromContract = await this.splitterContract.methods.getAllUsers.call(
          {
            from: this.owner
          }
        );

        for (const userFromContract of usersFromContract) {
          const user = {
            name: userFromContract[0],
            account: userFromContract[1],
            balance: this.toEther(
              await web3.eth.getBalance(userFromContract[1])
            ),
            valueSend: 1
          };
          this.users.push(user);
        }
      } catch (error) {
        console.log(error);
      }

      // alternative solution for "Error: Subscriptions are not supported with the HttpProvider."
      setInterval(() => {
        this.updateBalances();
      }, 1000);
    },
    async updateBalances() {
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
    getName(index) {
      const names = ["Alice", "Bob", "Carol"];
      return names[index % names.length];
    },
    getColor(index) {
      const colors = ["purple", "indigo", "green lighten-2"];
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
