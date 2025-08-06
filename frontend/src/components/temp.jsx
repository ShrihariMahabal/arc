import React, { useState, useRef } from 'react'
import { Plus, SendHorizontal, X } from 'lucide-react'
import axios from 'axios'

function temp() {

  const [prompt, setPrompt] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    e.preventDefault()
    const fileList = Array.from(e.target.files)
    setFiles(prevFiles => [...prevFiles, ...fileList])

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }

  const handleFileUpload = async () => {
    if (!prompt && files.length === 0) {
      alert('Please enter a prompt or choose some files');
      return;
    }
    
    const formData = new FormData();
    if (!prompt) {
      formData.append('prompt', 'Create a well defined SRS document based on the uploaded files')
    } else {
      formData.append('prompt', prompt)
    }
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append(`file-${i}`, files[i])
      }
    }

    try {
      setLoading(true)
      const response = await axios.post('http://localhost:5001/generate_contend', formData);
      setLoading(false)
      console.log('Upload response:', response.data);
      setPrompt('')
      setFiles([])
    } catch (err) {
      setLoading(false)
      console.error('Error uploading:', err);
    }
  }

  const handleRemoveFile = (idx) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== idx))
  }

  return (
    <div className='h-screen w-full bg-gray-50 p-4 relative'>
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 h-26 w-[90%] bg-gray-50 p-2 rounded-xl border-2 border-gray-300 focus-within:border-gray-700'>
        <textarea name="prompt" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='Enter your prompt here...' className='bg-transparent p-2 rounded-xl w-full h-[63%] absolute top-0 left-0 outline-0'></textarea>
        <div className='fixed left-0 bottom-0 h-[37%] w-full bg-transparent flex justify-between items-center'>
          <div className='flex'>
            <div className='bg-transparent flex justify-center items-center rounded-full hover:bg-gray-300 p-1 ml-1'>
              <input type="file" id='file-upload' ref={fileInputRef} accept="application/pdf" multiple className='hidden' onChange={handleFileChange} ></input>
              <label htmlFor="file-upload">
                <Plus color='#2D3748'></Plus>
              </label>
            </div>
            <div>
              <ul className='flex space-x-2'>
                {files.map((file, idx) => (
                  <li key={idx}>
                    <div className='bg-gray-200 rounded-lg px-2 py-1 relative'>
                      <div onClick={() => handleRemoveFile(idx)} className='p-1 rounded-full bg-gray-300 absolute top-0 -translate-y-1/2 translate-x-1/2 right-0 flex justify-center items-center'>
                        <X size={10}></X>
                      </div>
                      <p>{file.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div onClick={handleFileUpload} className='bg-transparent flex justify-center items-center rounded-full hover:bg-gray-300 p-2 mr-2'>
            <SendHorizontal color='#2D3748'></SendHorizontal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default temp