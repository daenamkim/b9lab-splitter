const Splitter = artifacts.require('Splitter.sol');

contract('Splitter', async accounts => {
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

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
    for (const user of users) {
      await splitterInstance.registerUser(user.name, {
        from: user.addr
      });
    }
  });

  it('should register a user(address) successfully', async () => {
    const actual = await splitterInstance.getAllUsers.call({
      from: ownerAddr
    });

    const expected = users.map(user => [user.name, user.addr, '0']);
    assert.deepEqual(actual, expected);
  });
  it('should not register the same user(address) again', async () => {
    try {
      await splitterInstance.registerUser(users[0].name, {
        from: users[0].addr
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, 'A given address is already registered');
    }

    // expect a required error
    // expect the number of users is 1
  });
  it('should not contribute ether if user(address) is not registered', async () => {});
  it('should not contribute ether(to wei) smaller than 1 wei', async () => {});
  it('should not contribute ether until at least 3 users join', async () => {});
  it('should contribute split ether to others', async () => {
    // register 3 users (Alice, Bob, Carol)
    // Alice send some ether to the contract
    // retrieve all users and contract's balance, expect Bob's and Carol's balance each in the contract is a half of Alice sent
  });
  // TODO: cannot withdraw ether if its own balance if insufficient
  // TODO: each user can withdraw ether in the contract into its own address (pocket)
});
