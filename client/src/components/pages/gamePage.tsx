import react, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { send } from '../../services/httpContext';
import { ref, onValue } from 'firebase/database';
import { realTimeDb, auth } from '../../firebase/firebase';
import classNames from 'classnames';

import '../../css/game.css';

const GamePage = () => {
  const { id } = useParams();
  const [gameDetails, setGameDetails] = useState<any>({});
  const [boardMarks, setBoardMarks] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const selectCell = (x: number, y: number) => {
    const newBoard = [...boardMarks];
    newBoard[y][x] = newBoard[y][x] === 2 ? 0 : 2;

    setBoardMarks(newBoard);
  };

  // 0 = none
  // 1 highlight
  // 2 selected

  const listenForGame = () => {
    const starCountRef = ref(realTimeDb, 'games/' + id);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      setGameDetails(data);
    });
  };

  const handleCellClick = (x: number, y: number) => {
    // kinda redundant check what whatever
    // if (cellSelected.x === x && cellSelected.y === y) {
    //   selectCell(x, y);
    //   return;
    // }

    selectCell(x, y);
  };

  function renderBoard() {
    return (
      <div className="board">
        {gameDetails.game?.map((row: any[], x: number) => (
          <div key={x} className="row">
            {row.map((cell, y) => (
              <button
                key={y}
                className={classNames('cell', { selected: 2 === boardMarks[y][x] })}
                onClick={() => {
                  handleCellClick(x, y);
                }}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    listenForGame();
  }, []);

  return (
    <div>
      <h1>Game Id: {id}</h1>
      <h2>Player1: {gameDetails.player1}</h2>
      <h2>Player2: {gameDetails.player2}</h2>

      <h4>Turn Count: {gameDetails.turnCount}</h4>
      {renderBoard()}
      <div></div>
    </div>
  );
};

export default GamePage;
