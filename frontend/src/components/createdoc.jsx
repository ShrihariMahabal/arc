import React, { useState, useRef, useEffect } from 'react';
import { Plus, SendHorizontal, X, Trash, EllipsisVertical } from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router';

function CreateDoc() {

  const [prompt, setPrompt] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [features, setFeatures] = useState([])
  const [subfeatures, setSubfeatures] = useState([])
  const [members, setMembers] = useState([])
  const { id: projectId } = useParams()
  const [graphState, setGraphState] = useState({})
  const navigate = useNavigate()
  console.log("projectId", projectId)

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    e.preventDefault()
    const fileList = Array.from(e.target.files)
    setFiles(prevFiles => [...prevFiles, ...fileList])

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }

  const getSRS = async () => {
    if (!prompt && files.length === 0) {
      alert('Please enter a prompt or choose some files');
      return;
    }

    const formData = new FormData();
    formData.append('projectId', projectId)
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
      const response = await axios.post('http://localhost:5001/generate_content', formData)
      setLoading(false)
      setGraphState(response.data.langgraph_state)
      setFeatures(response.data.features)
      setSubfeatures(response.data.subfeatures)
      setMembers(response.data.project_members)
      console.log("features", response.data.features)
      console.log("subfeatures", response.data.subfeatures)
      console.log("state", response.data.langgraph_state)
      console.log("members", response.data.project_members)
      setPrompt('')
      setFiles([])
      // navigate(`/projects/${projectId}`)
    } catch (err) {
      setLoading(false)
      alert("error sending data")
      console.error('Error uploading:', err);
    }
  }

  const handleRemoveFile = (idx) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== idx))
  }

  const handleFrChange = (id, key, value) => {
    const updatedFeatures = features.map((feat) => feat.id === id ? { ...feat, [key]: value } : feat)
    setFeatures(updatedFeatures)
  }

  const handleSubtaskChange = (id, fr_id, value) => {
    const updatedSubFeatures = subfeatures.map((subfeat) => (subfeat.id === id && subfeat.fr_id === fr_id ? { ...subfeat, description: value } : subfeat))
    setSubfeatures(updatedSubFeatures)
  }

  const handleSubtaskAdd = (featId) => {
    const newLastId = subfeatures.length > 0 ? (subfeatures[subfeatures.length - 1].id) + 1 : 0
    console.log(newLastId)
    const newSubFeature = { id: newLastId, description: "", fr_id: featId, project_id: projectId, assigned_to: "" }
    setSubfeatures(s => [...s, newSubFeature])
    console.log(newSubFeature)
  }

  const handleSubtaskDelete = (featId, subfeatId) => {
    const updatedSubFeatures = subfeatures.filter((subfeat) => subfeat.fr_id !== featId || subfeat.id !== subfeatId).map((subfeat) => subfeat.id > subfeatId ? { ...subfeat, id: subfeat.id - 1 } : subfeat)
    setSubfeatures(updatedSubFeatures)
    console.log(updatedSubFeatures)
  }

  const handleAddFR = () => {
    const newFR = { id: features[features.length - 1].id + 1, title: "", description: "", project_id: projectId }
    setFeatures(f => [...f, newFR])
    handleSubtaskAdd(newFR.id)
    console.log(newFR)
  }

  const handleFRDelete = (featId) => {
    const newFeatures = features.filter((feat) => feat.id !== featId).map((feat) => feat.id > featId ? { ...feat, id: feat.id - 1 } : feat)
    const newSubFeatures = subfeatures.filter((subfeat) => subfeat.fr_id !== featId).map((subfeat) => subfeat.fr_id > featId ? { ...subfeat, fr_id: subfeat.fr_id - 1 } : subfeat)
    setFeatures(newFeatures)
    setSubfeatures(newSubFeatures)
    console.log(newSubFeatures)
  }

  const handleAssignmentChange = (subfeatId, value) => {
    const updatedSubFeatures = subfeatures.map((subfeat) => subfeat.id === subfeatId ? {...subfeat, assigned_to: value} : subfeat)
    setSubfeatures(updatedSubFeatures)
    console.log(updatedSubFeatures)
  }
  
  const handlePriorityChange = (subfeatId, value) => {
    const updatedSubFeatures = subfeatures.map((subfeat) => subfeat.id === subfeatId ? {...subfeat, priority: value} : subfeat)
    setSubfeatures(updatedSubFeatures)
    console.log(updatedSubFeatures)
  }

  const handleDocSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5001/generate_srs', { frs: features, subtasks: subfeatures, project_id: projectId, langgraph_state: graphState })
      navigate('/')
    } catch (error) {
      console.log("Doc Submit Error: ", error)
    }
  }

  return (
    <div className='min-h-screen w-full bg-gray-50 p-8 relative pb-48'>
      {loading && (
        <div className='inset-0 bg-black opacity-50 fixed z-50 flex items-center justify-center'>
          <div className='bg-white rounded-xl p-6 shadow-2xl'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-700 mx-auto'></div>
            <p className='text-gray-700 font-medium mt-4 text-center'>Generating content...</p>
          </div>
        </div>
      )}
      
      <div className='max-w-6xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>Generate Your Requirement Content</h1>
            <p className='text-gray-600'>Create and manage functional requirements for your project</p>
          </div>
          {features.length > 0 && (
            <button 
              onClick={handleDocSubmit} 
              className='px-6 py-3 bg-primary hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105'
            >
              Confirm & Generate SRS
            </button>
          )}
        </div>

        {features.length > 0 && (
          <div className='space-y-8'>
            {features.map((feature, idx1) => (
              <div key={feature.id} className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
                {/* Feature Header */}
                <div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 relative'>
                  <button 
                    onClick={() => handleFRDelete(feature.id)} 
                    className='absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200'
                  >
                    <Trash size={18} />
                  </button>
                  <h2 className='text-xl font-bold text-gray-800 text-center pr-12'>
                    Functional Requirement #{feature.id}
                  </h2>
                </div>

                {/* Feature Details */}
                <div className='p-6 space-y-4'>
                  <div className='grid grid-cols-1 gap-4'>
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-700'>Title</label>
                      <input 
                        type="text" 
                        name={`title${idx1}`} 
                        id={`title${idx1}`} 
                        value={feature.title} 
                        onChange={(e) => handleFrChange(feature.id, "title", e.target.value)} 
                        className='w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200' 
                        placeholder='Enter feature title...'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-gray-700'>Description</label>
                      <textarea 
                        name={`desc${idx1}`} 
                        id={`desc${idx1}`} 
                        value={feature.description} 
                        onChange={(e) => handleFrChange(feature.id, "description", e.target.value)} 
                        className='w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 min-h-[80px] resize-y' 
                        placeholder='Enter feature description...'
                      />
                    </div>
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className='px-6 pb-6'>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 text-center'>Subtasks</h3>
                    <div className='space-y-3'>
                      {subfeatures.filter((feat) => (feat.fr_id === feature.id)).map((subfeature, idx2) => (
                        <div key={idx2} className='bg-white rounded-xl p-4 border border-gray-200 shadow-sm'>
                          <div className='flex items-center gap-3'>
                            <div className='flex-1'>
                              <input 
                                type="text" 
                                name={`subfeat${idx2}`} 
                                id={`subfeat${idx2}`} 
                                value={subfeature.description} 
                                onChange={(e) => handleSubtaskChange(subfeature.id, feature.id, e.target.value)} 
                                className='w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200' 
                                placeholder='Enter subtask description...'
                              />
                            </div>
                            
                            <div className='flex items-center bg-gray-100 rounded-lg px-2 py-1'>
                              <span className='text-xs font-medium text-gray-600 mr-2'>Priority:</span>
                              <select 
                                name="priority" 
                                id="priority" 
                                defaultValue={subfeature.priority} 
                                onChange={(e) => handlePriorityChange(subfeature.id, e.target.value)} 
                                className='bg-transparent text-xs font-medium text-gray-700 border-none outline-none'
                              >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            </div>
                            
                            <div className='flex items-center bg-gray-100 rounded-lg px-2 py-1'>
                              <span className='text-xs font-medium text-gray-600 mr-2'>Assign:</span>
                              <select 
                                name="assignment" 
                                id="assignment" 
                                defaultValue={subfeature.assigned_to} 
                                onChange={(e) => handleAssignmentChange(subfeature.id, e.target.value)} 
                                className='bg-transparent text-xs font-medium text-gray-700 border-none outline-none max-w-24'
                              >
                                <option value="">Choose</option>
                                {members.map((member) => (
                                  <option key={`${member.users.user_id}`} value={`${member.users.user_id}`}>
                                    {member.users.username}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <button 
                              onClick={() => handleSubtaskDelete(feature.id, subfeature.id)} 
                              className='p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200'
                            >
                              <Trash size={16} />
                            </button>
                            
                            <button 
                              onClick={() => handleSubtaskAdd(feature.id)} 
                              className='p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200'
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddFR} 
              className='w-full bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 font-semibold py-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2'
            >
              <Plus size={20} />
              Add Functional Requirement
            </button>
          </div>
        )}
      </div>

      {/* Fixed Bottom Input */}
      <div className='fixed ml-[7.5%] bottom-4 left-1/2 -translate-x-1/2 h-26 w-[83%] bg-white rounded-2xl border-2 border-gray-300 focus-within:border-gray-700 z-20 shadow-2xl'>
        <textarea 
          name="prompt" 
          id="prompt" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder='Describe your requirements or upload files to generate functional requirements...' 
          className='bg-transparent p-4 rounded-2xl w-full h-[63%] top-0 left-0 outline-0 text-gray-800 placeholder-gray-500 resize-none'
        />
        
        <div className='absolute left-[-0.5rem] bottom-1 h-[37%] w-full bg-transparent flex justify-between items-center px-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-gray-100 hover:bg-gray-200 flex justify-center items-center rounded-full p-2 transition-all duration-200 cursor-pointer left-[-1rem]'>
              <input 
                type="file" 
                id='file-upload' 
                ref={fileInputRef} 
                accept="application/pdf" 
                multiple 
                className='hidden' 
                onChange={handleFileChange} 
              />
              <label htmlFor="file-upload" className='cursor-pointer'>
                <Plus color='#374151' size={20} />
              </label>
            </div>
            
            <div className='flex gap-2'>
              {files.map((file, idx) => (
                <div key={idx} className='bg-gray-100 rounded-lg px-3 py-2 relative max-w-32'>
                  <button 
                    onClick={() => handleRemoveFile(idx)} 
                    className='absolute -top-2 -right-2 p-1 rounded-full bg-gray-500 hover:bg-red-500 text-white transition-all duration-200'
                  >
                    <X size={12} />
                  </button>
                  <p className='text-sm text-gray-700 truncate pr-2'>{file.name}</p>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={getSRS} 
            className={`bg-gray-800 hover:bg-gray-700 flex justify-center items-center rounded-full p-2 transition-all duration-200 bottom-2 -mr-4 ${
              (!prompt && files.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 shadow-lg'
            }`}
            disabled={!prompt && files.length === 0}
          >
            <SendHorizontal color='white' size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateDoc