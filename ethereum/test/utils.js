const toEther = value => {
  return web3.utils.fromWei(value, 'ether');
};

const toWei = value => {
  return web3.utils.toWei(value, 'ether');
};

module.exports = {
  toEther,
  toWei
};
