import './App.css'
import Home from '@components/Home.jsx'
import { ApiProvider } from '@context/apiContext'
import { useUpdater } from "@hooks/useUpdater"
import Layout from '@components/Layout/Layout.jsx'
import { ThemeProvider } from '@context/ThemeContext.jsx'

function App() {
  useUpdater()

  return (
    <>
      <ThemeProvider>
        <ApiProvider>
          <Layout />
        </ApiProvider>
      </ThemeProvider>
    </>
  )
}

export default App
