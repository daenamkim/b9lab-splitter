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
  let gasPrice;
  let gas; // gas limit
  beforeEach(async () => {
    owner = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
    carol = accounts[3];
    splitterInstance = await artifacts.require('Splitter.sol').new();
    gasPrice = web3.utils.toWei('2', 'gwei'); // normal speed (slow: 1 gwei, fast: 8 gwei)
    gas = '100000';
  });
  it('should not split value if msg.value is smaller than 1', async () => {
    try {
      await splitterInstance.split(bob, carol, {
        from: alice,
        value: '0',
        gasPrice,
        gas
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
        value: '100',
        gasPrice,
        gas
      });
    } catch (error) {
      assert.equal(error.reason, 'invalid address');
    }

    try {
      await splitterInstance.split(bob, 0, {
        from: alice,
        value: '100',
        gasPrice,
        gas
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
          value: '100',
          gasPrice,
          gas
        }
      );
    } catch (error) {
      assert.equal(error.reason, 'A receiver should not be 0x');
    }
  });
  it('should not split value if a sender is one of receivers', async () => {
    try {
      await splitterInstance.split(alice, carol, {
        from: alice,
        value: '100',
        gasPrice,
        gas
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A sender should not be one of receivers');
    }
  });
  it('should store divided value to each other and remainder to sender back', async () => {
    const value = '11';
    await splitterInstance.split(bob, carol, {
      from: alice,
      value,
      gasPrice,
      gas
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
      (await web3.eth.getBalance(splitterInstance.address)).toString(),
      value
    );
  });
  it('should not allow to withdraw when account balance is 0', async () => {
    try {
      await splitterInstance.withdraw({
        from: bob,
        gasPrice,
        gas
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A requested account should have balance');
    }
  });
  it('should withdraw value to address', async () => {
    const balanceBefore = await web3.eth.getBalance(alice);
    const value = web3.utils.toWei('30', 'ether');
    const tx = await splitterInstance.split(bob, carol, {
      from: alice,
      value,
      gasPrice,
      gas
    });

    const balanceNow = await web3.eth.getBalance(alice);
    const expectedGasUsed = 73716;
    assert.equal(tx.receipt.gasUsed, expectedGasUsed);
    assert.equal(
      balanceNow,
      BigNumber(balanceBefore)
        .subtract(BigNumber(expectedGasUsed).multiply(BigNumber(gasPrice)))
        .subtract(BigNumber(value))
        .toString()
    );

    const accountsBefore = {};
    accountsBefore[bob] = await web3.eth.getBalance(bob);
    accountsBefore[carol] = await web3.eth.getBalance(carol);
    for (const key in accountsBefore) {
      const tx = await splitterInstance.withdraw({
        from: key,
        gasPrice,
        gas
      });

      const balanceNow = await web3.eth.getBalance(key);
      const expectedGasUsed = 21089;
      assert.equal(tx.receipt.gasUsed, expectedGasUsed);
      assert.equal(
        balanceNow,
        BigNumber(accountsBefore[key])
          .add(BigNumber(value).divide(2))
          .subtract(BigNumber(expectedGasUsed).multiply(BigNumber(gasPrice)))
          .toString()
      );

      // ganache provider doesn't support event catch but it is OK there is no delay
      const actual = await web3.eth.getBalance(key);
      assert.notEqual(actual, accountsBefore[key]);
    }
  });
});
