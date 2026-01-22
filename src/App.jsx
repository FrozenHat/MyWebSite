import { useState } from 'react'
import BasicScene from './components/threejs/BasicScene'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Three.js сцена как фон - без обертки */}
      <BasicScene />
      
      {/* Контент поверх фона */}
      <div className="content-overlay">
        <header className="header">
          <h1>Мое 3D Портфолио</h1>
          <nav>
            <a href="#about">Обо мне</a>
            <a href="#projects">Проекты</a>
            <a href="#contact">Контакты</a>
          </nav>
        </header>

        <main className="main-content">
          <section className="hero">
            <h2>Привет, я Frontend Разработчик</h2>
            <p>Создаю современные веб-приложения с интерактивной 3D графикой</p>
            <button 
              className="cta-button" 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Связаться со мной
            </button>
          </section>

          <section id="about" className="section">
            <h3>Обо мне</h3>
            <p>Здесь будет информация о ваших навыках и опыте...</p>
          </section>

          <section id="projects" className="section">
            <h3>Мои проекты</h3>
            <div className="projects-grid">
              <div className="project-card">Проект 1</div>
              <div className="project-card">Проект 2</div>
              <div className="project-card">Проект 3</div>
            </div>
          </section>

          <section id="contact" className="section">
            <h3>Контакты</h3>
            <p>Свяжитесь со мной...</p>
          </section>
        </main>

        <footer className="footer">
          <p>© 2024 Мое портфолио. Все права защищены.</p>
        </footer>
      </div>
    </>
  )
}

export default App