<template>
  <div>
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
                <v-text-field placeholder="Some Ether" clearable v-model="user.valueSend"></v-text-field>
              </v-flex>
              <v-flex>
                <v-btn
                  depressed
                  large
                  v-bind:color="getColor(index).name"
                  @click="splitHandle(index)"
                  :disabled="!validateValue(user.valueSend) || !user.isEnabled || user.isRunning"
                >{{ user.isRunning ? 'Sending...' : 'Split'}}</v-btn>
              </v-flex>
              <v-flex v-if="user.txHash.length > 0">
                <a
                  :href="`https://ropsten.etherscan.io/tx/${user.txHash}`"
                  style="text-decoration: none"
                  target="_blank"
                >
                  <v-chip color="red" text-color="white">Check on Etherscan</v-chip>
                </a>
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
              <v-flex v-if="usersContract.length > 0">
                <v-list two-line subheader>
                  <v-subheader>Contract</v-subheader>
                  <v-list-tile>
                    <v-list-tile-content>
                      <v-list-tile-title>{{ usersContract[0].account }}</v-list-tile-title>
                      <v-list-tile-sub-title>{{usersContract[0].balance}} ETH</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-flex>
              <v-flex>
                <v-list two-line subheader>
                  <v-subheader>Accounts</v-subheader>
                  <v-list-tile v-for="(user, index) in usersContract.slice(1)" :key="index">
                    <v-list-tile-content>
                      <v-list-tile-title>{{ user.account }}</v-list-tile-title>
                      <v-list-tile-sub-title>{{ user.balance }} ETH</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <div v-if="user.txHash.length > 0">
                      <a
                        :href="`https://ropsten.etherscan.io/tx/${user.txHash}`"
                        style="text-decoration: none"
                        target="_blank"
                      >
                        <v-chip color="red" text-color="white">Check on Etherscan</v-chip>
                      </a>
                    </div>
                    <v-btn
                      depressed
                      large
                      v-bind:color="getColor(index).name"
                      @click="withdrawHandle(index)"
                      :disabled="!validateValue(user.balance) || !user.isEnabled || user.isRunning"
                    >{{ user.isRunning ? 'Sending...' : 'Withdraw'}}</v-btn>
                  </v-list-tile>
                </v-list>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <v-footer class="pa-3">
      <v-spacer></v-spacer>
      <div>Daenam Kim, BLOCKSTARS-ETH-2 of B9lab 2019</div>
    </v-footer>
  </div>
</template>

<script>
import { hosts } from "../web3";
import { setInterval } from "timers";

/* eslint-disable no-console */
export default {
  name: "Splitter",
  data: () => ({
    web3: null,
    owner: null,
    users: [],
    splitterContract: null,
    usersContract: []
  }),
  async created() {
    this.web3 = await this.$root.$getWeb3();
    await this.initContract();
    await this.initAccounts();
  },
  methods: {
    async initContract() {
      this.splitterContract = await this.$root.$getContract();
      let accounts = await this.$root.$getAccounts();
      let info = {
        account: this.splitterContract.address,
        balance: this.toEther(
          await this.web3.eth.getBalance(this.splitterContract.address)
        ),
        isContract: true,
        isEnabled: true,
        isRunning: false,
        txHash: ""
      };
      this.usersContract.push(info);
      for (const account of accounts) {
        info = {
          account,
          balance: this.toEther(
            // do not use like "this.splitterContract.methods..accounts(this.splitterContract.address).call()"
            await this.splitterContract.accounts.call(
              this.splitterContract.address
            )
          ),
          isContract: false,
          isEnabled: true,
          isRunning: false,
          txHash: ""
        };
        this.usersContract.push(info);
      }

      // "Error: Subscriptions are not supported with the HttpProvider."
      // https://github.com/trufflesuite/truffle/issues/1633
      if (this.$root.$isHost(hosts.METAMASK)) {
        this.splitterContract.events
          .LogSplit(
            {
              fromBlock: "latest"
            },
            async (error, event) => {
              await this.updateUsers("split");
              console.log(error, event);
            }
          )
          .on("data", event => {
            console.log("data", event);
          })
          .on("changed", event => {
            console.log("changed", event);
          })
          .on("error", async error => {
            await this.updateUsers("split");
            console.error(error);
          });

        this.splitterContract.events
          .LogWithdraw(
            {
              fromBlock: "latest"
            },
            async (error, event) => {
              await this.updateUsers("withdraw");
              console.log(error, event);
            }
          )
          .on("data", event => {
            console.log("data", event);
          })
          .on("changed", event => {
            console.log("changed", event);
          })
          .on("error", async error => {
            await this.updateUsers("withdraw");
            console.error(error);
          });
      }
    },
    async initAccounts() {
      let accounts = await this.$root.$getAccounts();
      const names = ["Alice", "Bob", "Carol"];
      try {
        for (const i in accounts) {
          const user = {
            name: names[i],
            account: accounts[i],
            balance: this.toEther(await this.web3.eth.getBalance(accounts[i])),
            valueSend: 1,
            isEnabled: true,
            isRunning: false,
            txHash: ""
          };
          this.users.push(user);
        }
      } catch (error) {
        console.log(error);
      }

      // alternative solution for "Error: Subscriptions are not supported with the HttpProvider." in ganache env
      setInterval(async () => {
        this.updateUsers();
      }, 1000);
    },
    async validateAccount(account) {
      return this.$root.$isHost(hosts.GANACHE)
        ? true
        : account === (await this.web3.eth.getAccounts())[0];
    },
    async updateUsers(event = "") {
      for (const user of this.users) {
        user.balance = this.toEther(
          await this.web3.eth.getBalance(user.account)
        );
        user.isEnabled = await this.validateAccount(user.account);
        user.isRunning = event === "split" ? false : user.isRunning;
      }

      for (const user of this.usersContract) {
        user.balance = !user.isContract
          ? this.toEther(
              await this.splitterContract.accounts.call(user.account)
            )
          : this.toEther(await this.web3.eth.getBalance(user.account));
        user.isEnabled = await this.validateAccount(user.account);
        user.isRunning = event === "withdraw" ? false : user.isRunning;
      }
    },
    toEther(value) {
      return this.web3.utils.fromWei(String(value), "ether");
    },
    toWei(value) {
      return this.web3.utils.toWei(String(value), "ether");
    },
    getColor(index) {
      const colors = [
        { name: "purple", code: "#9c27b0" },
        { name: "indigo", code: "#3f51b5" },
        { name: "green lighten-2", code: "#81c784" }
      ];
      return colors[index % colors.length];
    },
    validateValue(value) {
      return !(isNaN(value) || !value || parseFloat(value) === 0);
    },
    async splitHandle(index) {
      if (!this.$root.$isHost(hosts.GANACHE) && this.users[index].isRunning) {
        return;
      }

      this.users[index].isRunning = this.$root.$isHost(hosts.GANACHE)
        ? false
        : true;
      const receivers = this.users.filter((_, i) => i !== index);
      try {
        // simulate first
        await this.splitterContract.split.call(
          receivers[0].account,
          receivers[1].account,
          {
            from: this.users[index].account,
            value: this.toWei(this.users[index].valueSend)
          }
        );
        await this.splitterContract
          .split(receivers[0].account, receivers[1].account, {
            from: this.users[index].account,
            value: this.toWei(this.users[index].valueSend)
          })
          .on("transactionHash", transactionHash => {
            if (!this.$root.$isHost(hosts.GANACHE)) {
              this.users[index].txHash = transactionHash;
            }
          });
      } catch (error) {
        this.users[index].isRunning = false;
        console.error(error);
      }
    },
    async withdrawHandle(index) {
      index += 1;
      if (
        !this.$root.$isHost(hosts.GANACHE) &&
        this.usersContract[index].isRunning
      ) {
        return;
      }

      this.usersContract[index].isRunning = this.$root.$isHost(hosts.GANACHE)
        ? false
        : true;
      try {
        // simulate first
        await this.splitterContract.withdraw.call({
          from: this.usersContract[index].account
        });
        await this.splitterContract
          .withdraw({ from: this.usersContract[index].account })
          .on("transactionHash", transactionHash => {
            if (!this.$root.$isHost(hosts.GANACHE)) {
              this.usersContract[index].txHash = transactionHash;
            }
          });
      } catch (error) {
        this.usersContract[index].isRunning = false;
        console.log(error);
      }
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
