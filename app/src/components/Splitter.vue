<template>
  <v-container fluid>
    <v-layout text-xs-center justify-center row wrap>
      <v-flex
        xs12
        md3
        mr-20
        v-for="(user, index) in users"
        :key="index"
        :name="index"
        margin
        padding
      >
        <v-card v-bind:color="user[3]" dark>
          <v-card-title primary class="title">{{ user[0] }}</v-card-title>
          <v-layout align-center justify-center column>
            <v-flex xs12>
              <v-card-text>{{ user[1] }}</v-card-text>
            </v-flex>
            <v-flex xs12 margin-bottom>Balance: {{ user[2] }} ETH</v-flex>
            <v-flex xs12>
              <v-text-field placeholder="Some Ether"></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-btn depressed large v-bind:color="user[3]" @click="sendEther(index)">Contribute</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout text-xs-center>
      <v-flex margin>
        <v-spacer />
        <v-chip outline color="red">Contract Balance: {{ balance }} ETH</v-chip>
        <v-spacer />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Web3 from "web3";
let web3 = new Web3("http://127.0.0.1:8545");

// const web3 = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
import splitterAbi from "../../../ethereum/build/contracts/Splitter.json";

export default {
  name: "Splitter",
  data: () => ({
    accounts: [],
    users: [],
    balance: 0,
    splitterContract: null
  }),
  async created() {
    // TODO: make this work on dev and prod
    // link to contract depoyed
    this.splitterContract = new web3.eth.Contract(
      splitterAbi.abi,
      "0x9f3651972CefaF701018B6470F6f2306FfB9b12c" // TODO: make this automatically
    );

    // register users
    try {
      this.accounts = await web3.eth.getAccounts();

      // TODO: need to fix this
      // TODO: is this good?
      await this.splitterContract.methods.registerUser("Alice", {
        from: this.accounts[1]
      });
      await this.splitterContract.methods.registerUser("Bob", {
        from: this.accounts[2]
      });
      await this.splitterContract.methods.registerUser("Carol", {
        from: this.accounts[3]
      });
    } catch (error) {
      console.log(error);
    }

    // get all users
    try {
      this.users = await this.splitterContract.methods.getAllUsers.call({
        from: this.accounts[0]
      });
    } catch (error) {
      console.error(error);
    }

    // get the balance of the contract
    try {
      this.balance = (await this.splitterContract.methods.getBalance.call({
        from: this.accounts[0]
      })).toString();
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    sendEther(index) {
      // TODO:
      alert(index);
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
</style>
