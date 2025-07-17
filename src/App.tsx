import { useEffect, useState } from 'react'
import SnakeGame from './SnakeGame'
import './App.css'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  return (
    <div className="app">
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Switch to {theme === 'dark' ? 'light' : 'dark'} mode
      </button>
      <SnakeGame />
    </div>
  )
}
