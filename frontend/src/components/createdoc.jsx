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
    <div className='h-screen w-full bg-gray-50 p-4 relative'>
      {loading && <div className='inset-0 bg-black opacity-50 fixed z-50'></div>}
      <h1 className='text-2xl font-semibold mb-2'>Generate Your Requirement Content</h1>
      {features.length > 0 && <button onClick={handleDocSubmit} className='absolute top-4 right-4 px-4 py-1 cursor-pointer rounded-2xl bg-primary text-white'>Confirm</button>}
      {features.length > 0 && (<ul className='flex flex-col space-y-6 w-full'>
        {features.map((feature, idx1) => (
          <li key={feature.id} className='bg-white px-2 py-2 rounded-xl border border-gray-400 relative flex flex-col'>
            <div onClick={() => handleFRDelete(feature.id)} className='p-1 hover:bg-gray-200 cursor-pointer rounded-full absolute top-1 right-1'>
              <Trash size={18}></Trash>
            </div>
            <p className='font-semibold text-lg text-gray-800 self-center mb-4'>{`Functional Requirement-${feature.id}`}</p>
            <div className='w-full pb-2 border-b-2 border-b-gray-300'>
              <div className='flex flex-col w-full'>
                <div className='flex items-center h-10'>
                  <p className='font-semibold w-10 text-slate-700'>Title: </p>
                  <input type="text" name={`title${idx1}`} id={`title${idx1}`} value={feature.title} onChange={(e) => handleFrChange(feature.id, "title", e.target.value)} className='w-full bg-gray-100 font-medium text-sm text-gray-800 border border-gray-300 rounded-lg px-2 py-1 ml-2' />
                </div>
                <div className='flex items-center h-10'>
                  <p className='font-semibold w-10 text-slate-700'>Desc: </p>
                  <input type="text" name={`desc${idx1}`} id={`desc${idx1}`} value={feature.description} onChange={(e) => handleFrChange(feature.id, "description", e.target.value)} className='w-full bg-gray-100 font-medium text-sm text-gray-800 border border-gray-300 rounded-lg px-2 py-1 ml-2' />
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <h2 className='font-semibold text-md text-gray-800 my-2 self-center'>Subtasks</h2>
              <ul className='w-full flex flex-col space-y-2'>
                {subfeatures.filter((feat) => (feat.fr_id === feature.id)).map((subfeature, idx2) => (
                  <li key={idx2} className='w-full flex items-center'>
                    <input type="text" name={`subfeat${idx2}`} id={`subfeat${idx2}`} value={subfeature.description} onChange={(e) => handleSubtaskChange(subfeature.id, feature.id, e.target.value)} className='w-full bg-gray-100 font-medium text-sm text-gray-800 border border-gray-300 rounded-lg px-2 py-1' />
                    <div className='flex items-center bg-gray-200 rounded-xl ml-2 h-6 w-30'>
                      <p className='bg-gray-300 h-full rounded-xl text-sm px-2 flex justify-center items-center'>Priority</p>
                      <select name="priority" id="priority" defaultValue={subfeature.priority} onChange={(e) => handlePriorityChange(subfeature.id, e.target.value)} className='ml-1'>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className='flex items-center bg-gray-200 rounded-xl ml-2 h-6 w-40'>
                      <p className='bg-gray-300 h-full rounded-xl text-sm px-2 flex justify-center items-center'>Assign</p>
                      <select name="assignment" id="assignment" defaultValue={subfeature.assigned_to} onChange={(e) => handleAssignmentChange(subfeature.id, e.target.value)} className='ml-1'>
                        <option value="">Choose</option>
                        {members.map((member) => (
                          <option key={`${member.users.user_id}`} value={`${member.users.user_id}`}>{member.users.username}</option>
                        ))}
                      </select>
                    </div>
                    <div onClick={() => handleSubtaskDelete(feature.id, subfeature.id)} className='p-1 rounded-full hover:bg-gray-200 cursor-pointer ml-1'>
                      <Trash size={18}></Trash>
                    </div>
                    <div onClick={() => handleSubtaskAdd(feature.id)} className='p-1 rounded-full hover:bg-gray-200 cursor-pointer'>
                      <Plus size={18}></Plus>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>)}
      {features.length > 0 && <button onClick={handleAddFR} className='bg-white border-2 text-gray-700 border-gray-300 cursor-pointer hover:bg-gray-200 p-1 rounded-lg mb-40 mt-6 w-full'>Add Functional Requirement</button>}
      <div className='fixed ml-[7.5%] bottom-4 left-1/2 -translate-x-1/2 h-26 w-[83%] bg-gray-100 p-2 rounded-xl border-2 border-gray-300 focus-within:border-gray-700 z-20'>
        <textarea name="prompt" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='Enter your prompt here...' className='bg-transparent p-2 rounded-xl w-full h-[63%] top-0 left-0 outline-0'></textarea>
        <div className='absolute left-0 bottom-0 h-[37%] w-full bg-transparent flex justify-between items-center'>
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
          <div onClick={getSRS} className='bg-transparent flex justify-center items-center rounded-full hover:bg-gray-300 p-2 mr-2'>
            <SendHorizontal color='#2D3748'></SendHorizontal>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateDoc