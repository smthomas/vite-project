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
  const [powerUp, setPowerUp] = useState<Position | null>(null);
  const [isInvincible, setIsInvincible] = useState(false);
  const [invincibilityTimer, setInvincibilityTimer] = useState(0);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const generateRandomPosition = useCallback((excludePositions: Position[]): Position => {
    let newPosition: Position;
    do {
      newPosition = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (excludePositions.some(pos => pos.x === newPosition.x && pos.y === newPosition.y));
    return newPosition;
  }, []);

  const generateRandomFood = useCallback((): Position => {
    const excludePositions = [...snake];
    if (powerUp) excludePositions.push(powerUp);
    return generateRandomPosition(excludePositions);
  }, [snake, powerUp, generateRandomPosition]);

  const generateRandomPowerUp = useCallback((): Position => {
    const excludePositions = [...snake, food];
    return generateRandomPosition(excludePositions);
  }, [snake, food, generateRandomPosition]);

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

      // Check self collision (only if not invincible)
      if (!isInvincible && newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateRandomFood());
        
        // Spawn power-up randomly (20% chance)
        if (!powerUp && Math.random() < 0.2) {
          setPowerUp(generateRandomPowerUp());
        }
        
        // Increase difficulty every 50 points
        if ((score + 10) % 50 === 0) {
          setSpeed(prevSpeed => Math.max(50, prevSpeed - SPEED_INCREMENT));
        }
      } else {
        newSnake.pop();
      }

      // Check power-up collision
      if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        setPowerUp(null);
        setIsInvincible(true);
        setInvincibilityTimer(5);
      }

      return newSnake;
    });
  }, [direction, food, powerUp, gameOver, isPaused, hasStarted, score, isInvincible, generateRandomFood, generateRandomPowerUp]);

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

  // Handle invincibility timer
  useEffect(() => {
    if (invincibilityTimer > 0) {
      const timer = setTimeout(() => {
        setInvincibilityTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (invincibilityTimer === 0 && isInvincible) {
      setIsInvincible(false);
    }
  }, [invincibilityTimer, isInvincible]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setPowerUp(null);
    setIsInvincible(false);
    setInvincibilityTimer(0);
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
          {isInvincible && <span className="invincible-timer">Invincible: {invincibilityTimer}s</span>}
        </div>
      </div>
      
      <div className="game-board">
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          <div key={row} className="board-row">
            {Array.from({ length: GRID_SIZE }).map((_, col) => {
              const isSnakeHead = snake[0].x === col && snake[0].y === row;
              const isSnakeBody = snake.slice(1).some(segment => segment.x === col && segment.y === row);
              const isFood = food.x === col && food.y === row;
              const isPowerUp = powerUp && powerUp.x === col && powerUp.y === row;
              
              return (
                <div
                  key={`${row}-${col}`}
                  className={`cell ${isSnakeHead ? `snake-head ${isInvincible ? 'invincible' : ''}` : ''} ${isSnakeBody ? `snake-body ${isInvincible ? 'invincible' : ''}` : ''} ${isFood ? 'food' : ''} ${isPowerUp ? 'power-up' : ''}`}
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