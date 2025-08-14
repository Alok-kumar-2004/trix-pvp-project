import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { io } from 'socket.io-client';

const GAME_TOKEN_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mintForTest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_storeAddress",
          "type": "address"
        }
      ],
      "name": "setTokenStore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "tokenStore",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const PLAY_GAME_ABI =  [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_gameTokenAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_operatorAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "p1",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "p2",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "stake",
          "type": "uint256"
        }
      ],
      "name": "MatchCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        }
      ],
      "name": "Refunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "Settled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "Staked",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "commitResult",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "p1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "p2",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "stake",
          "type": "uint256"
        }
      ],
      "name": "createMatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameToken",
      "outputs": [
        {
          "internalType": "contract GameToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "matches",
      "outputs": [
        {
          "internalType": "address",
          "name": "player1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "player2",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "stakeAmount",
          "type": "uint256"
        },
        {
          "internalType": "enum PlayGame.Status",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "p1_staked",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "p2_staked",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "operator",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "matchId",
          "type": "bytes32"
        }
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const GAME_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const PLAY_GAME_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';  
const SERVER_URL = 'http://localhost:3001';

const socket = io(SERVER_URL);

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);
    const [gameTokenContract, setGameTokenContract] = useState(null);
    const [playGameContract, setPlayGameContract] = useState(null);
    
    // Game State
    const [gameState, setGameState] = useState('lobby'); 
    const [stakeAmount, setStakeAmount] = useState('5');
    const [roomId, setRoomId] = useState('');
    const [board, setBoard] = useState(Array(9).fill(null));
    const [playerSymbol, setPlayerSymbol] = useState('');
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [winner, setWinner] = useState(null);

    const requiredNetwork = {
  chainId: '0x7A69', 
  chainName: 'Hardhat Localhost',
  nativeCurrency: {
    name: 'Hardhat ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
};

    const connectWallet = async () => {
  if (!window.ethereum) {
    alert('MetaMask is not installed!');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(requiredNetwork.chainId)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: requiredNetwork.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [requiredNetwork],
            });
          } catch (addError) {
            alert("Failed to add the Hardhat network to MetaMask.");
            console.error(addError);
            return;
          }
        } else {
            alert("Failed to switch network. Please switch to Hardhat network manually in MetaMask.");
            console.error(switchError);
            return;
        }
      }
    }

    const web3Signer = await provider.getSigner();
    const userAddress = await web3Signer.getAddress();

    setProvider(provider);
    setSigner(web3Signer);
    setAddress(userAddress);

    setGameTokenContract(new ethers.Contract(GAME_TOKEN_ADDRESS, GAME_TOKEN_ABI, web3Signer));
    setPlayGameContract(new ethers.Contract(PLAY_GAME_ADDRESS, PLAY_GAME_ABI, web3Signer));

  } catch (error) {
    console.error("Failed to connect wallet:", error);
  }
};

    const findMatch = () => {
        setGameState('waiting');
        socket.emit('findMatch', { playerAddress: address, stake: stakeAmount });
    };
    
    const handleStake = async () => {
        if (!playGameContract || !gameTokenContract) return;

        try {
            const stake = ethers.parseEther(stakeAmount);
            const approveTx = await gameTokenContract.approve(PLAY_GAME_ADDRESS, stake);
            await approveTx.wait();
            alert('Approval successful!');
            
            const stakeTx = await playGameContract.stake(ethers.id(roomId));
            await stakeTx.wait();
            alert('Stake successful! Waiting for opponent...');

            socket.emit('stakeConfirmed', { roomId });

        } catch (error) {
            console.error("Staking failed:", error);
            alert("Staking failed. See console for details.");
        }
    };

    const handlePlayerMove = (index) => {
        if (board[index] || !isMyTurn || winner) return;
        socket.emit('playerMove', { roomId, index });
    };


    useEffect(() => {
        socket.on('matchFound', ({ roomId }) => {
            setRoomId(roomId);
            setGameState('staking');
        });

        socket.on('gameStart', ({ symbol, turn }) => {
            setGameState('in_game');
            setPlayerSymbol(symbol);
            setIsMyTurn(socket.id === turn);
        });

        socket.on('updateBoard', ({ board, turn }) => {
            setBoard(board);
            setIsMyTurn(socket.id === turn);
        });
        
        socket.on('gameOver', ({ winner: winnerAddress }) => {
            setWinner(winnerAddress);
            setGameState('game_over');
        });

        return () => {
            socket.off('matchFound');
            socket.off('gameStart');
            socket.off('updateBoard');
            socket.off('gameOver');
        };
    }, []);


    return (
        <div className="App">
            <h1>TriX Tic-Tac-Toe</h1>
            {!address ? (
                <button onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <p>Connected: {address}</p>
            )}

            {gameState === 'lobby' && address && (
                <div>
                    <input type="text" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} />
                    <button onClick={findMatch}>Find Match for {stakeAmount} GT</button>
                </div>
            )}

            {gameState === 'waiting' && <p>Searching for an opponent...</p>}

            {gameState === 'staking' && (
                <div>
                    <h2>Match Found!</h2>
                    <p>Room ID: {roomId}</p>
                    <button onClick={handleStake}>Stake {stakeAmount} GT to Start</button>
                </div>
            )}

            {gameState === 'in_game' && (
                <div>
                    <h2>Game On! You are: {playerSymbol}</h2>
                    <h3>{isMyTurn ? "Your Turn" : "Opponent's Turn"}</h3>
                    <div className="board">
                        {board.map((cell, index) => (
                            <div key={index} className="cell" onClick={() => handlePlayerMove(index)}>
                                {cell}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'game_over' && (
                <div>
                    <h2>Game Over!</h2>
                    <h3>{winner === address ? 'You Won!' : 'You Lost.'}</h3>
                    <p>Winner: {winner}</p>
                </div>
            )}
        </div>
    );
}

export default App;