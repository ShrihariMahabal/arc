import React from 'react'

function Card({ title, children, width, height }) {
  return (
    <div className={`${width} ${height} p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-[1.02] border border-gray-200 cursor-pointer flex flex-col`}>
      <h2 className='text-xl font-semibold text-gray-800 mb-2'>{title}</h2>
      <div className='text-gray-600'>{children}</div>
    </div>
  )
}

export default Card
