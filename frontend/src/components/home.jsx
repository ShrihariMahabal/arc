import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase-client';
import Badge from '../reusable/badge';

function Home() {

  const [userId, setUserId] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.log("error fetching user data", userError);
      }
      const user_id = session.user.id;

      const { data: projectsData, error: projectsError } = await supabase.from("projects").select("*, members (user_id)").eq("members.user_id", user_id);
      if (projectsError) {
        console.log("error fetching projects", projectsError);
      }
      setProjects(projectsData);
      console.log("projects", projectsData);

      // const {data: projectsWhereAdminData, error: projectsWhereAdminError} = await supabase.from("projects").select("*").eq("admin", user_id);
      // if (projectsWhereAdminError) {
      //   console.log("error fetching admin projects", projectsWhereAdminError);
      // }
      // setProjects(prevProjects => [...prevProjects, projectsWhereAdminData]);
      // console.log("admin projects", projectsWhereAdminData);

      const { data: tasksData, error: tasksError } = await supabase.from("subfeatures").select("*").eq("assigned_to", user_id).eq("priority", "high").eq("status", "ongoing");
      if (tasksError) {
        console.log("error fetching tasks", tasksError);
      }
      console.log("tasks data", tasksData);
      setTasks(tasksData);
    }

    getData();
  }, [])

  return (
    <div className='bg-gray-50 min-h-screen p-4'>
      <h1 className='text-2xl font-semibold mb-2'>Dashboard</h1>
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-y-auto max-h-100'>
        <table>
          <tbody>
            {projects.map((project) => (
              <React.Fragment key={project.id}>
                <tr>
                  <th colSpan={3} className='bg-gray-50 text-gray-700 font-medium text-sm px-6 py-3 text-left border-b border-gray-200'>
                      Title: {project.name}
                  </th>
                </tr>
                <tr className='bg-gray-50 text-gray-600 text-xs uppercase tracking-wide'>
                  <th className='w-[4%] py-2 px-6 border-r border-gray-200'>No.</th>
                  <th className='w-[91%] py-2 px-6 border-r border-gray-200'>Description</th>
                  <th className='w-[5%] py-2 px-6'>Priority</th>
                </tr>
                {tasks.filter((task) => task.project_id === project.id).map((task, idx) => (
                  <tr key={task.id}>
                    <td>{idx}</td>
                    <td>{task.description}</td>
                    <td>
                      <Badge bgCol="bg-red-100" textCol="text-red-800" textSize="text-sm">{task.priority}</Badge>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Home