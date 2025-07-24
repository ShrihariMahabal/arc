import React from 'react'
import { Outlet } from 'react-router'
import Navbar from './navbar.jsx'

function Layout() {
  return (
    <div className='flex h-screen w-[100%]'>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default Layout