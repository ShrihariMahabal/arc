import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../supabase-client';
import Badge from '../reusable/badge';

function ProjectPage() {
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState({});
  const [frs, setFrs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectDetails = async () => {
      const { data: projData, error: projError } = await supabase.from("projects").select("*, users!projects_admin_fkey (username)").eq("id", projectId).single();
      if (projError) {
        console.log("error fetching project data", projError);
        return;
      }
      setProjectData(projData)
      console.log("project data", projData)

      const { data: membersData, error: membersError } = await supabase.from("members").select("*, users (username)").eq("project_id", projectId);
      if (membersError) {
        console.log("error fetching members", membersError);
        return
      }
      setMembers(membersData);
      console.log("membersData", membersData);

      const { data: FrsData, error: FrsError } = await supabase.from("frs").select("*").eq('project_id', projectId);
      if (FrsError) {
        console.log("Error fetching project data", FrsError);
        return;
      }
      setFrs(FrsData);
      console.log("frs: ", FrsData);

      const { data: tasksData, error: tasksError } = await supabase.from("subfeatures").select("*, users (username)").eq("project_id", projectId);
      if (tasksError) {
        console.log("error fetching tasks");
        return;
      }
      setTasks(tasksData);
      console.log("tasks: ", tasksData);
    }
    fetchProjectDetails();
  }, [])

  const handleTaskComplete = async (taskId, e, idx) => {
    const {data: taskUpdateData, error: taskUpdateError} = await supabase.from("subfeatures").update({status: "complete"}).eq("id", taskId);
    if (taskUpdateError) {
      console.log("error updating task to complete: ", taskUpdateError);
      return;
    }
    setTasks(prevTasks => prevTasks.map((task) => task.id === taskId ? {...task, status: "complete"} : task));
  }

  const handleTaskIncomplete = async (taskId, e, idx) => {
    let newStatus;
    if (tasks[idx].assigned_to.length > 0) {
      newStatus = "ongoing";
    } else {
      newStatus = "todo";
    }
    const {data, error} = await supabase.from("subfeatures").update({status: newStatus}).eq("id", taskId);
    if (error) {
      console.log("error updating subfeatures: ", error);
      return;
    }
    setTasks(prevTasks => prevTasks.map((task) => task.id === taskId ? {...task, status: newStatus} : task))
  }

  return (
    <div className='min-h-screen w-full bg-white'>
      {/* Header Section */}
      <div className="bg-white rounded-lg py-6 px-8 shadow-sm mb-8 border border-gray-100">
          <h1 className="text-3xl font-semibold text-gray-800">{projectData.name}</h1>
          <p className="mt-3 text-gray-600">{projectData.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">Created by:</span> 
            <span className="bg-gray-100 px-2 py-1 rounded-md">{projectData?.users?.username}</span>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className='space-y-8'>
          {frs.map((fr) => (
            <div key={fr.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
              <table className='w-full'>
                <thead>
                  <tr>
                    <th colSpan={3} className='bg-gray-100 text-black font-medium text-base px-6 py-4 text-left'>
                      Functional Requirement #{fr.id}
                    </th>
                  </tr>
                  <tr>
                    <th colSpan={3} className='bg-gray-50 text-gray-700 font-medium text-sm px-6 py-3 text-left border-b border-gray-200'>
                      To Do
                    </th>
                  </tr>
                  <tr className='bg-gray-50 text-gray-600 text-xs uppercase tracking-wide'>
                    <th className='px-6 py-2 w-[3%] border-r border-gray-200'></th>
                    <th className='px-6 py-2 text-left w-[90%] border-r border-gray-200'>Task Description</th>
                    <th className='px-6 py-2 text-center w-[7%]'>Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const todoTasks = tasks.filter(
                      (task) => task.fr_id === fr.id && task.status === "todo"
                    );

                    return todoTasks.length > 0 ? (
                      todoTasks.map((task, index) => (
                        <tr key={task.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/30 transition-colors duration-150`}>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <input 
                              type="checkbox" 
                              name={task.id} 
                              onClick={(e) => handleTaskComplete(task.id, e, index)}
                              id={task.id}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                            />
                          </td>
                          <td className="px-6 py-4 text-gray-800 border-r border-gray-200">
                            {task.description}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 text-sm">
                            {task.users?.username ? (
                              <Badge bgCol="bg-blue-100" textCol="text-blue-800" textSize="text-sm">{task.users.username}</Badge>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-6 text-center text-gray-400 italic">
                          No tasks in this section
                        </td>
                      </tr>
                    );
                  })()}

                  <tr>
                    <th colSpan={3} className='bg-gray-50 text-gray-700 font-medium text-sm px-6 py-3 text-left border-y border-gray-200'>
                      In Progress
                    </th>
                  </tr>
                  <tr className='bg-gray-50 text-gray-600 text-xs uppercase tracking-wide'>
                    <th className='px-6 py-2 w-[3%] border-r border-gray-200'></th>
                    <th className='px-6 py-2 text-left w-[87%] border-r border-gray-200'>Task Description</th>
                    <th className='px-6 py-2 text-center w-[10%]'>Assignee</th>
                  </tr>
                  {(() => {
                    const inProgressTasks = tasks.filter(
                      (task) => task.fr_id === fr.id && task.status === "ongoing"
                    );

                    return inProgressTasks.length > 0 ? (
                      inProgressTasks.map((task, index) => (
                        <tr key={task.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-orange-50/30 transition-colors duration-150`}>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <input 
                              type="checkbox" 
                              onClick={(e) => handleTaskComplete(task.id, e, index)}
                              name={task.id} 
                              id={task.id}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2" 
                            />
                          </td>
                          <td className="px-6 py-4 text-gray-800 border-r border-gray-200">
                            {task.description}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 text-sm">
                            {task.users?.username ? (
                              <Badge bgCol="bg-orange-100" textCol="text-orange-800" textSize="text-sm">{task.users.username}</Badge>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-6 text-center text-gray-400 italic">
                          No tasks in this section
                        </td>
                      </tr>
                    );
                  })()}

                  <tr>
                    <th colSpan={3} className='bg-gray-50 text-gray-700 font-medium text-sm px-6 py-3 text-left border-y border-gray-200'>
                      Completed
                    </th>
                  </tr>
                  <tr className='bg-gray-50 text-gray-600 text-xs uppercase tracking-wide border-b border-b-gray-200'>
                    <th className='px-6 py-2 w-[3%] border-r border-gray-200'></th>
                    <th className='px-6 py-2 text-left w-[87%] border-r border-gray-200'>Task Description</th>
                    <th className='px-6 py-2 text-center w-[10%]'>Assignee</th>
                  </tr>
                  {(() => {
                    const completedTasks = tasks.filter(
                      (task) => task.fr_id === fr.id && task.status === "complete"
                    );

                    return completedTasks.length > 0 ? (
                      completedTasks.map((task, index) => (
                        <tr key={task.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-green-50/30 transition-colors duration-150`}>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <input 
                              type="checkbox"
                              onClick={(e) => handleTaskIncomplete(task.id, e, index)}
                              checked={true}
                              name={task.id} 
                              id={task.id}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2" 
                            />
                          </td>
                          <td className="px-6 py-4 text-gray-800 border-r border-gray-200">
                            {task.description}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600 text-sm">
                            {task.users?.username ? (
                              <Badge bgCol="bg-green-100" textCol="text-green-800" textSize="text-sm">{task.users.username}</Badge>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-6 text-center text-gray-400 italic">
                          No tasks in this section
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectPage