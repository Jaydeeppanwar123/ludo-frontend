import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://ludo-backend.onrender.com"); // Replace with your backend URL

const App = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [players, setPlayers] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [positions, setPositions] = useState({});
    const [diceRoll, setDiceRoll] = useState(null);
    const [playerId, setPlayerId] = useState(null);

    useEffect(() => {
        socket.on("gameStart", ({ roomId, players }) => {
            setGameStarted(true);
            setPlayers(players);
            setPlayerId(socket.id);
        });

        socket.on("turn", ({ currentPlayer }) => setCurrentTurn(currentPlayer));

        socket.on("diceRolled", ({ player, diceRoll, newPosition }) => {
            setDiceRoll(diceRoll);
            setPositions(prev => ({ ...prev, [player]: newPosition }));
        });

        return () => {
            socket.off("gameStart");
            socket.off("turn");
            socket.off("diceRolled");
        };
    }, []);

    const rollDice = () => {
        if (currentTurn === playerId) {
            socket.emit("rollDice", { roomId: `room-${players[0]}` });
        }
    };

    return (
        <div className="game-container">
            <h1>Ludo Game 🎲</h1>
            {!gameStarted ? (
                <p>Waiting for players...</p>
            ) : (
                <div className="board">
                    <div className="players">
                        {players.map((p, index) => (
                            <div key={p} className={`player ${currentTurn === p ? "active" : ""}`} style={{ left: positions[p] * 20 + "px" }}>
                                {p === playerId ? "You" : `Player ${index + 1}`}
                            </div>
                        ))}
                    </div>

                    <button onClick={rollDice} disabled={currentTurn !== playerId}>Roll Dice</button>
                    {diceRoll && <p>🎲 Rolled: {diceRoll}</p>}
                    <p>{currentTurn === playerId ? "Your Turn!" : "Waiting for other players..."}</p>
                </div>
            )}
        </div>
    );
};

export default App;
