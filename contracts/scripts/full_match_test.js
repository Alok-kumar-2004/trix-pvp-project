const hre = require("hardhat");

async function main() {
    console.log("--- Starting Full Match Test ---");

    // 1. GET SIGNERS (ACCOUNTS)
    // The first account is the deployer/operator, the next two are our players.
    const [operator, player1, player2] = await hre.ethers.getSigners();
    console.log(`Operator: ${operator.address}`);
    console.log(`Player 1: ${player1.address}`);
    console.log(`Player 2: ${player2.address}`);

    // 2. GET DEPLOYED CONTRACTS
    // NOTE: Replace these addresses with the new ones from your latest deployment!
const gameTokenAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const playGameAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

    const gameToken = await hre.ethers.getContractAt("GameToken", gameTokenAddress);
    const playGame = await hre.ethers.getContractAt("PlayGame", playGameAddress);

    // 3. MINT TOKENS FOR PLAYERS FOR THE TEST
    const stakeAmount = hre.ethers.parseEther("10"); // 10 GT
    console.log("\n--- Minting test tokens for players ---");
    await gameToken.connect(operator).mintForTest(player1.address, stakeAmount);
    await gameToken.connect(operator).mintForTest(player2.address, stakeAmount);
    console.log(`Minted 10 GT to Player 1 and Player 2.`);

    // 4. PLAYERS APPROVE THE PLAYGAME CONTRACT TO SPEND THEIR TOKENS
    console.log("\n--- Players approving token spend ---");
    await gameToken.connect(player1).approve(playGameAddress, stakeAmount);
    await gameToken.connect(player2).approve(playGameAddress, stakeAmount);
    console.log("Both players have approved the stake amount.");

    // 5. OPERATOR CREATES THE MATCH
    const matchId = "script-test-01";
    const matchIdBytes32 = hre.ethers.id(matchId);
    console.log(`\n--- Operator creating match: ${matchId} ---`);
    await playGame.connect(operator).createMatch(matchIdBytes32, player1.address, player2.address, stakeAmount);
    console.log("Match created. Status is CREATED.");

    // 6. PLAYERS STAKE THEIR TOKENS (THE MISSING STEP)
    console.log("\n--- Players are now staking ---");
    await playGame.connect(player1).stake(matchIdBytes32);
    console.log("Player 1 has staked.");
    await playGame.connect(player2).stake(matchIdBytes32);
    console.log("Player 2 has staked. Match status is now STAKED.");

    // 7. OPERATOR SUBMITS THE RESULT
    console.log("\n--- Operator submitting the result ---");
    await playGame.connect(operator).commitResult(matchIdBytes32, player2.address); // Let's say Player 2 wins
    console.log("Result submitted. Player 2 is the winner!");

    // 8. CHECK WINNER'S BALANCE
    const winnerBalance = await gameToken.balanceOf(player2.address);
    console.log(`\nPlayer 2 final GT balance: ${hre.ethers.formatEther(winnerBalance)} GT`);
    console.log("\n--- Full Match Test Completed Successfully! ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});