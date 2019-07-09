pragma solidity >= 0.5.7;
pragma experimental ABIEncoderV2;

contract Splitter {
  mapping(address => bool) accounts;
  address owner;

  constructor() public {
    owner = msg.sender;
  }

  event Transfer(address from, bool status, uint balance1, uint balance2);

  function sendEther(address[] memory receivers) public payable {
    // One transfer call needs 2300 gas
    require(msg.sender.balance + 4600 > msg.value, 'A sender should have enough balance');
    require(receivers.length == 2, 'The number of receivers should be 2');
    require(msg.value % 2 == 0, 'The value should be evenly divisible');
    require(msg.value > 0, 'A given value should be bigger than 0');
    require(msg.sender != receivers[0] && msg.sender != receivers[1], 'A sender should not be one of receivers');

    uint value = msg.value / 2;
    address(uint160(receivers[0])).transfer(value);
    address(uint160(receivers[1])).transfer(value);

    emit Transfer(msg.sender, true, receivers[0].balance, receivers[1].balance);
  }
}
