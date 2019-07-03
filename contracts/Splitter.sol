pragma solidity >= 0.5.7;
pragma experimental ABIEncoderV2;

contract Splitter {
  struct User {
    bytes8 name;
    address addr;
    uint balance;
  }
  User[] users;
  mapping(address => bool) accounts;

  function addUser(bytes8 name, address addr) public {
    require(!accounts[addr], 'A given address is already registerd');
    // TODO: limit the number of users?

    User memory newUser = User({
      name: name,
      addr: addr,
      balance: 0
    });
    users.push(newUser);
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

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }
}
