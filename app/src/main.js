import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import web3 from './web3';

Vue.config.productionTip = false;
Vue.use(web3);

new Vue({
  render: h => h(App)
}).$mount('#app');
