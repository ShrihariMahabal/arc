import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './navbar.jsx'

function Layout() {
  return (
    <div className='flex h-screen w-full'>
      <div className='w-[15%] flex-shrink-0'>
        <Navbar />
      </div>
      <div className='w-[85%]'>
        <Outlet />
      </div>
    </div>
  )
}

export default Layout