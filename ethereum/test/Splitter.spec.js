const BigNumber = require('big-number');
const truffleAssert = require('truffle-assertions');
const artifact = artifacts.require('Splitter.sol');

contract('Splitter', accounts => {
  const [owner, alice, bob, carol] = accounts;
  const gas = '100000'; // gas limit
  before(async () => {
    assert.isAbove(accounts.length, 3, 'The number of accounts is 4 at least');
  });

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await artifact.new({ from: owner });
  });
  it('should not split value if msg.value is smaller than 1', async () => {
    await truffleAssert.fails(
      splitterInstance.split(bob, carol, {
        from: alice,
        value: '0',
        gas
      }),
      'A given value should be bigger than 0'
    );
  });
  it('should not split value if a receiver address is empty', async () => {
    await truffleAssert.fails(
      splitterInstance.split(bob, {
        from: alice,
        value: '100',
        gas
      }),
      'invalid address'
    );

    await truffleAssert.fails(
      splitterInstance.split(bob, 0, {
        from: alice,
        value: '100',
        gas
      }),
      'invalid address'
    );

    await truffleAssert.fails(
      splitterInstance.split(
        bob,
        '0x0000000000000000000000000000000000000000',
        {
          from: alice,
          value: '100',
          gas
        }
      ),
      'A receiver should not be 0x'
    );
  });
  it('should not split value if a sender is one of receivers', async () => {
    await truffleAssert.fails(
      splitterInstance.split(alice, carol, {
        from: alice,
        value: '100',
        gas
      }),
      'A sender should not be one of receivers'
    );
  });
  it('should store divided value to each other and remainder to sender back', async () => {
    const value = '11';
    await splitterInstance.split(bob, carol, {
      from: alice,
      value,
      gas
    });

    const expected = {};
    expected[alice] = '1';
    expected[bob] = '5';
    expected[carol] = '5';

    for (const key in expected) {
      assert.strictEqual(
        (await splitterInstance.accounts(key, { from: owner })).toString(),
        expected[key]
      );
    }

    assert.strictEqual(
      (await web3.eth.getBalance(splitterInstance.address)).toString(),
      value
    );
  });
  it('should not allow to withdraw when account balance is 0', async () => {
    await truffleAssert.fails(
      splitterInstance.withdraw({
        from: bob,
        gas
      }),
      'A requested account should have balance'
    );
  });
  it('should call split of the contract', async () => {
    const balanceBefore = await web3.eth.getBalance(alice);
    const value = web3.utils.toWei('30', 'ether');
    const tx = await splitterInstance.split(bob, carol, {
      from: alice,
      value,
      gas
    });
    const gasPrice = (await web3.eth.getTransaction(tx.receipt.transactionHash))
      .gasPrice;
    const balanceNow = await web3.eth.getBalance(alice);
    const expectedGasUsed = 75000;
    assert.isBelow(tx.receipt.gasUsed, expectedGasUsed);
    assert.isTrue(
      BigNumber(balanceNow).gt(
        BigNumber(balanceBefore)
          .subtract(BigNumber(value))
          .subtract(expectedGasUsed * gasPrice)
      )
    );
  });
  it('should withdraw value to address', async () => {
    const value = web3.utils.toWei('30', 'ether');
    await splitterInstance.split(bob, carol, {
      from: alice,
      value,
      gas
    });

    const balancesBefore = {};
    balancesBefore[bob] = await web3.eth.getBalance(bob);
    balancesBefore[carol] = await web3.eth.getBalance(carol);
    for (const key in balancesBefore) {
      const tx = await splitterInstance.withdraw({
        from: key,
        gas
      });

      const gasPrice = (await web3.eth.getTransaction(
        tx.receipt.transactionHash
      )).gasPrice;
      const balanceNow = await web3.eth.getBalance(key);
      const expectedGasUsed = 25000;
      assert.isBelow(tx.receipt.gasUsed, expectedGasUsed);
      truffleAssert;
      assert.isTrue(
        BigNumber(balanceNow).gt(
          BigNumber(balancesBefore[key])
            .add(BigNumber(value).div(2))
            .subtract(expectedGasUsed * gasPrice)
        )
      );

      // ganache provider doesn't support event catch but it is OK there is no delay
      const actual = await web3.eth.getBalance(key);
      assert.notEqual(actual, balancesBefore[key]);
    }
  });
});
