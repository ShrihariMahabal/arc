from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from graph import graph
from doc import generate_srs_document
from supabase_client import supabase
from pydantic import BaseModel
from typing import Any

app = Flask(__name__)
CORS(app)

def serialize_pydantic(obj: Any) -> Any:
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    elif isinstance(obj, list):
        return [serialize_pydantic(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: serialize_pydantic(value) for key, value in obj.items()}
    else:
        return obj

@app.route('/generate_content', methods=["POST"])
def generate_content():
    prompt = request.form.get('prompt')
    project_id = request.form.get('projectId')
    files = request.files
    files_content = ''

    for key in files:
        file = files[key]
        filename = file.filename
        reader = PdfReader(file)
        for page in reader.pages:
            text = page.extract_text()
            files_content += f'{filename}: {text} \n'
    message = f"User Prompt: {prompt}" + f"Uploaded content: {files_content}"

    project_members = []
    try:
        project_members_data = supabase.table("members").select("users (user_id, username, skills)").execute()
        project_members = project_members_data.data
    except Exception as e:
        print("project fetching error", e)

    result = graph.invoke({"user_input": message, "members": project_members})
    
    features = []
    subfeatures = []

    completed_frs = result.get("completed_frs", [])
    itr = 0

    for fr in completed_frs:
        id = fr.get('ID', 0)
        title = fr.get('Title', '')
        description = fr.get('Description', '')
        subtasks = fr.get('Subtasks', [])
        assigned_to = ''
        if "assigned" in fr:
            assigned_to = fr.get('assigned', '')
        elif "Assigned" in fr:
            assigned_to = fr.get('Assigned', '')

        features.append({"id": id, "title": title, "description": description, "project_id": project_id})

        for i, subfeature in enumerate(subtasks):
            subfeatures.append({"id": itr, "description": subfeature, "fr_id": id, "project_id": project_id, "assigned_to": assigned_to})
            itr += 1

    serialized_result = serialize_pydantic(result)

    return jsonify({
        'message': 'Success',
        'features': features,
        'subfeatures': subfeatures,
        'langgraph_state': serialized_result,
        'project_members': project_members
    }), 200

@app.route('/generate_srs', methods=['POST'])
def generate_srs():
    data = request.get_json()
    frs = data.get("frs")
    subfeatures = data.get("subtasks")
    project_id = data.get("project_id")
    langgraph_state = data.get("langgraph_state")
    project_name_data = supabase.table("projects").select("name").eq("id", project_id).single().execute()
    project_name = project_name_data.data["name"]

    print(project_name)
    print("lang_state ", langgraph_state)
    print("frs", frs)
    print("sub", subfeatures)

    try:
        res1 = supabase.table("frs").insert(frs).execute()
        res2 = supabase.table("subfeatures").insert(subfeatures).execute()
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to insert into database", "details": str(e)}), 500

    file_path = generate_srs_document(
        project_name=project_name,
        langgraph_state=langgraph_state,
        frs=frs,
        subfeatures=subfeatures,
        output_path=f"./docs/{project_name}.docx"
    )

    return jsonify({"message": "Success", "srs_path": file_path}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)