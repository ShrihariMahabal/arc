from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from graph import graph
from doc import generate_srs_document
from supabase_client import supabase

app = Flask(__name__)
CORS(app)

@app.route('/generate_srs', methods=["POST"])
def generate_srs():
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

    result = graph.invoke({"user_input": message})
    
    features = []
    subfeatures = []

    completed_frs = result.get("completed_frs", [])
    for fr in completed_frs:
        id = fr.get('ID', 0)
        title = fr.get('Title', '')
        description = fr.get('Description', '')
        criteria = fr.get('Acceptance Criteria', [])

        features.append({"id": id, "title": title, "description": description, "project_id": project_id})

        for subfeature in criteria:
            subfeatures.append({"description": subfeature, "fr_id": id, "project_id": project_id})
    
    try:
        res1 = supabase.table("frs").insert(features).execute()
        res2 = supabase.table("subfeatures").insert(subfeatures).execute()
    except Exception as e:
        return jsonify({"error": "Failed to insert into database", "details": str(e)}), 500

    try:
        project_name_data = supabase.table("projects").select("name").eq("id", project_id).single().execute()
    except Exception as e:
        return jsonify({"error": "Failed to get name"}), 400
    project_name = project_name_data.data["name"]


    file_path = generate_srs_document(
        langgraph_state=result,
        project_name=project_name,
    )

    return jsonify({
        'message': 'Files and prompt received successfully',
        'file_path': file_path
    }), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)