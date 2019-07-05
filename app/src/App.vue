<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Splitter</span>
        <span class="font-weight-light">B9LAB</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <splitter />
    </v-content>
  </v-app>
</template>

<script>
// import HelloWorld from './components/HelloWorld'
import Splitter from "./components/Splitter";

export default {
  name: "App",
  components: {
    Splitter
  },
  data() {
    return {
      //
    };
  }
};
</script>
