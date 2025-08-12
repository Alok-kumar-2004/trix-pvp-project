const { ethers } = require('ethers');
const express = require('express');
require('dotenv').config();

// --- SETUP ---
const app = express();
const PORT = 4000; // Use a different port than the main API
const rpcUrl = process.env.RPC_URL;
const playGameAddress = process.env.PLAYGAME_CONTRACT_ADDRESS;

// The ABI needs to include the Match struct and the Settled event
// We get it directly from the Hardhat artifact file for accuracy
const playGameABI = require('../contracts/artifacts/contracts/PlayGame.sol/PlayGame.json').abi;

// This is our in-memory database to store player stats
const leaderboard = {};
// Example structure:
// {
//   "0xPlayerAddress": { wins: 1, totalWon: 20.0 },
// }


// --- ETHERS CONNECTION & EVENT LISTENER ---
const provider = new ethers.JsonRpcProvider(rpcUrl);
const playGameContract = new ethers.Contract(playGameAddress, playGameABI, provider);

console.log("Leaderboard service started.");
console.log("Listening for Settled events on contract:", playGameAddress);

playGameContract.on("Settled", async (matchId, winner, event) => {
    console.log(`\n--- Event Detected: Match Settled! ---`);
    console.log(`Match ID: ${matchId}`);
    console.log(`Winner: ${winner}`);

    // The 'Settled' event doesn't include the amount won.
    // So, we fetch the match details from the public mapping to get the stake amount.
    const matchDetails = await playGameContract.matches(matchId);
    const stakeAmount = matchDetails.stakeAmount;
    const amountWon = stakeAmount * 2n; // stakeAmount is a BigInt, so use 'n' for 2

    // Initialize player in leaderboard if they don't exist
    if (!leaderboard[winner]) {
        leaderboard[winner] = {
            wins: 0,
            totalWon: 0n, // Use BigInt for calculations
        };
    }

    // Update stats
    leaderboard[winner].wins += 1;
    leaderboard[winner].totalWon += amountWon;

    console.log(`Updated stats for ${winner}:`);
    console.log(`  Wins: ${leaderboard[winner].wins}`);
    console.log(`  Total GT Won: ${ethers.formatEther(leaderboard[winner].totalWon)}`);
    console.log("------------------------------------");
});


// --- API ENDPOINT TO SERVE LEADERBOARD DATA ---
app.get('/leaderboard', (req, res) => {
    // Convert the leaderboard object to a sorted array
    const sortedLeaderboard = Object.entries(leaderboard)
        .map(([address, stats]) => ({
            address,
            wins: stats.wins,
            // Convert BigInt to string for JSON serialization
            totalWon: ethers.formatEther(stats.totalWon),
        }))
        .sort((a, b) => {
            // Sort by totalWon descending. Must convert back to number for sorting.
            return parseFloat(b.totalWon) - parseFloat(a.totalWon);
        });

    res.json(sortedLeaderboard);
});


// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Leaderboard API is running on http://localhost:${PORT}`);
});