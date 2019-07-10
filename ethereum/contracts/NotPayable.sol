pragma solidity >=0.5.8;

contract NotPayable {
  address public owner;

  constructor() public {
    owner = msg.sender;
  }
}
