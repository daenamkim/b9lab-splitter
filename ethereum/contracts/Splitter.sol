pragma solidity >= 0.5.7;
pragma experimental ABIEncoderV2;

contract Splitter {
  struct User {
    string name;
    address account;
  }
  User[] users;
  mapping(address => bool) accounts;
  address owner;

  constructor() public {
    owner = msg.sender;
  }

  function registerUser(string memory name) public {
    require(!accounts[msg.sender], 'A given address is already registered');

    User memory newUser = User({
      name: name,
      account: msg.sender
    });
    users.push(newUser);
    accounts[msg.sender] = true;
  }

  function splitEther() public payable {
    require(accounts[msg.sender], 'A given address is not registered');
    require(users.length > 2, 'Please wait until at least 3 users are registered');
    require(msg.value > 0, 'A given value should be bigger than 0 (wei)');
    require(msg.value / (users.length - 1) > 0, 'A given value is too small to be sent to others');

    uint value = msg.value / (users.length - 1);

    for (uint i = 0; i < users.length; i++) {
      User storage user = users[i];
      if (msg.sender != user.account) {
        address payable recipient = address(uint160(user.account));
        recipient.transfer(value);
      }
    }
  }

  function getAllUsers() public view returns (User[] memory) {
    return users;
  }

  function deleteUser() public {
    require(accounts[msg.sender], 'A given account does not exist');

    accounts[msg.sender] = false;
    for (uint i = 0; i < users.length; i++) {
      if (msg.sender == users[i].account) {
        delete users[i];
      }
    }
  }

  // only for unit test
  function deleteAllUsers() public {
    require(msg.sender == owner, 'Delete all users can be run by owner only');

    for (uint i = 0; i < users.length; i++) {
      accounts[users[i].account] = false;
    }
    delete users;
  }
}
