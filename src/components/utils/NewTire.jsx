import React from 'react'

const NewTire = ({ setIsTireModalOpen }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsTireModalOpen(false)}>
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative z-10"
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-1 right-2">
          <button
            onClick={() => setIsTireModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>

        <h2 className="text-4xl font-bold mb-4 text-center">
          Nueva cubierta
        </h2>


      </div>
    </div>
  )
}

export default NewTire
