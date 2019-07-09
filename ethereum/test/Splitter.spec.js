const Splitter = artifacts.require('Splitter.sol');

contract('Splitter', accounts => {
  if (!accounts || accounts.length < 3) {
    console.error('Insufficient number of accounts');
    return;
  }

  const owner = accounts[0]; // accounts[0] is used to deploy a contract
  const alice = accounts[1];
  const bob = accounts[2];
  const carol = accounts[3];

  const toEther = value => {
    return web3.utils.fromWei(value, 'ether');
  };

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
  });
  it('should not send ether if the number of receivers are not 2', async () => {
    try {
      await splitterInstance.sendEther([bob], {
        value: 100,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'The number of receivers should be 2');
    }
  });
  it('should not send ether if msg.value is not evenly divisible', async () => {
    try {
      await splitterInstance.sendEther([bob, carol], {
        value: 33,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'The value should be evenly divisible');
    }
  });
  it('should not send ether if divided msg.value is smaller than 1', async () => {
    try {
      await splitterInstance.sendEther([bob, carol], {
        value: 0,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given value should be bigger than 0');
    }
  });
  it('should not send ether if a sender is one of receivers', async () => {
    try {
      await splitterInstance.sendEther([alice, carol], {
        value: 100,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A sender should not be one of receivers');
    }
  });
  it('should send divided ether to others', async () => {
    await splitterInstance.sendEther([bob, carol], {
      from: alice,
      value: web3.utils.toWei('10', 'ether')
    });

    assert.equal(toEther(await web3.eth.getBalance(bob)), '105');
    assert.equal(toEther(await web3.eth.getBalance(carol)), '105');
  });
});
