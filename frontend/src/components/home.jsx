import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase-client';
import Badge from '../reusable/badge';

function Home() {
  const [userId, setUserId] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.log("error fetching user data", error);
          return;
        }
        
        const user_id = session?.user?.id;
        if (!user_id) return;

        setUserId(user_id);

        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*, members (user_id)")
          .eq("members.user_id", user_id);
        
        if (projectsError) {
          console.log("error fetching projects", projectsError);
        } else {
          setProjects(projectsData || []);
        }

        const { data: tasksData, error: tasksError } = await supabase
          .from("subfeatures")
          .select("*")
          .eq("assigned_to", user_id)
          .eq("priority", "high")
          .eq("status", "ongoing");
        
        if (tasksError) {
          console.log("error fetching tasks", tasksError);
        } else {
          setTasks(tasksData || []);
        }
      } catch (error) {
        console.log("error in getData", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (loading) {
    return (
      <div className='bg-gray-50 min-h-screen p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-48 mb-6'></div>
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='space-y-4'>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const projectsWithTasks = projects.filter(project => 
    tasks.some(task => task.project_id === project.id)
  );

  return (
    <div className='bg-gray-50 min-h-screen p-8'>
      <div className='max-w-7xl mx-auto p-6'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Dashboard</h1>
          <p className='text-gray-600'>High priority ongoing tasks across your projects</p>
        </div>

        {/* Content */}
        {projectsWithTasks.length === 0 ? (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
            <div className='max-w-md mx-auto'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No high priority tasks</h3>
              <p className='text-gray-500'>You don't have any high priority ongoing tasks at the moment.</p>
            </div>
          </div>
        ) : (
          <div className='space-y-8'>
            {projectsWithTasks.map((project) => {
              const projectTasks = tasks.filter((task) => task.project_id === project.id);
              
              return (
                <div key={project.id} className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200'>
                  {/* Project Header */}
                  <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
                    <div className='flex items-center justify-between'>
                      <h2 className='text-lg font-semibold text-gray-900'>{project.name}</h2>
                      <span className='text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                        {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Tasks Table */}
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead>
                        <tr className='bg-gray-50 border-b border-gray-200'>
                          <th className='w-16 py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            #
                          </th>
                          <th className='py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Task Description
                          </th>
                          <th className='w-24 py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Priority
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {projectTasks.map((task, idx) => (
                          <tr key={task.id} className='hover:bg-gray-50 transition-colors duration-150'>
                            <td className='py-4 px-6 text-sm font-medium text-gray-500'>
                              {idx + 1}
                            </td>
                            <td className='py-4 px-6'>
                              <p className='text-sm text-gray-900 leading-5'>
                                {task.description}
                              </p>
                            </td>
                            <td className='py-4 px-6'>
                              <Badge 
                                bgCol="bg-red-100" 
                                textCol="text-red-800" 
                                textSize="text-xs"
                              >
                                {task.priority}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;