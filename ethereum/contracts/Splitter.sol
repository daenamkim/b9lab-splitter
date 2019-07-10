pragma solidity 0.5.10;

contract Splitter {
  mapping(address => bool) accounts;
  address owner;

  constructor() public {
    owner = msg.sender;
  }

  event Transfer(address from, address receiver1, address receiver2);

  function sendEther(address payable receiver1, address payable receiver2) public payable {
    // One transfer call needs 2300 gas
    require(msg.sender.balance + 4600 > msg.value, 'A sender should have enough balance');
    require(msg.value > 0, 'A given value should be bigger than 0');
    require(msg.sender != receiver1 && msg.sender != receiver2, 'A sender should not be one of receivers');

    uint value = msg.value / 2;

    // security/no-send: Consider using 'transfer' in place of 'send'.
    if (!receiver1.send(value) || !receiver2.send(value)) {
      revert('Transaction has been failed');
    }

    emit Transfer(msg.sender, receiver1, receiver2);
  }
}
