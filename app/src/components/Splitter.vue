<template>
  <v-container fluid>
    <v-layout text-xs-center justify-center row wrap>
      <v-flex xs12 md3 mr-20 v-for="(user, index) in users" :key="index" :name="index">
        <v-card v-bind:color="user[3]" dark>
          <v-card-title primary class="title">{{ user[0] }}</v-card-title>
          <v-card-text>{{ user[1] }}</v-card-text>
          <v-card-text>Balance: {{ user[2] }}</v-card-text>
          <v-btn depressed large v-bind:color="user[3]" @click="sendEther(index)">Contribute</v-btn>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout></v-layout>
  </v-container>
</template>

<script>
import Web3 from "web3";
const web3 = new Web3("http://127.0.0.1:8545");

export default {
  name: "Splitter",
  data: () => ({
    users: []
  }),
  async created() {
    // TODO: dummy
    this.users = [
      ["Alice", "Address", "0", "purple"],
      ["Bob", "Address", "0", "indigo"],
      ["Carol", "Address", "0", "green lighten-2"]
    ];
  },
  methods: {
    sendEther(index) {
      alert(index);
    }
  }
};
</script>

<style>
</style>
