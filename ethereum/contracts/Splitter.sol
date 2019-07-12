pragma solidity >=0.5.8;

contract Splitter {
  mapping(address => uint) accounts;
  address owner;

  event SplitHandle(address from, address receiver1, address receiver2);
  event WithdrawHandle(address requester);

  constructor() public {
    owner = msg.sender;
  }

  function split(address payable receiver1, address payable receiver2) public payable {
    require(msg.value > 0, 'A given value should be bigger than 0');
    require(msg.sender != receiver1 && msg.sender != receiver2, 'A sender should not be one of receivers');

    uint value = msg.value / 2;
    require(accounts[receiver1] + value > value && accounts[receiver2] + value > value, 'A value is too big');
    accounts[receiver1] += value;
    accounts[receiver2] += value;

    emit SplitHandle(msg.sender, receiver1, receiver2);
  }

  function withdraw() public {
    require(accounts[msg.sender] > 0, 'A requested account should have balance');

    msg.sender.transfer(accounts[msg.sender]);
    accounts[msg.sender] = 0;

    emit WithdrawHandle(msg.sender);
  }

  function getContractBalance() public view returns (uint) {
    return address(this).balance;
  }
}
