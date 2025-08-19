import React from 'react'
import { NavLink, useNavigate } from 'react-router'
import { FolderKanban, LogOut, House } from 'lucide-react';
import { supabase } from '../supabase-client.js'

function navbar() {
  const content = [
    { icon: <House size={22} />, "title": "Home", nav: "/" },
    { icon: <FolderKanban size={22} />, "title": "Projects", nav: "/projects" },
  ]

  const navigate = useNavigate();
  const handleLogout = async () => {
    const {error} = await supabase.auth.signOut()
    if (error) {
      console.log(error)
    } else {
      navigate("/login")
    }
  }

  return (
    <div className='bg-primary h-screen flex flex-col justify-between shadow-md'>
        <div className='mt-6 flex justify-center items-center'>
          <p className='text-primary text-2xl font-bold px-6'>ARC</p>
        </div>
        <div className='w-full'>
          <ul className='flex flex-col space-y-3 items-cente px-6'>
            {content.map((tab, idx) => (
              <li key={idx} className="w-full">
                <NavLink to={tab.nav} className={({ isActive }) => `rounded-lg flex items-center space-x-3 px-3 py-2 text-white hover:bg-[#2f2f2f] ${isActive ? 'bg-[#2f2f2f]' : 'bg-transparent'}`}>
                  {tab.icon}
                  <p className='font-medium text-sm'>{tab.title}</p>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className='px-6'>
          <button onClick={handleLogout} className='w-full rounded-lg flex items-center space-x-3 px-3 py-2 text-white bg-transparent cursor-pointer hover:bg-[#2f2f2f] mb-6'>
            <LogOut size={22} />
            <p className='font-medium text-sm'>Logout</p>
          </button>
        </div>
    </div>
  )
}

export default navbar