import { useState } from 'react'
import BasicScene from './components/threejs/BasicScene'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [show3D, setShow3D] = useState(true)

  return (
    <>
          <div className="App">
      <header>
        <h1>Мое 3D Портфолио</h1>
        <button onClick={() => setShow3D(!show3D)}>
          {show3D ? 'Скрыть 3D' : 'Показать 3D'}
        </button>
      </header>

      <main>
        {show3D && (
          <div className="scene-container">
            <BasicScene />
            <p className="scene-hint">
              Используйте мышь для вращения, колесико для zoom
            </p>
          </div>
        )}

        <section className="portfolio-content">
          <h2>Мои проекты</h2>
          {/* Ваш контент */}
        </section>
      </main>
    </div>
    </>
  )
}

export default App
