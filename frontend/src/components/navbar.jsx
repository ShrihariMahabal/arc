import React from 'react'
import { NavLink } from 'react-router'

function navbar() {
  return (
    <div className='bg-primary h-screen w-[20%] flex flex-col justify-center'>
      <div className='flex flex-col space-y-2 justify-between items-center p-4'>
        <NavLink to="/" className={({ isActive }) => `w-[80%] px-4 py-2 rounded-md flex justify-center items-center text-md ${isActive ? 'bg-white text-primary' : 'text-white hover:bg-gray-800'}`}>Temp</NavLink>
        <NavLink to="/temp1" className={({ isActive }) => `w-[80%] px-4 py-2 rounded-md flex justify-center items-center text-md ${isActive ? 'bg-white text-primary' : 'text-white hover:bg-gray-800'}`}>Temp1</NavLink>
      </div>
    </div>
  )
}

export default navbar