import { ThemeProvider } from '@context/ThemeContext'
import { SettingsProvider } from '@context/SettingsContext'
import { ApiProvider } from '@context/apiContext'

const ContextProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ApiProvider>
          {children}
        </ApiProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default ContextProvider
