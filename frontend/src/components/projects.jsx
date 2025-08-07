import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import Modal from '../reusable/modal';
import { supabase } from '../supabase-client';
import { v4 as uuidv4 } from 'uuid';
import Card from '../reusable/card';
import { X } from 'lucide-react';

function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [seachResults, setSearchResults] = useState([]);
  const [members, setMembers] = useState([]);
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
      console.log("current user: ",userId)
      setUserId(userId);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*, users!projects_admin_fkey (username)")
        .eq("admin", userId);

      if (projectsError) {
        console.log("error fetching projects", projectsError);
      } else {
        setProjects(projectsData);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      if (query.trim() !== "") {
        searchUsers(query);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debouncedSearch);
  }, [query])

  const searchUsers = async (query) => {
    const { data: searchData, error: searchError } = await supabase.from("users").select("user_id, username").ilike("username", `%${query}%`);
    if (searchError) {
      console.log("search error", searchError);
      return;
    }
    const updatedSearchData = searchData.filter((user) => user.user_id !== userId).filter((user) => !members.some((m) => m.user_id === user.user_id));;
    setSearchResults(updatedSearchData);
  }

  const handleMemberAdd = (user) => {
    setQuery("");
    setMembers(m => [...m, user]);
  }

  const handleMemberRemove = (member) => {
    const updatedMembers = members.filter((user) => user.user_id !== member.user_id);
    setMembers(updatedMembers);
  }

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
    if (!title || !description || !url || members.length === 0) {
      alert("Please enter all details")
      return
    }
    let uid = uuidv4();
    const { data: projectData, error: projectError } = await supabase.from("projects").insert({ "name": title, "description": description, "github_url": url, "invite_code": uid, admin: userId }).select().single();
    if (projectError) {
      console.log(error);
      return;
    }
    const projectId = projectData.id;
    const projectMembers = members.map((member) => ({project_id: projectId, user_id: member.user_id}));
    const  {data: memberData, error: memberError} = await supabase.from("members").insert(projectMembers);
    if (memberError) {
      console.log("error inserting members", memberError);
      return
    }
    navigate(`/projects/create_doc/${projectId}`);
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
          <div className='flex flex-col space-y-4'>
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
            <div className='flex flex-col space-y-2 relative'>
              <div className='flex flex-col space-x-1'>
                <label htmlFor="users">
                  <p className='text-medium'>Add Project Members</p>
                </label>
                <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" name="users" id="users" placeholder='Ex- ShrihariMahabal, etc.' className='bg-gray-200 rounded-sm p-1' />
              </div>
              {seachResults.length > 0 && <div className='absolute z-50 px-2 py-2 top-15 w-full bg-gray-100 border border-gray-300 rounded-xl'>
                <ul className='flex flex-col space-y-2'>
                  {seachResults.map((user, idx) => (
                    <li key={user.user_id} onClick={() => handleMemberAdd(user)} className='px-2 py-1 w-full cursor-pointer hover:bg-gray-200 rounded-lg'>
                      <p>{user.username}</p>
                    </li>
                  ))}
                </ul>
              </div>}
              {members.length > 0 && <ul className='w-full grid grid-cols-5 gap-2 mt-2'>
                {members.map((member) => (
                  <li className='relative bg-gray-200 px-2 py-1 flex justify-center items-center rounded-lg'>
                    <p className='truncate'>{member.username}</p>
                    <div onClick={() => handleMemberRemove(member)} className='absolute flex justify-center items-center rounded-full bg-gray-300 top-0 right-0 translate-x-1/2 -translate-y-1/2'>
                      <X size={12}></X>
                    </div>
                  </li>
                ))}
              </ul>}
            </div>
          </div>
        </Modal>
      </div>}
    </div>
  )
}

export default Projects