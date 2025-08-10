import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { supabase } from '../supabase-client';

function WaitingPage() {
  const navigate = useNavigate();
  const submittedRef = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    const submitProject = async () => {
      // Avoid duplicate submission (in dev or remounts)
      if (submittedRef.current || localStorage.getItem("projectSubmitted") === "true") return;
      submittedRef.current = true;
      localStorage.setItem("projectSubmitted", "true");

      const projectData = JSON.parse(localStorage.getItem("newProjectData"));
      if (!projectData) {
        alert("No project data found.");
        localStorage.removeItem("projectSubmitted");
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user_id = session?.user?.id;

        if (!user_id) {
          console.error("User ID not found.");
          localStorage.removeItem("projectSubmitted");
          return;
        }

        const response = await axios.post("http://localhost:5001/projects/create", projectData, {
          headers: {
            Authorization: `Bearer ${user_id}`,
          },
        });

        const projectId = response.data.project_id;

        localStorage.removeItem("newProjectData");
        localStorage.removeItem("projectSubmitted");

        navigate(`/projects/create_doc/${projectId}`);
      } catch (error) {
        console.error("Error creating project:", error);
        localStorage.removeItem("projectSubmitted");
      }
    };

    submitProject();
  }, []);

  return (
    <div className='h-screen w-full bg-gray-50 p-4 flex justify-center items-center'>
      <p className="text-lg font-medium text-gray-700">Please wait while we set up your project...</p>
    </div>
  );
}

export default WaitingPage;
