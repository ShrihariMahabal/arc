import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../supabase-client';

function ProjectPage() {
    const {id: projectId} = useParams();
    const [frs, setFrs] = useState([])
    const navigate = useNavigate();

    // useEffect(() => {
    //     const fetchProjectDetails = async () => {
    //         const {data: projectData, error: projectError} = await supabase.from("frs").select("*").eq('project_id', projectId);
    //         if (projectError) {
    //             console.log("Error fetching project data", projectError);
    //             return;
    //         }
    //         setFrs(projectData);
    //         if (projectData.length === 0) {
    //             navigate(`/projects/create_doc/${projectId}`)
    //         }
    //     }
    //     fetchProjectDetails();
    // }, [])

  return (
    <div>ProjectPage</div>
  )
}

export default ProjectPage