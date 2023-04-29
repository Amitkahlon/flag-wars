import React, { useReducer, useState } from 'react';
import classNames from 'classnames';
import '../../css/game.css';
import {
  Board,
  Cell,
  Entity,
  GameManager,
  IPiecesSetup,
  King,
  MarkerBoard,
  Pawn,
  Position,
  Team,
  color,
  entityType,
  printType,
  team,
} from 'common';

const whitePawnImage = require('../../assets/whitePawn.png');
const blackPawnImage = require('../../assets/blackPawn.png');
const whiteKingImage = require('../../assets/whiteKing.png');
const blackKingImage = require('../../assets/blackKing.png');
const eyeImage = require('../../assets/eye.jpg');


// this is a ugly hack to inject the images to the imported common project
Pawn.getImage = function (entity) {
  return entity.team === team.black ? blackPawnImage : whitePawnImage;
};

King.getImage = function (entity) {
  return entity.team === team.black ? blackKingImage : whiteKingImage;
};

interface selectedEntity {
  x: number;
  y: number;
  entity: Entity;
}

const OfflineGamePage = () => {
  const [gameManager, setGameManager] = useState(new GameManager());
  const [currentTeam, setCurrentTeam] = useState(gameManager.whiteTeam);
  const [selectedEntity, setSelectedEntity] = useState<selectedEntity | null>(null);
  const [highlightBoard, setHighlightBoard] = useState<MarkerBoard>(new MarkerBoard());

  const renderPieceImage = (entity: Entity) => {
    if (entity == null) return null;
    // const image = entity.team === team.black ? entity.image.black : entity.image.white;

    if (entity.team !== currentTeam.team && !entity.isVisible) {
      return <p>?</p>;
    }

    return (
      <div className="image-container">
        <img width={45} height={40} src={(entity as any).constructor?.getImage(entity)} />
        {entity.isVisible && entity.team === currentTeam.team ? (
          <img width={15} height={15} src={eyeImage} className="small-image" />
        ) : null}
      </div>
    );
  };

  const handleCellClick = (cell: Cell) => {
    // handle setup clicks
    if (!gameManager.setupFinished) {
      if (selectedEntity && !cell.entity) {
        try {
          gameManager.setup_setPiece(selectedEntity.entity, { x: cell.x, y: cell.y });
          cell.entity = selectedEntity.entity;
          setSelectedEntity(null);
          setHighlightBoard(new MarkerBoard());
        } catch (error) {
          console.error(error);
        }
      }
    }
    // handle game clicks
    else if (gameManager.setupFinished) {
      if (cell.entity?.team === currentTeam.team) {
        setSelectedEntity({ entity: cell.entity, x: cell.x, y: cell.y });
        const highlightBoard = cell.entity.getPossibleMoves?.(cell.x, cell.y, gameManager.board) as MarkerBoard;
        highlightBoard.setHighlight(cell.x, cell.y);

        setHighlightBoard(highlightBoard);
      } else if (selectedEntity) {
        try {
          gameManager.move(
            selectedEntity.entity,
            { x: cell.x, y: cell.y },
            { x: selectedEntity.x, y: selectedEntity.y },
          );

          setSelectedEntity(null);
          const gmClone = gameManager.getClone();
          setGameManager(gmClone);
          setHighlightBoard(new MarkerBoard());

          setTimeout(() => {
            const randomMoveDetails = execRandomMove(gameManager.teamTurn);
            const highlightBoardWithEnemyMove = new MarkerBoard();
            highlightBoardWithEnemyMove.setHighlight(randomMoveDetails.move.x, randomMoveDetails.move.y, color.red);
            highlightBoardWithEnemyMove.setHighlight(
              randomMoveDetails.entityPos.x,
              randomMoveDetails.entityPos.y,
              color.blue,
            );

            const gmClone = gameManager.getClone();
            setGameManager(gmClone);
            setHighlightBoard(highlightBoardWithEnemyMove);
          }, 1000);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const renderGameSetup = () => {
    if (gameManager.setupFinished) {
      return null;
    }

    const currentTeamPiecesSetup = currentTeam.piecesSetup;
    const pawnImage = currentTeam.team === team.white ? whitePawnImage : blackPawnImage;
    const kingImage = currentTeam.team === team.white ? whiteKingImage : blackKingImage;

    let isFinished: boolean = true;
    for (const k in currentTeamPiecesSetup) {
      let key = k as entityType;
      if (currentTeamPiecesSetup[key] !== 0) {
        isFinished = false;
        break;
      }
    }

    return (
      <div>
        <div>
          <img
            src={kingImage}
            width={100}
            height={100}
            onClick={() => {
              if (currentTeamPiecesSetup.king === 0) {
                return;
                //show error
              }
              setSelectedEntity({ entity: new King(currentTeam.team), x: -1, y: -1 });
              const highlightBoard = new MarkerBoard();
              for (let i = 0; i < 8; i++) {
                if (!gameManager.board.getCell(i, 7).entity) {
                  highlightBoard.setHighlight(i, 7);
                }
              }

              setHighlightBoard(highlightBoard);
            }}
          />
          <p>Count: {currentTeamPiecesSetup.king}</p>
        </div>
        {isFinished ? (
          <div>
            <button onClick={handleReadyClick}>Ready</button>
          </div>
        ) : null}
      </div>
    );
  };

  const handleReadyClick = () => {
    gameManager.setReady(currentTeam);
    const oppositeTeam = gameManager.getOppositeTeam(currentTeam);

    let num1, num2;
    do {
      num1 = Math.floor(Math.random() * 8);
      num2 = Math.floor(Math.random() * 8);
    } while (num1 === num2);

    gameManager.setup_setPiece(new King(oppositeTeam.team), { x: num1, y: oppositeTeam.FIRST_COLUMN });
    gameManager.setup_setPiece(new King(oppositeTeam.team), { x: num2, y: oppositeTeam.FIRST_COLUMN });
    gameManager.setReady(oppositeTeam);

    setGameManager(gameManager.getClone()); //hack to update the ui..
    setSelectedEntity(null);
  };

  /**
   * MEGA CODE
   * returns the random move
   * @param t
   */
  const execRandomMove = (t: Team) => {
    const currentTeamOnBoardEntities: { entity: Entity; pos: { x: number; y: number } }[] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const currEntity = gameManager.board.getEntity(j, i);
        if (
          currEntity &&
          currEntity.team === t.team &&
          currEntity.getPossibleMoves?.(j, i, gameManager.board).hasAnyHighlight()
        ) {
          currentTeamOnBoardEntities.push({ entity: currEntity, pos: { x: j, y: i } });
        }
      }
    }
    const randomEntity = currentTeamOnBoardEntities[Math.floor(Math.random() * currentTeamOnBoardEntities.length)];
    const possibleMovesBoard = randomEntity.entity.getPossibleMoves?.(
      randomEntity.pos.x,
      randomEntity.pos.y,
      gameManager.board,
    );

    const possibleMovesArr: { x: number; y: number }[] = [];

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (possibleMovesBoard?.isHighlighted(j, i)) {
          possibleMovesArr.push({ x: j, y: i });
        }
      }
    }

    const randomMove = possibleMovesArr[Math.floor(Math.random() * possibleMovesArr.length)];

    gameManager.move(randomEntity.entity, randomMove, randomEntity.pos);

    return { move: randomMove, entityPos: randomEntity.pos };
  };

  return (
    <div>
      <h1>Offline Game</h1>
      {!gameManager.setupFinished ? <p>Place your pieces</p> : <p>Game started</p>}

      <div className="board">
        {gameManager.board.board?.map((row: Cell[], y: number) => (
          <div key={y} className="row">
            {row.map((cell, x) => {
              return (
                <button
                  key={x}
                  className={classNames('cell', {
                    [`${color[highlightBoard.returnHighlightType(x, y)]}-highlight`]: true,
                  })}
                  onClick={() => handleCellClick(cell)}
                >
                  {renderPieceImage(cell?.entity as Entity)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {renderGameSetup()}
    </div>
  );
};

export default OfflineGamePage;
