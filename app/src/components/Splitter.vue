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
// import Web3 from "web3";
import web3, {
  validateNetwork,
  getAccounts,
  getContract,
  isHost,
  hosts
} from "../Web3";
import { setInterval } from "timers";

/* eslint-disable no-console */
export default {
  name: "Splitter",
  data: () => ({
    accountsProvider: [
      "0x672b39F0D2609a6FeC23358f4b8D8c92104BAF56",
      "0x3F37278403BF4Fa7c2B8fa0D21Af353c554641A1",
      "0x5D0af8790F21375C65A75C3822d75fEe75BfC649"
    ],
    owner: null,
    users: [],
    splitterContract: null,
    usersContract: []
  }),
  async created() {
    if (!(await validateNetwork())) {
      alert(`Please select your netowrk to ropsten`);
      return;
    }
    await this.initContract();
    await this.initAccounts();
  },
  async mounted() {},
  methods: {
    async initContract() {
      this.splitterContract = await getContract();

      let accounts;
      if (isHost(hosts.GANACHE)) {
        try {
          console.log("!!!!!!");
          accounts = await web3.eth.getAccounts();
          accounts = accounts.slice(1, 4);
        } catch (error) {
          console.error(error);
        }
      } else {
        accounts = this.accountsProvider;
      }

      let info = {
        account: this.splitterContract.address,
        balance: this.toEther(
          await web3.eth.getBalance(this.splitterContract.address)
        ),
        isContract: true,
        isEnabled: true,
        isRunning: false
      };
      this.usersContract.push(info);
      for (const account of accounts) {
        info = {
          account,
          balance: this.toEther(
            await this.splitterContract.methods
              .accounts(this.splitterContract.address)
              .call()
          ),
          isContract: false,
          isEnabled: true,
          isRunning: false
        };
        this.usersContract.push(info);
      }

      // "Error: Subscriptions are not supported with the HttpProvider."
      // https://github.com/trufflesuite/truffle/issues/1633
      if (isHost(hosts.METAMASK)) {
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
      let accounts = await getAccounts();
      // accounts[0] is owner of contract in ganache
      if (isHost(hosts.GANACHE)) {
        accounts = accounts.slice(1, 4);
      }

      const names = ["Alice", "Bob", "Carol"];
      try {
        for (const i in accounts) {
          const user = {
            name: names[i],
            account: accounts[i],
            balance: this.toEther(await web3.eth.getBalance(accounts[i])),
            valueSend: 1,
            isEnabled: true,
            isRunning: false
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
      return isHost(hosts.GANACHE)
        ? true
        : account === (await web3.eth.getAccounts())[0];
    },
    async updateUsers(event = "") {
      for (const user of this.users) {
        user.balance = this.toEther(await web3.eth.getBalance(user.account));
        user.isEnabled = await this.validateAccount(user.account);
        user.isRunning = event === "split" ? false : user.isRunning;
      }

      for (const user of this.usersContract) {
        user.balance = !user.isContract
          ? this.toEther(
              await this.splitterContract.methods.accounts(user.account).call()
            )
          : this.toEther(await web3.eth.getBalance(user.account));
        user.isEnabled = await this.validateAccount(user.account);
        user.isRunning = event === "withdraw" ? false : user.isRunning;
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
    validateValue(value) {
      return !(isNaN(value) || !value || parseFloat(value) === 0);
    },
    async splitHandle(index) {
      if (!isHost(hosts.GANACHE) && this.users[index].isRunning) {
        return;
      }

      this.users[index].isRunning = isHost(hosts.GANACHE) ? false : true;
      const receivers = this.users.filter((_, i) => i !== index);
      try {
        await this.splitterContract.methods
          .split(receivers[0].account, receivers[1].account)
          .send({
            from: this.users[index].account,
            value: this.toWei(this.users[index].valueSend)
          });
      } catch (error) {
        this.users[index].isRunning = false;
        console.error(error);
      }
    },
    async withdrawHandle(index) {
      index += 1;
      if (!isHost(hosts.GANACHE) && this.usersContract[index].isRunning) {
        return;
      }

      this.usersContract[index].isRunning = isHost(hosts.GANACHE)
        ? false
        : true;
      try {
        await this.splitterContract.methods
          .withdraw()
          .send({ from: this.usersContract[index].account });
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
