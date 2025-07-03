import './App.css'
import { useUpdater } from "@hooks/useUpdater"
import Layout from '@components/Layout/Layout.jsx'
import ContextProvider from '@context/ContextProvider.jsx'

function App() {
  useUpdater()

  return (
    <ContextProvider>
      <Layout />
    </ContextProvider>
  )
}

export default App
