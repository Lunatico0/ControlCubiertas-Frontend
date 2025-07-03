import { useContext } from 'react'
import { showToast } from '@utils/toast'
import LayoutPreview from './LayoutPreview.jsx'
import { SettingsContext } from '@context/SettingsContext'

const ReceiptSettings = () => {
  const { receiptLayout, setReceiptLayout } = useContext(SettingsContext)

  const handleSelect = (value) => {
    setReceiptLayout(value)
    showToast("success", "Formato de comprobante guardado")
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <h2>Formato del Comprobante</h2>
      <div className='flex flex-col md:flex-row gap-4'>
        <LayoutPreview type="dynamic" selected={receiptLayout} onSelect={handleSelect} />
        <LayoutPreview type="fixed" selected={receiptLayout} onSelect={handleSelect} />
      </div>
    </div>
  )
}

export default ReceiptSettings
