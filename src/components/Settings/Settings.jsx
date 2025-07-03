import React from 'react'
import { text } from '@utils/tokens'
import ReceiptSettings from './ReceiptSettings'
import UpdateSettings from './UpdateSettings'
import StockStatusSettings from './StockStatusSettings'

const Settings = () => {
  return (
    <div className="items-start p-6 min-h-screen rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2>Configuración de la Aplicación</h2>

      <div className={`${text.label} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8`}>
        <UpdateSettings />
        <ReceiptSettings />
        <StockStatusSettings />
      </div>
    </div>
  )
}

export default Settings
