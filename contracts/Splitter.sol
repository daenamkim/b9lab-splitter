pragma solidity >= 0.5.7;
pragma experimental ABIEncoderV2;

contract Splitter {
  struct User {
    string name;
    address addr;
    uint balance;
  }
  User[] users;
  mapping(address => bool) accounts;
  address owner;

  constructor() public {
    owner = msg.sender;
  }

  function registerUser(string memory name) public {
    require(!accounts[msg.sender], 'A given address is already registered');
    // TODO: limit the number of users?

    User memory newUser = User({
      name: name,
      addr: msg.sender,
      balance: 0
    });
    users.push(newUser);
    accounts[msg.sender] = true;
  }

  function contributeEther() public payable {
    require(accounts[msg.sender], 'A given address is not registered');
    require(users.length > 2, 'Please wait until at least 3 users are registered');
    require(msg.value > 0, 'A given value should be bigger thatn 0 (wei)');
    // TODO: handle float?

    uint splitEther = msg.value / (users.length - 1);

    for (uint i = 0; i < users.length; i++) {
      User storage user = users[i];
      if (msg.sender != user.addr) {
        user.balance += splitEther;
      }
    }
  }

  function getAllUsers() public view returns (User[] memory) {
    return users;
  }

  // only for unit test
  function deleteAllUsers() public {
    require(msg.sender == owner, 'Delete all users can be run by owner only');

    for (uint i = 0; i < users.length; i++) {
      accounts[users[i].addr] = false;
    }
    delete users;
  }

  // only for unit test
  function deleteUser(address addr) public {
    require(msg.sender == owner, 'Delete a user can be run by owner only');

    accounts[addr] = false;
    for (uint i = 0; i < users.length; i++) {
      if (addr == users[i].addr) {
        delete users[i];
      }
    }
  }

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }
}
