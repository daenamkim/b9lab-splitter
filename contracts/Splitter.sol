pragma solidity >= 0.5.7;

contract Splitter {
  mapping(address => uint) balances;
  address[] addresses;

  constructor() {

  }

  event setAddressHandle(address addr, uint balance);

  function setAddress(address addr) public {

  }

  event sendEtherHandle();

  function sendEther() public payable {

  }

  function getAllBalances() public view {

  }
}
