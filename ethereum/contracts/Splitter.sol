pragma solidity 0.5.10;

import './Pausable.sol';
import './SafeMath.sol';

contract Splitter is Pausable {
  using SafeMath for uint256;

  mapping(address => uint) public accounts;

  event LogSplit(address indexed from, uint value, address indexed receiver1, address indexed receiver2);
  event LogWithdraw(address indexed requester);

  function split(address receiver1, address receiver2) public payable whenNotPaused {
    require(msg.value > 0, 'A given value should be bigger than 0');
    require(receiver1 != address(0) && receiver2 != address(0), 'A receiver should not be 0x');
    require(msg.sender != receiver1 && msg.sender != receiver2, 'A sender should not be one of receivers');

    uint value = msg.value.div(2);
    uint valueReceiver1 = accounts[receiver1];
    uint valueReceiver2 = accounts[receiver2];
    accounts[msg.sender] += msg.value.mod(2);
    accounts[receiver1] = valueReceiver1.add(value);
    accounts[receiver2] = valueReceiver2.add(value);

    emit LogSplit(msg.sender, msg.value, receiver1, receiver2);
  }

  function withdraw() public whenNotPaused {
    require(accounts[msg.sender] > 0, 'A requested account should have balance');

    msg.sender.transfer(accounts[msg.sender]);
    accounts[msg.sender] = 0;

    emit LogWithdraw(msg.sender);
  }
}
