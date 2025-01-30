import './App.css'
import Home from './components/home'
import { ApiProvider } from './context/apiContext'

function App() {

  return (
    <>
      <ApiProvider>
        <Home />
      </ApiProvider>
    </>
  )
}

export default App
