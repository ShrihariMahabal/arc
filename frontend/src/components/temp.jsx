import React from 'react'

function temp() {
  return (
    <div className='min-h-screen w-[80%] bg-gray-50 p-4 relative'>
      <textarea name="prompt" id="prompt" placeholder='Enter your prompt here...' className='bg-gray-100 p-2 border border-gray-300 ring ring-gray-300 fixed bottom-4 right-2 w-[75%] h-20 rounded-xl mr-8'></textarea>
    </div>
  )
}

export default temp