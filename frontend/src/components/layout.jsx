import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './navbar.jsx'

function Layout() {
  return (
    <div className='flex h-screen w-full'>
      <div className='w-[15%] flex-shrink-0 z-10 fixed h-screen'>
        <Navbar />
      </div>
      <div className='w-[85%] ml-[15%]'>
        <Outlet />
      </div>
    </div>
  )
}

export default Layout