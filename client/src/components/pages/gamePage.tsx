import react, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { send } from '../../services/httpContext';
import { ref, onValue } from 'firebase/database';
import { realTimeDb, auth } from '../../firebase/firebase';
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
  GameManagerFactory,
} from 'common';
import { setReady } from '../../services/onlineGameSerivce';

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

const GamePage = () => {
  const { id } = useParams();
  const [gameDetails, setGameDetails] = useState<{
    player1: { id: string; team: team };
    player2: { id: string; team: team };
  }>({
    player1: { id: '', team: team.black },
    player2: { id: '', team: team.black },
  });
  const [gameManager, setGameManager] = useState(GameManagerFactory.initGameManager());
  const [currentTeam, setCurrentTeam] = useState(gameManager.whiteTeam.team);

  const [selectedEntity, setSelectedEntity] = useState<selectedEntity | null>(null);
  const [highlightBoard, setHighlightBoard] = useState<MarkerBoard>(new MarkerBoard());
  const [setupEntities, setSetupEntities] = useState<
    {
      entity: Entity;
      pos: Position;
    }[]
  >([]);

  const listenForGame = () => {
    const starCountRef = ref(realTimeDb, 'games/' + id);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const gameDetails = { player1: data.player1, player2: data.player2, whitePlayer: data.white_player };
      setGameDetails(gameDetails);
      setGameManager(GameManagerFactory.restoreGame(data.game_data));
    });
  };

  const renderGameSetup = () => {
    if (gameManager.setupFinished) {
      return null;
    }

    const currentTeamPiecesSetup = getTeam(currentTeam).piecesSetup;
    const kingImage = currentTeam === team.white ? whiteKingImage : blackKingImage;

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
              setSelectedEntity({ entity: new King(getTeam(currentTeam).team), x: -1, y: -1 });
              const highlightBoard = new MarkerBoard();
              for (let i = 0; i < 8; i++) {
                if (!gameManager.board.getCell(i, 7).entity) {
                  highlightBoard.setHighlight(i, 7);
                }
              }

              setHighlightBoard(highlightBoard);
            }}
          />
          <p>Count: {getTeam(currentTeam).piecesSetup.king}</p>
        </div>
        {isFinished ? (
          <div>
            <button onClick={handleReadyClick}>Ready</button>
          </div>
        ) : null}
      </div>
    );
  };

  const getTeam = (t: team) => {
    if (t === team.black) {
      return gameManager.blackTeam;
    } else {
      return gameManager.whiteTeam;
    }
  };

  const handleReadyClick = async () => {
    setReady(id as string, setupEntities);
    await gameManager.setReady(getTeam(currentTeam));
    setSelectedEntity(null);
  };

  const deb = () => {
    debugger;

    return null;
  };

  const renderPieceImage = (entity: Entity) => {
    if (entity == null) return null;
    // const image = entity.team === team.black ? entity.image.black : entity.image.white;

    if (entity.team !== getTeam(currentTeam).team && !entity.isVisible) {
      return <p>?</p>;
    }

    return (
      <div className="image-container">
        <img width={45} height={40} src={(entity as any).constructor?.getImage(entity)} />
        {entity.isVisible && entity.team === getTeam(currentTeam).team ? (
          <img width={15} height={15} src={eyeImage} className="small-image" />
        ) : null}
      </div>
    );
  };

  const handleCellClick = (cell: Cell) => {
    // handle setup clicks
    if (!gameManager.setupFinished) {
      if (selectedEntity && cell.isEmpty()) {
        try {
          gameManager.setup_setPiece(selectedEntity.entity, { x: cell.x, y: cell.y });
          cell.entity = selectedEntity.entity;
          setSetupEntities([...setupEntities, { entity: selectedEntity.entity, pos: { x: cell.x, y: cell.y } }]);

          setSelectedEntity(null);
          setHighlightBoard(new MarkerBoard());
          setGameManager(GameManagerFactory.getClone(gameManager));
        } catch (error) {
          console.error(error);
        }
      }
    }
    // handle game clicks
    else if (gameManager.setupFinished) {
    }
  };

  useEffect(() => {
    listenForGame();

    const currentId = auth.currentUser?.uid;
    let team: team;

    if (currentId === gameDetails.player1.id) {
      team = gameDetails.player1.team;
    } else if (currentId === gameDetails.player2.id) {
      team = gameDetails.player2.team;
    } else {
      throw new Error('You are not part of this game');
      //handle user is not related to game.
    }

    setCurrentTeam(team);
  }, []);

  return (
    <div>
      <h1>Game Id: {id}</h1>
      <div>
        <h3>Player1: {gameDetails.player1.id}</h3>
        <p>Team: {team[gameDetails.player1.team]}</p>
      </div>
      <div>
        <h3>Player2: {gameDetails.player2.id}</h3>
        <p>Team: {team[gameDetails.player2.team]}</p>
      </div>

      <h4>Turn Count: {gameManager.turnCount}</h4>

      <div>
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
    </div>
  );
};

export default GamePage;
