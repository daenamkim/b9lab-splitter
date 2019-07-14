const { toEther, toWei } = require('./utils');
const BigNumber = require('big-number');

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
    splitterInstance = await artifacts.require('Splitter.sol').new();
    notPayableInstance = await artifacts.require('NotPayable.sol').new();
  });
  it('should not split value if msg.value is smaller than 1', async () => {
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
  it('should not split value if a receiver address is empty', async () => {
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
  it('should not split value if a sender is one of receivers', async () => {
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
  // it('should not split value if value is too big', async () => {
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
  it('should store divided value to each other and remainder to sender back', async () => {
    const value = '11';
    await splitterInstance.split(bob, carol, {
      from: alice,
      value
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

    assert.equal(
      (await splitterInstance.getContractBalance({ from: owner })).toString(),
      value
    );
  });
  it('should not allow to withdraw when account balance is 0', async () => {
    try {
      await splitterInstance.withdraw({ from: bob });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A requested account should have balance');
    }
  });
  it('should withdraw value to address', async () => {
    await splitterInstance.split(bob, carol, {
      from: alice,
      value: toWei('30')
    });

    const accountsBefore = {};
    accountsBefore[bob] = await web3.eth.getBalance(bob);
    accountsBefore[carol] = await web3.eth.getBalance(carol);
    for (const key in accountsBefore) {
      await splitterInstance.withdraw({ from: key });
      // ganache provider doesn't support event catch but it was OK without delay
      const actual = await web3.eth.getBalance(key);
      assert.notEqual(actual, accountsBefore[key]);
      assert.isTrue(BigNumber(actual).gt(accountsBefore[key]));
    }
  });
});
