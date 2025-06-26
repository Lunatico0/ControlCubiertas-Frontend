import { useState } from "react"
import Sidebar from "@components/Sidebar/Sidebar"
import Home from "@components/Home"
import Vehicles from "@components/vehicleList/VehicleList"
import Settings from "@components/Settings"

const Layout = () => {
  const [activeSection, setActiveSection] = useState("tires")

  const renderSection = () => {
    switch (activeSection) {
      case "tires":
        return <Home />
      case "vehicles":
        return <Vehicles setActive={setActiveSection} />
      case "settings":
        return <Settings />
      default:
        return <Home />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-200 dark:bg-gray-900 text-white">
      <Sidebar active={activeSection} setActive={setActiveSection} />

      <main className="flex-1 overflow-y-auto h-screen pl-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}

export default Layout
