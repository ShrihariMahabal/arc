import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from './components/layout.jsx'
import Home from './components/home.jsx'
import Login from './auth/Login.jsx'
import Register from './auth/Register.jsx'
import Projects from './components/projects.jsx'
import CreateDoc from './components/createdoc.jsx';
import ProjectLayout from './components/projectlayout.jsx';
import ProjectPage from './components/projectpage.jsx';
import WaitingPage from './components/waiting.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='projects' element={<ProjectLayout />}>
            <Route index element={<Projects />} />
            <Route path='loading' element={<WaitingPage />}></Route>
            <Route path=':id' element={<ProjectPage/>}></Route>
            <Route path='create_doc/:id' element={<CreateDoc />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
