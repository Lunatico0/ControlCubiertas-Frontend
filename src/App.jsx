import './App.css'
import Home from './components/Home.jsx'
import { ApiProvider } from './context/apiContext.jsx'

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
