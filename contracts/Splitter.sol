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

  event userAdded(User user);

  function addUser(bytes8 name, address addr) public {
    require(!accounts[addr], 'A given address is already registerd');

    User memory newUser = User({
      name: name,
      addr: addr,
      balance: 0
    });
    users.push(newUser);
    emit userAdded(newUser);
  }

  event sendEtherHandle();

  function sendEther() public payable {

  }

  function getAllUsers() public view returns (User[] memory) {
    return users;
  }
}
