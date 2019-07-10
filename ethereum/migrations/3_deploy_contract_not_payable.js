const NotPayable = artifacts.require('NotPayable');

module.exports = function(deployer) {
  deployer.deploy(NotPayable);
};
