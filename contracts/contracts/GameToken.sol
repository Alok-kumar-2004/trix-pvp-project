
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract GameToken is ERC20, Ownable {
    address public tokenStore;

    modifier onlyTokenStore() {
        require(msg.sender == tokenStore, "Caller is not the TokenStore");
        _;
    }

    constructor(address initialOwner) ERC20("GameToken", "GT") Ownable(initialOwner) {}


    function setTokenStore(address _storeAddress) public onlyOwner {
        tokenStore = _storeAddress;
    }

function mintForTest(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
}
    function mint(address to, uint256 amount) public onlyTokenStore {
        _mint(to, amount);
    }
}