
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GameToken.sol"; 

contract PlayGame is ReentrancyGuard {
    GameToken public gameToken;
    address public operator; 

    enum Status { EMPTY, CREATED, STAKED, SETTLED, REFUNDED }

    struct Match {
        address player1;
        address player2;
        uint256 stakeAmount;
        Status status;
        bool p1_staked;
        bool p2_staked;
        uint256 startTime;
    }

    mapping(bytes32 => Match) public matches;

    // Events
    event MatchCreated(bytes32 indexed matchId, address p1, address p2, uint256 stake);
    event Staked(bytes32 indexed matchId, address player);
    event Settled(bytes32 indexed matchId, address winner);
    event Refunded(bytes32 indexed matchId);

    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can call this");
        _;
    }

    constructor(address _gameTokenAddress, address _operatorAddress) {
        gameToken = GameToken(_gameTokenAddress);
        operator = _operatorAddress;
    }

    function createMatch(bytes32 matchId, address p1, address p2, uint256 stake) public onlyOperator {
        require(matches[matchId].status == Status.EMPTY, "Match already exists");
        matches[matchId] = Match({
            player1: p1,
            player2: p2,
            stakeAmount: stake,
            status: Status.CREATED,
            p1_staked: false,
            p2_staked: false,
            startTime: 0
        });
        emit MatchCreated(matchId, p1, p2, stake);
    }

    function stake(bytes32 matchId) public nonReentrant {
        Match storage currentMatch = matches[matchId];
        require(currentMatch.status == Status.CREATED, "Match not ready for staking");
        
        require(msg.sender == currentMatch.player1 || msg.sender == currentMatch.player2, "Not a player in this match");

        if (msg.sender == currentMatch.player1) {
            require(!currentMatch.p1_staked, "Player 1 already staked");
            currentMatch.p1_staked = true;
        } else {
            require(!currentMatch.p2_staked, "Player 2 already staked");
            currentMatch.p2_staked = true;
        }

        gameToken.transferFrom(msg.sender, address(this), currentMatch.stakeAmount);
        emit Staked(matchId, msg.sender);

        if (currentMatch.p1_staked && currentMatch.p2_staked) {
            currentMatch.status = Status.STAKED;
            currentMatch.startTime = block.timestamp;
        }
    }

    function commitResult(bytes32 matchId, address winner) public onlyOperator nonReentrant {
        Match storage currentMatch = matches[matchId];
        require(currentMatch.status == Status.STAKED, "Match not in STAKED state");
        require(winner == currentMatch.player1 || winner == currentMatch.player2, "Winner not part of match");

        uint256 totalPot = currentMatch.stakeAmount * 2;
        currentMatch.status = Status.SETTLED;

        gameToken.transfer(winner, totalPot);
        emit Settled(matchId, winner);
    }
}