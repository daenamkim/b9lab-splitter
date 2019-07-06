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

// import splitterAbi from "../../../ethereum/build/contracts/Splitter.json";

/* eslint-disable no-console */
export default {
  name: "Splitter",
  data: () => ({
    accounts: [],
    users: [],
    splitterContract: null,
    contractAddr: "0x287055250DBABA0284128ce0FD83Cf2150d34F2E"
  }),
  async created() {
    await this.initAccounts();
    await this.initContract();
    await this.updateUsers();
  },
  methods: {
    async initAccounts() {
      try {
        this.accounts = await web3.eth.getAccounts();
        console.log(this.accounts);
      } catch (error) {
        console.error(error);
      }
    },
    async initContract() {
      // TODO: make this work on dev and prod
      // link to contract depoyed
      // this.splitterContract = new web3.eth.Contract(
      //   splitterAbi.abi,
      //   this.contractAddr // TODO: make this automatically
      // );
      // await this.splitterContract.methods.registerUser("Alice", {
      //   from: this.accounts[1]
      // });
      // await this.splitterContract.methods.registerUser("Bob", {
      //   from: this.accounts[2]
      // });
      // await this.splitterContract.methods.registerUser("Carol", {
      //   from: this.accounts[3]
      // });
      // console.log(
      //   await this.splitterContract.methods.getAllUsers.call({
      //     from: this.accounts[0]
      //   })
      // );
      // TODO: finish split tests!!!!!
      // await this.splitterContract.methods.splitEther({
      //   from: this.accounts[1],
      //   value: 10000000000000000000
      // });
    },
    async updateUsers() {
      this.users = [
        {
          name: "Alice",
          account: this.accounts[1],
          balance: this.toEther(await web3.eth.getBalance(this.accounts[1])),
          valueSend: 1
        },
        {
          name: "Bob",
          account: this.accounts[2],
          balance: this.toEther(await web3.eth.getBalance(this.accounts[2])),
          valueSend: 1
        },
        {
          name: "Carol",
          account: this.accounts[3],
          balance: this.toEther(await web3.eth.getBalance(this.accounts[3])),
          valueSend: 1
        }
      ];
    },
    toEther(value) {
      return web3.utils.fromWei(value, "ether");
    },
    toWei(value) {
      return web3.utils.toWei(value, "ether");
    },
    getColor(index) {
      const colors = ["purple", "indigo", "green lighten-2"];
      return colors[index % colors.length];
    },
    async splitEther(index) {
      // try {
      //   await this.splitterContract.methods.splitEther({
      //     from: this.accounts[1],
      //     value: 5000000000000000000
      //   });

      //   console.log(
      //     await web3.eth.getBalance(this.accounts[0]),
      //     await web3.eth.getBalance(this.accounts[1]),
      //     await web3.eth.getBalance(this.accounts[2]),
      //     await web3.eth.getBalance(this.accounts[3])
      //   );
      // } catch (error) {
      //   console.error(error);
      // }

      // test direct transfer
      for (let i = 0; i < this.users.length; i++) {
        if (index !== i) {
          web3.eth.sendTransaction(
            {
              from: this.users[index].account,
              to: this.users[i].account,
              value: this.toWei(
                String(
                  parseInt(this.users[index].valueSend) /
                    (this.users.length - 1)
                )
              )
            },
            async (error, hash) => {
              this.updateUsers();
              console.log(error, hash);
            }
          );
        }
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
