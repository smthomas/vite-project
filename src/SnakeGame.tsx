import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [bombs, setBombs] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const generateRandomFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      bombs.some(bomb => bomb.x === newFood.x && bomb.y === newFood.y)
    );
    return newFood;
  }, [snake, bombs]);

  const generateRandomBomb = useCallback((): Position => {
    let newBomb: Position;
    do {
      newBomb = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      snake.some(segment => segment.x === newBomb.x && segment.y === newBomb.y) ||
      (food.x === newBomb.x && food.y === newBomb.y) ||
      bombs.some(bomb => bomb.x === newBomb.x && bomb.y === newBomb.y)
    );
    return newBomb;
  }, [snake, food, bombs]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !hasStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      // Check bomb collision
      if (bombs.some(bomb => bomb.x === head.x && bomb.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateRandomFood());
        
        // Add a new bomb every 30 points
        if ((score + 10) % 30 === 0) {
          setBombs(prevBombs => [...prevBombs, generateRandomBomb()]);
        }
        
        // Increase difficulty every 50 points
        if ((score + 10) % 50 === 0) {
          setSpeed(prevSpeed => Math.max(50, prevSpeed - SPEED_INCREMENT));
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, hasStarted, score, generateRandomFood, generateRandomBomb, bombs]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (!hasStarted) {
          setHasStarted(true);
        } else {
          setIsPaused(prev => !prev);
        }
        return;
      }

      if (!hasStarted || isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPaused, gameOver, hasStarted]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, speed]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setBombs([]);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
    setHasStarted(false);
  };

  return (
    <div className="snake-game-container">
      <div className="game-header">
        <h2>Snake Game</h2>
        <div className="game-stats">
          <span className="score">Score: {score}</span>
          <span className="level">Level: {Math.floor(score / 50) + 1}</span>
        </div>
      </div>
      
      <div className="game-board">
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          <div key={row} className="board-row">
            {Array.from({ length: GRID_SIZE }).map((_, col) => {
              const isSnakeHead = snake[0].x === col && snake[0].y === row;
              const isSnakeBody = snake.slice(1).some(segment => segment.x === col && segment.y === row);
              const isFood = food.x === col && food.y === row;
              const isBomb = bombs.some(bomb => bomb.x === col && bomb.y === row);
              
              return (
                <div
                  key={`${row}-${col}`}
                  className={`cell ${isSnakeHead ? 'snake-head' : ''} ${isSnakeBody ? 'snake-body' : ''} ${isFood ? 'food' : ''} ${isBomb ? 'bomb' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {!hasStarted && !gameOver && (
        <div className="game-overlay">
          <p>Press SPACE to start</p>
          <p className="controls">Use arrow keys to control the snake</p>
        </div>
      )}

      {isPaused && !gameOver && (
        <div className="game-overlay">
          <p>PAUSED</p>
          <p className="controls">Press SPACE to resume</p>
        </div>
      )}

      {gameOver && (
        <div className="game-overlay">
          <p>Game Over!</p>
          <p>Final Score: {score}</p>
          <button onClick={resetGame} className="play-again-btn">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;