import { useEffect, useState } from 'react'
import './SnakeGame.css'

interface Pos { x: number; y: number }

const BOARD_SIZE = 20
const INITIAL_SNAKE: Pos[] = [{ x: 8, y: 8 }]
const INITIAL_FOOD: Pos = { x: 5, y: 5 }
const INITIAL_SPEED = 200
const MIN_SPEED = 60

function randomFood(snake: Pos[]): Pos {
  let pos: Pos
  do {
    pos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    }
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y))
  return pos
}

function isCollision(head: Pos, snake: Pos[]): boolean {
  if (head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE)
    return true
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true
  }
  return false
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Pos[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Pos>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Pos>({ x: 1, y: 0 })
  const [score, setScore] = useState(0)

  const speed = Math.max(MIN_SPEED, INITIAL_SPEED - score * 10)

  const move = () => {
    setSnake((prev) => {
      const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y }
      const newSnake = [head, ...prev]
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 1)
        setFood(randomFood(newSnake))
      } else {
        newSnake.pop()
      }
      if (isCollision(head, newSnake)) {
        setScore(0)
        setFood(randomFood(INITIAL_SNAKE))
        return INITIAL_SNAKE
      }
      return newSnake
    })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 })
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [direction])

  useEffect(() => {
    const id = setInterval(move, speed)
    return () => clearInterval(id)
  })

  return (
    <div className="game">
      <div className="score">Score: {score}</div>
      <div
        className="board"
        style={{
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
          const x = idx % BOARD_SIZE
          const y = Math.floor(idx / BOARD_SIZE)
          const isSnake = snake.some((s) => s.x === x && s.y === y)
          const isFood = food.x === x && food.y === y
          return (
            <div
              key={idx}
              className={`cell${isSnake ? ' snake' : ''}${isFood ? ' food' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}
