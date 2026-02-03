// App.jsx - упрощенная версия
import BasicScene from './components/threejs/BasicScene'
import TextMask from './components/TextMask'
import './App.css'

function App() {
  return (
    <>
      <BasicScene />
      
      <div className="content-overlay">
        <header className="header">
          <h1 className="header-title">
            <TextMask 
              text="Creators Project" 
              fontSize={36}
              fontWeight="700"
              fontFamily="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              className="main-title"
              smoothing={true}
            />
          </h1>
          
          <nav className="header-nav">
            <a href="#about">
              <TextMask 
                text="Обо мне" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
            <a href="#projects">
              <TextMask 
                text="Проекты" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
            <a href="#contact">
              <TextMask 
                text="Контакты" 
                fontSize={18}
                fontWeight="500"
                fontFamily="'Segoe UI', Roboto, sans-serif"
                className="nav-link"
                smoothing={true}
              />
            </a>
          </nav>
        </header>

        <footer className="footer">
          <p>© 2026 Примеры. Все права защищены.</p>
        </footer>
      </div>
    </>
  )
}

export default App