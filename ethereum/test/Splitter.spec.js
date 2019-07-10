const Splitter = artifacts.require('Splitter.sol');
const NotPayable = artifacts.require('NotPayable.sol');

contract('Splitter', accounts => {
  if (!accounts || accounts.length < 3) {
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
  let notPayable;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
    notPayableInstance = await NotPayable.deployed();
  });
  it("should not send if value is bigger thant sender's balance + 4600 gas (two transfers)", async () => {
    try {
      await splitterInstance.sendEther(bob, carol, {
        value: web3.utils.toWei('100', 'ether'),
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A sender should have enough balance');
    }
  });
  it('should not send ether if divided msg.value is smaller than 1', async () => {
    try {
      await splitterInstance.sendEther(bob, carol, {
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
      await splitterInstance.sendEther(alice, carol, {
        value: 100,
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A sender should not be one of receivers');
    }
  });
  it('should not send ether if one of receivers refuses funds', async () => {
    try {
      await splitterInstance.sendEther(notPayableInstance.address, carol, {
        value: web3.utils.toWei('1', 'ether'),
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'Transaction with receiver 1 has been failed');

      const contractBalance = (await splitterInstance.getContractBalance()).toString();
      assert.equal(contractBalance, '0');
    }

    try {
      await splitterInstance.sendEther(bob, notPayableInstance.address, {
        value: web3.utils.toWei('1', 'ether'),
        from: alice
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'Transaction with receiver 2 has been failed');

      const contractBalance = (await splitterInstance.getContractBalance()).toString();
      assert.equal(contractBalance, '0');
    }
  });
  it('should send divided ether to others', async () => {
    await splitterInstance.sendEther(bob, carol, {
      from: alice,
      value: web3.utils.toWei('10', 'ether')
    });

    assert.equal(toEther(await web3.eth.getBalance(bob)), '105');
    assert.equal(toEther(await web3.eth.getBalance(carol)), '105');
  });
});
