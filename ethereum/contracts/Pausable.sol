pragma solidity 0.5.10;

import './Ownable.sol';

contract Pausable is Ownable {
  bool private _paused = false;

  event Paused(address owner);
  event Unpaused(address owner);

  modifier whenNotPaused() {
    require(!_paused, 'Should not be paused');

    _;
  }

  modifier whenPaused() {
    require(_paused, 'Should be pasued');

    _;
  }

  function pause() public onlyOwner whenNotPaused {
    _paused = true;
    emit Paused(msg.sender);
  }

  function unpause() public onlyOwner whenPaused {
    _paused = false;
    emit Unpaused(msg.sender);
  }
}
