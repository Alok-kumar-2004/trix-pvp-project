// --- Imports ---
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3001; 

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, provider);
const playGameABI = require('../contracts/artifacts/contracts/PlayGame.sol/PlayGame.json').abi;
const playGameContract = new ethers.Contract(process.env.PLAYGAME_CONTRACT_ADDRESS, playGameABI, signer);


const waitingPool = {}; // { '5': 'socket_id_of_player' }
const gameRooms = {}; // { 'room_id': { players: [], board: [], turn: '' } }

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('findMatch', (data) => {
        const { playerAddress, stake } = data;
        console.log(`${playerAddress} is looking for a match with a stake of ${stake} GT.`);

        if (waitingPool[stake]) {
            const player1 = waitingPool[stake];
            const player2 = { socketId: socket.id, address: playerAddress };
            delete waitingPool[stake]; 

            const roomId = `room-${player1.socketId}-${player2.socketId}`;
            gameRooms[roomId] = {
                players: [player1, player2],
                board: Array(9).fill(null),
                turn: player1.socketId, 
                stakesConfirmed: 0
            };

            io.to(player1.socketId).to(player2.socketId).emit('matchFound', { roomId });
            console.log(`Match found! Room created: ${roomId}`);

        } else {
            waitingPool[stake] = { socketId: socket.id, address: playerAddress };
            socket.emit('waitingForOpponent');
        }
    });

    socket.on('stakeConfirmed', ({ roomId }) => {
        const room = gameRooms[roomId];
        if (!room) return;

        room.stakesConfirmed += 1;
        console.log(`Player in room ${roomId} confirmed stake. Total confirmations: ${room.stakesConfirmed}`);

        if (room.stakesConfirmed === 2) {
            console.log(`Both players staked. Starting game in room ${roomId}`);
            const player1Symbol = 'X';
            const player2Symbol = 'O';

            io.to(room.players[0].socketId).emit('gameStart', { symbol: player1Symbol, turn: room.turn });
            io.to(room.players[1].socketId).emit('gameStart', { symbol: player2Symbol, turn: room.turn });
        }
    });
    
    socket.on('playerMove', ({ roomId, index }) => {
        const room = gameRooms[roomId];
        if (!room || room.board[index] || room.turn !== socket.id) {
            return; 
        }
    
        const currentPlayerIndex = room.players.findIndex(p => p.socketId === socket.id);
        const symbol = currentPlayerIndex === 0 ? 'X' : 'O';
    
        room.board[index] = symbol;
        room.turn = room.players[1 - currentPlayerIndex].socketId; // Switch turn
    
        io.to(roomId).emit('updateBoard', { board: room.board, turn: room.turn });
    
        const winner = checkWinner(room.board);
        if (winner) {
            const winnerPlayer = room.players[currentPlayerIndex];
            io.to(roomId).emit('gameOver', { winner: winnerPlayer.address });
            
           
            commitGameResult(roomId, winnerPlayer.address);
            delete gameRooms[roomId]; 
        }
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
        // Here you would add logic to remove players from the waiting pool or handle game forfeits
    });
});

function checkWinner(board) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]             
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

async function commitGameResult(roomId, winnerAddress) {
    try {
        const matchIdBytes32 = ethers.id(roomId);
        console.log(`Committing result for match ${roomId}. Winner: ${winnerAddress}`);
        
        
        const tx = await playGameContract.commitResult(matchIdBytes32, winnerAddress);
        await tx.wait();
        console.log(`Payout successful! Tx hash: ${tx.hash}`);
    } catch (error) {
        console.error("Error committing result:", error.message);
    }
}

server.listen(PORT, () => {
    console.log(` Game Server is running on http://localhost:${PORT}`);
});