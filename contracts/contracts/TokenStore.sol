
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GameToken.sol"; // Import GameToken to interact with it

interface IUSDT {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract TokenStore is ReentrancyGuard {
    IUSDT public usdt;
    GameToken public gameToken;
    uint256 public gtPerUsdt; // How many GT you get per 1 USDT

    event Purchase(address indexed buyer, uint256 usdtAmount, uint256 gtOut);

    constructor(address _usdt, address _gameToken, uint256 _gtPerUsdt) {
        usdt = IUSDT(_usdt);
        gameToken = GameToken(_gameToken);
        gtPerUsdt = _gtPerUsdt;
    }

    function buy(uint256 usdtAmount) public nonReentrant {

        usdt.transferFrom(msg.sender, address(this), usdtAmount);

        uint256 gtOut = (usdtAmount * gtPerUsdt * 1e12) / 1e6;

        gameToken.mint(msg.sender, gtOut);

        emit Purchase(msg.sender, usdtAmount, gtOut);
    }
}