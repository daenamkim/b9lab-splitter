const Splitter = artifacts.require('Splitter.sol');

contract('Splitter', async accounts => {
  if (!accounts || accounts.length < 3) {
    console.error('Insufficient number of accounts');
    return;
  }

  const addresses = {
    alice: accounts[0],
    bob: accounts[1],
    carol: accounts[2]
  };

  let splitterInstance;
  beforeEach(async () => {
    splitterInstance = await Splitter.deployed();
    // TODO: remove
    const test = (await splitterInstance.getBalance.call()).toNumber();
    console.log('BALANCE!!!!!', test);
  });

  it('should register a user(address) successfully', async () => {
    // register a user
    // expect the number of users is 1
  });
  it('should not register the same user(address) again', async () => {
    // register a user
    // register a user again
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
