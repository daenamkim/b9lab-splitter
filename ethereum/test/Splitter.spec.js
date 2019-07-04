const Splitter = artifacts.require('Splitter.sol');

contract('Splitter', accounts => {
  if (!accounts || accounts.length < 3) {
    console.error('Insufficient number of accounts');
    return;
  }

  const ownerAddr = accounts[0]; // accounts[0] is used to deploy a contract
  const users = [
    {
      name: 'Alice',
      addr: accounts[1]
    },
    {
      name: 'Bob',
      addr: accounts[2]
    },
    {
      name: 'Carol',
      addr: accounts[3]
    }
  ];

  const initUsers = async instance => {
    for (const user of users) {
      await instance.registerUser(user.name, {
        from: user.addr
      });
    }
  };

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
  });
  afterEach(async () => {
    await splitterInstance.deleteAllUsers({ from: ownerAddr });
  });

  it('should register a user(address) successfully', async () => {
    await initUsers(splitterInstance);
    const actual = await splitterInstance.getAllUsers.call({
      from: users[0].addr
    });

    const expected = users.map(user => [user.name, user.addr, '0']);
    assert.deepEqual(actual, expected);
  });
  it('should not register the same user(address) again', async () => {
    await initUsers(splitterInstance);
    try {
      await splitterInstance.registerUser(users[0].name, {
        from: users[0].addr
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given address is already registered');
    }
  });
  it('should not contribute ether if user(address) is not registered', async () => {
    try {
      await splitterInstance.contributeEther({
        value: 100,
        from: users[0].addr
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given address is not registered');
    }
  });
  it('should not contribute ether(to wei) smaller than 1 wei', async () => {
    await initUsers(splitterInstance);
    try {
      await splitterInstance.contributeEther({
        value: 0,
        from: users[0].addr
      });
      assert.fail();
    } catch (error) {
      assert.equal(
        error.reason,
        'A given value should be bigger thatn 0 (wei)'
      );
    }
  });
  it('should not contribute ether until at least 3 users join', async () => {
    await initUsers(splitterInstance);
    try {
      await splitterInstance.deleteUser(users[1].addr, {
        from: ownerAddr
      });

      await splitterInstance.contributeEther({
        value: 100,
        from: users[0].addr
      });
    } catch (error) {
      assert.equal(
        error.reason,
        'Please wait until at least 3 users are registered'
      );
    }
  });
  it('should contribute split ether to others', async () => {
    await initUsers(splitterInstance);
    await splitterInstance.contributeEther({
      value: 100,
      from: users[0].addr
    });
    const actual = await splitterInstance.getAllUsers.call({
      from: users[0].addr
    });
    const expected = users.map((user, index) =>
      index !== 0 ? [user.name, user.addr, '50'] : [user.name, user.addr, '0']
    );
    assert.deepEqual(actual, expected);
  });
  // TODO: cannot withdraw ether if its own balance if insufficient?
  // TODO: each user can withdraw ether in the contract into its own address (pocket)?
});
