pragma solidity 0.5.10;

contract Ownable {
  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Should be only owner');

    _;
  }
}
