import React from 'react'
import { NavLink } from 'react-router'
import { FolderKanban } from 'lucide-react';

function navbar() {
  const content = [
    { icon: <FolderKanban size={22} />, "title": "Projects", nav: "/" },
    { icon: <FolderKanban size={22} />, "title": "Temp", nav: "/temp1" }
  ]

  return (
    <div className='bg-primary h-screen flex flex-col justify-center shadow-md'>
        <div className='w-full'>
          <ul className='flex flex-col space-y-3 items-cente px-6'>
            {content.map((tab, idx) => (
              <li key={idx} className="w-full">
                <NavLink to={tab.nav} className={({ isActive }) => `rounded-lg flex items-center space-x-3 px-3 py-2 text-white ${isActive ? 'bg-[#2f2f2f]' : 'bg-transparent'}`}>
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