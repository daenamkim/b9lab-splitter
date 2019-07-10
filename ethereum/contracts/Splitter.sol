pragma solidity >=0.5.8;

contract Splitter {
  mapping(address => bool) blackAccounts;
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

    if (blackAccounts[receiver1] || blackAccounts[receiver2]) {
      revert('A receiver is in black list');
    }

    uint value = msg.value / 2;

    // TODO: security/no-send: Consider using 'transfer' in place of 'send'.
    if (!receiver1.send(value)) {
      blackAccounts[receiver1] = true;
      revert('Transaction with receiver 1 has been failed');
    }

    if (!receiver2.send(value)) {
      blackAccounts[receiver2] = true;
      revert('Transaction with receiver 2 has been failed');
    }

    emit Transfer(msg.sender, receiver1, receiver2);
  }

  // for test only
  function getContractBalance() public view returns (uint) {
    return address(this).balance;
  }
}
