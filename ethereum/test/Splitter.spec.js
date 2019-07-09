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

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
  });
  afterEach(async () => {
    await splitterInstance.deleteAllUsers({ from: owner });
  });
  it('should not send ether if the number of receivers are not 2', async () => {
    try {
      await splitterInstance.splitEther([bob], {
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
      await splitterInstance.splitEther([bob], {
        value: 33,
        from: alice
      });
      assert.fail();
      A;
    } catch (error) {
      assert.equal(error.reason, 'The value should be evenly divisible');
    }
  });
  it('should not send ether if msg.value and split value are smaller than 1', async () => {
    try {
      await splitterInstance.splitEther({
        value: 0,
        from: users[0].account
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given value should be bigger than 0 (wei)');
    }

    try {
      await splitterInstance.splitEther({
        value: 1, // to make (value / (users.length - 1)) fails
        from: users[0].account
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.reason,
        'A given value is too small to be sent to others'
      );
    }
  });
  it('should send split ether to others', async () => {
    const value = web3.utils.toWei(1, 'ether');
    await splitterInstance.splitEther([bob, carol], {
      from: alice,
      value: value
    });
    console.log(await web3.eth.getBalance(alice));
    console.log(await web3.eth.getBalance(bob));
    console.log(await web3.eth.getBalance(carol));
  });
});
