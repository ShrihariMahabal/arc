import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import Modal from '../reusable/modal';
import { supabase } from '../supabase-client';
import { v4 as uuidv4 } from 'uuid';
import Card from '../reusable/card';

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [projects, setProjects] = useState([]);
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.log("Session error or not found", error);
        return;
      }

      const userId = session.user.id;
      setUserId(userId);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*, users (username)")
        .eq("admin", userId);

      if (projectsError) {
        console.log(projectsError);
      } else {
        setProjects(projectsData);
      }
    };

    fetchProjects();
  }, []);

  const onGotoProject = async (project) => {
    const { data: projectData, error: projectError } = await supabase.from("frs").select("*").eq("id", project.id).limit(1).maybeSingle()
    if (projectError) {
      console.log("fr retrieving error", projectError)
    } else {
      if (projectData) {
        navigate(`/projects/${project.id}`)
      } else {
        navigate(`/projects/create_doc/${project.id}`)
      }
    }
  }


  const handleCreateProject = async () => {
    if (!title || !description || !url) {
      alert("Please enter all details")
      return
    }
    let uid = uuidv4();
    const { data, error } = await supabase.from("projects").insert({ "name": title, "description": description, "github_url": url, "invite_code": uid, admin: userId }).select().single();
    if (error) {
      console.log(error);
    } else {
      const projectId = data.id;
      navigate(`/projects/create_doc/${projectId}`);
    }
  }

  return (
    <div className='min-h-screen w-full bg-gray-50 p-4 relative'>
      {isModalOpen && <div className='fixed inset-0 bg-black opacity-50 backdrop-blur-xl z-10'></div>}
      <h1 className='text-2xl font-semibold mb-2'>Your Projects</h1>
      <ul className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {projects.map((project, idx) => (
          <li key={idx}>
            <div onClick={() => onGotoProject(project)}>
              <Card title={project.name}>
                <p className='text-sm mb-1'>{project.description}</p>
                <p className='text-xs text-gray-500'>
                  Created by: <span className='font-medium text-gray-700'>{project.users.username}</span>
                </p>
              </Card>
            </div>
          </li>
        ))}
      </ul>

      <div onClick={() => setIsModalOpen(true)} className='px-3 py-2 bg-primary rounded-xl text-white fixed bottom-6 right-6 font-semibold hover:scale-110 transition-all cursor-pointer'>Create Project</div>
      {isModalOpen && <div className='fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-50'>
        <Modal title="Create Project" onClose={() => setIsModalOpen(false)} onSubmit={handleCreateProject}>
          <div className='flex flex-col space-y-2'>
            <div className='flex flex-col space-x-1'>
              <label htmlFor="title">
                <p className='text-medium'>Project Title</p>
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" name="title" id="title" placeholder='Ex- Todo App' className='bg-gray-200 rounded-sm p-1' />
            </div>
            <div className='flex flex-col space-x-1'>
              <label htmlFor="description">
                <p className='text-medium'>Project Description</p>
              </label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} type="text" name="title" id="description" placeholder='Ex- Handles tasks' className='bg-gray-200 rounded-sm p-1' />
            </div>
            <div className='flex flex-col space-x-1'>
              <label htmlFor="url">
                <p className='text-medium'>Github URL</p>
              </label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} type="text" name="url" id="url" placeholder='Ex- github.com/your_name/name' className='bg-gray-200 rounded-sm p-1' />
            </div>
          </div>
        </Modal>
      </div>}
    </div>
  )
}

export default Projects