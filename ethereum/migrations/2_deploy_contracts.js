const Splitter = artifacts.require('Splitter');

module.exports = function(deployer) {
  deployer.deploy(Splitter).then(instance => console.log(instance.address));
};
