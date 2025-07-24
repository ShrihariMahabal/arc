import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from './components/layout.jsx'
import Temp from './components/temp.jsx'
import Temp1 from './components/temp1.jsx'
import Login from './auth/Login.jsx'
import Register from './auth/Register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/' element={<Layout />}>
          <Route index element={<Temp />} />
          <Route path="temp1" element={<Temp1 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
