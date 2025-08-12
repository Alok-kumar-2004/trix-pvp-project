const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// We need a fake USDT address for testing. On a real network (like Sepolia or Mainnet),
// you would replace this with the official USDT contract address for that network.
const FAKE_USDT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Placeholder
const GT_PER_USDT = 1_000_000_000_000_000_000n; // This is 1 GT per 1 USDT, written as 1e18

module.exports = buildModule("TriXModule", (m) => {

  const deployer = m.getAccount(0);
  const usdtAddress = m.getParameter("usdtAddress", FAKE_USDT_ADDRESS);
  const operatorAddress = m.getParameter("operatorAddress", deployer);

  const gameToken = m.contract("GameToken", [deployer]);

  const tokenStore = m.contract("TokenStore", [
    usdtAddress,
    gameToken, 
    GT_PER_USDT,
  ]);

  const playGame = m.contract("PlayGame", [gameToken, operatorAddress]);


  
  m.call(gameToken, "setTokenStore", [tokenStore], {
    id: "authorize_tokenstore" 
  });
  

  return { gameToken, tokenStore, playGame };
});