describe('Splitter Contract', () => {
  it('register a user(address) successfully', () => {
    // register a user
    // expect the number of users is 1
  });
  it('cannot register the same user(address) again', () => {
    // register a user
    // register a user again
    // expect a required error
    // expect the number of users is 1
  });
  it('cannot contribute ether if user(address) is not registered', () => {});
  it('cannot contribute ether(to wei) smaller than 1 wei', () => {});
  it('cannot contribute ether until at least 3 users join', () => {});
  it('contribute split ether to others', () => {
    // register 3 users (Alice, Bob, Carol)
    // Alice send some ether to the contract
    // retrieve all users and contract's balance, expect Bob's and Carol's balance each in the contract is a half of Alice sent
  });
  // TODO: cannot withdraw ether if its own balance if insufficient
  // TODO: each user can withdraw ether in the contract into its own address (pocket)
});
