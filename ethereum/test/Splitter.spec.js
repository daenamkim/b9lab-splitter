const { toEther, toWei } = require('./utils');

contract('Splitter', accounts => {
  if (!accounts || accounts.length < 4) {
    console.error('Insufficient number of accounts');
    return;
  }

  let owner;
  let alice;
  let bob;
  let carol;
  let splitterInstance;
  let notPayableInstance;
  beforeEach(async () => {
    owner = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
    carol = accounts[3];
    splitterInstance = await artifacts.require('Splitter.sol').deployed();
    notPayableInstance = await artifacts.require('NotPayable.sol').deployed();
  });
  it('should not split ether if msg.value is smaller than 1', async () => {
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
  it('should not split ether if a receiver address is empty', async () => {
    try {
      await splitterInstance.split(bob, {
        from: alice,
        value: '100'
      });
    } catch (error) {
      assert.equal(error.reason, 'invalid address');
    }

    try {
      await splitterInstance.split(bob, 0, {
        from: alice,
        value: '100'
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
          value: '100'
        }
      );
    } catch (error) {
      assert.equal(error.reason, 'A receiver should not be 0x');
    }
  });
  it('should not split ether if a sender is one of receivers', async () => {
    try {
      await splitterInstance.split(alice, carol, {
        value: '100',
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A sender should not be one of receivers');
    }
  });
  // TODO:
  // it('should not split ether if value is too big', async () => {
  //   try {
  //     await splitterInstance.split(alice, carol, {
  //       value:
  //         '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
  //       from: alice
  //     });
  //     assert.fail();
  //   } catch (error) {
  //     console.log(error);
  //     assert.equal(error.reason, 'A value is too big');
  //   }
  // });
  it('should store divided ether to each other and remainder to sender back', async () => {
    await splitterInstance.split(bob, carol, {
      from: alice,
      value: '11'
    });

    const expected = {};
    expected[alice] = '1';
    expected[bob] = '5';
    expected[carol] = '5';

    for (const key in expected) {
      assert.equal(
        (await splitterInstance.accounts(key, { from: owner })).toString(),
        expected[key]
      );
    }
  });
});
