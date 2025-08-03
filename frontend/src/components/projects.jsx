import React, { useState } from 'react'
import {Link} from 'react-router'
import Modal from '../reusable/modal'

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")

  // const handleCreateProject = async () => {

  // }

  return (
    <div className='min-h-screen w-full bg-gray-50 p-4 relative'>
        {isModalOpen && <div className='fixed inset-0 bg-black opacity-50 backdrop-blur-xl z-10'></div>}
        <h1 className='text-2xl font-semibold mb-2'>Your Projects</h1>
        <div onClick={() => setIsModalOpen(true)} className='px-3 py-2 bg-primary rounded-xl text-white fixed bottom-6 right-6 font-semibold hover:scale-110 transition-all cursor-pointer'>Create Project</div>
        {isModalOpen && <div className='fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50'>
          <Modal title="Create Project" onClose={() => setIsModalOpen(false)}>
            <div className='flex flex-col space-y-2'>
              <div className='flex flex-col space-x-1'>
                <label htmlFor="title">
                  <p className='text-medium'>Project Title</p>
                </label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" name="title" id="title" placeholder='Ex- Todo App' className='bg-gray-200 rounded-sm p-1'/>
              </div>
              <div className='flex flex-col space-x-1'>
                <label htmlFor="description">
                  <p className='text-medium'>Project Description</p>
                </label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} type="text" name="title" id="description" placeholder='Ex- Handles tasks' className='bg-gray-200 rounded-sm p-1'/>
              </div>
              <div className='flex flex-col space-x-1'>
                <label htmlFor="url">
                  <p className='text-medium'>Github URL</p>
                </label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} type="text" name="url" id="url" placeholder='Ex- github.com/your_name/name' className='bg-gray-200 rounded-sm p-1'/>
              </div>
            </div>
          </Modal>
          </div>}
    </div>
  )
}

export default Projects