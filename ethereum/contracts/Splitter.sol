pragma solidity 0.5.10;

contract Splitter {
  mapping(address => bool) accounts;
  address owner;

  constructor() public {
    owner = msg.sender;
  }

  event Transfer(address from, bool status, uint balance1, uint balance2);

  function sendEther(address payable receiver1, address payable receiver2) public payable {
    // One transfer call needs 2300 gas
    require(msg.sender.balance + 4600 > msg.value, 'A sender should have enough balance');
    require(msg.value % 2 == 0, 'The value should be evenly divisible');
    require(msg.value > 0, 'A given value should be bigger than 0');
    require(msg.sender != receivers[0] && msg.sender != receivers[1], 'A sender should not be one of receivers');

    uint value = msg.value / 2;
    receiver1.transfer(value)
    receiver2.transfer(value)

    emit Transfer(msg.sender, true, receivers[0].balance, receivers[1].balance);
  }
}
