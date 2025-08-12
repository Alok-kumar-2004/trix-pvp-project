
document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('createBtn');
    const submitBtn = document.getElementById('submitBtn');
    const statusLog = document.getElementById('statusLog');
    const API_URL = 'http://localhost:3000'; // Our backend server

    // Function to create a match
    createBtn.addEventListener('click', async () => {
        const matchId = document.getElementById('createMatchId').value;
        const player1 = document.getElementById('player1').value;
        const player2 = document.getElementById('player2').value;
        const stake = document.getElementById('stake').value;

        statusLog.textContent = 'Sending request to create match...';

        const response = await fetch(`${API_URL}/match/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId, player1, player2, stake }),
        });
        const result = await response.json();
        statusLog.textContent = JSON.stringify(result, null, 2);
    });

    // Function to submit a result
    submitBtn.addEventListener('click', async () => {
        const matchId = document.getElementById('resultMatchId').value;
        const winner = document.getElementById('winner').value;

        statusLog.textContent = 'Sending request to submit result...';

        const response = await fetch(`${API_URL}/match/result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId, winner }),
        });
        const result = await response.json();
        statusLog.textContent = JSON.stringify(result, null, 2);
    });
});