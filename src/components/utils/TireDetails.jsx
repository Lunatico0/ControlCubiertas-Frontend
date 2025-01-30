import React from 'react'

const TireDetails = ({ id }) => {
  return (
    <div className='absolute z-50 top-0 left-0 w-1/2 h-2/3 bg-gray-900 bg-opacity-50 flex justify-center items-center'>
      <h2>El Id de la cubierta es: {id}</h2>
    </div>
  )
}

export default TireDetails