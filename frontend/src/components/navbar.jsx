import React from 'react'
import { NavLink, useNavigate } from 'react-router'
import { FolderKanban, LogOut, House, UserRound } from 'lucide-react';
import { supabase } from '../supabase-client.js'

function navbar() {
  const content = [
    { icon: <House size={22} />, "title": "Home", nav: "/" },
    { icon: <FolderKanban size={22} />, "title": "Projects", nav: "/projects" },
    { icon: <UserRound size={22} />, "title": "Account", nav: "/account" },
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
    <div className='bg-primary h-screen flex flex-col justify-start shadow-md'>
        <div className='w-full'>
          <div className='flex justify-start items-center mt-10'>
            <p className='text-white ml-5 text-2xl font-bold px-5 -tracking-tighter'>ARC</p>
          </div>
          <ul className='flex flex-col space-y-3 items-cente px-6 mt-10'>
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
    </div>
  )
}

export default navbar