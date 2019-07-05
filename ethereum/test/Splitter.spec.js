const Splitter = artifacts.require('Splitter.sol');

contract('Splitter', accounts => {
  if (!accounts || accounts.length < 3) {
    console.error('Insufficient number of accounts');
    return;
  }

  const owner = accounts[0]; // accounts[0] is used to deploy a contract
  const users = [
    {
      name: 'Alice',
      account: accounts[1]
    },
    {
      name: 'Bob',
      account: accounts[2]
    },
    {
      name: 'Carol',
      account: accounts[3]
    }
  ];

  const initUsers = async instance => {
    for (const user of users) {
      await instance.registerUser(user.name, {
        from: user.account
      });
    }
  };

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
  });
  afterEach(async () => {
    await splitterInstance.deleteAllUsers({ from: owner });
  });

  it('should register a user(account) successfully', async () => {
    await initUsers(splitterInstance);
    const actual = await splitterInstance.getAllUsers.call({
      from: users[0].account
    });

    const expected = users.map(user => [user.name, user.account]);
    assert.deepEqual(actual, expected);
  });
  it('should not register the same user(account) again', async () => {
    await initUsers(splitterInstance);
    try {
      await splitterInstance.registerUser(users[0].name, {
        from: users[0].account
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given address is already registered');
    }
  });
  it('should not send ether if user(address) is not registered', async () => {
    try {
      await splitterInstance.splitEther({
        value: 100,
        from: users[0].account
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given address is not registered');
    }
  });
  it('should not send ether if msg.value and split value are smaller than 1', async () => {
    await initUsers(splitterInstance);
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
  it('should not send ether until at least 3 users join', async () => {
    await initUsers(splitterInstance);
    try {
      await splitterInstance.deleteUser({
        from: users[1].account
      });

      await splitterInstance.splitEther({
        value: 100,
        from: users[0].account
      });
    } catch (error) {
      assert.equal(
        error.reason,
        'Please wait until at least 3 users are registered'
      );
    }
  });
  it('should send split ether to others', async () => {
    await initUsers(splitterInstance);
    await splitterInstance.splitEther({
      value: 100,
      from: users[0].account
    });
    const actual = await splitterInstance.getAllUsers.call({
      from: users[0].account
    });
    const expected = users.map((user, index) =>
      index !== 0 ? [user.name, user.account] : [user.name, user.account]
    );
    assert.deepEqual(actual, expected);
  });
});
