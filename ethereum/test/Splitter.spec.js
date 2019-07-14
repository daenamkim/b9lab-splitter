contract('Splitter', accounts => {
  if (!accounts || accounts.length < 4) {
    console.error('Insufficient number of accounts');
    return;
  }

  const alice = accounts[1];
  const bob = accounts[2];
  const carol = accounts[3];

  const toEther = value => {
    return web3.utils.fromWei(value, 'ether');
  };

  let splitterInstance;
  let notPayableInstance;
  beforeEach(async () => {
    splitterInstance = await artifacts.require('Splitter.sol').deployed();
    notPayableInstance = await artifacts.require('NotPayable.sol').deployed();
  });
  it('should not send ether if msg.value is smaller than 1', async () => {
    try {
      await splitterInstance.split(bob, carol, {
        value: 0,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given value should be bigger than 0');
    }
  });
  it('should not send ether if a receiver address is empty', async () => {
    try {
      await splitterInstance.split(bob, {
        from: alice,
        value: 100
      });
    } catch (error) {
      assert.equal(error.reason, 'invalid address');
    }

    try {
      await splitterInstance.split(bob, 0, {
        from: alice,
        value: 100
      });
    } catch (error) {
      assert.equal(error.reason, 'invalid address');
    }

    try {
      await splitterInstance.split(
        bob,
        '0x0000000000000000000000000000000000000000',
        {
          from: alice,
          value: 100
        }
      );
    } catch (error) {
      assert.equal(error.reason, 'A receiver should not be 0x');
    }
  });
  it('should not send ether if a sender is one of receivers', async () => {
    try {
      await splitterInstance.split(alice, carol, {
        value: 100,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A sender should not be one of receivers');
    }
  });
});
