import './App.css'
import Home from '@components/Home.jsx'
import { ApiProvider } from '@context/apiContext'
import { useUpdater } from "@hooks/useUpdater"

function App() {
  useUpdater()

  return (
    <>
      <ApiProvider>
        <Home />
      </ApiProvider>
    </>
  )
}

export default App
