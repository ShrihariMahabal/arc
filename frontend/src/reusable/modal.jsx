import React from 'react'

function Modal({title, children, onSubmit, onClose}) {
  return (
    <div className='p-4 rounded-lg flex flex-col space-y-4 justify-between bg-gray-100 w-120'>
      <h1 className='text-xl font-semibold'>{title}</h1>
      <div>{children}</div>
      <div className='flex justify-end items-center space-x-2'>
        <button onClick={onClose} className='px-4 py-2 bg-transparent rounded-xl flex justify-center items-center cursor-pointer hover:bg-gray-200'>
          <p>Close</p>
        </button>
        <button className='px-4 py-2 bg-primary rounded-xl flex justify-center items-center cursor-pointer'>
          <p className='text-white'>Submit</p>
        </button>
      </div>
    </div>
  )
}

export default Modal