import React from 'react'

function temp() {
  return (
    <div className='min-h-screen w-full bg-gray-50 p-4 relative'>
      <textarea name="prompt" id="prompt" placeholder='Enter your prompt here...' className='bg-gray-200 p-2 rounded-xl w-[90%] h-20 absolute bottom-4 left-1/2 -translate-x-1/2 border-2 border-gray-400 focus:ring-gray-400 focus:border-gray-400'></textarea>
    </div>
  )
}

export default temp