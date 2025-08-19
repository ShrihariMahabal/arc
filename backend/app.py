from flask import Flask, request, jsonify, redirect
import requests
from flask_cors import CORS
from PyPDF2 import PdfReader
from graph import graph
from doc import generate_srs_document
from supabase_client import supabase
from pydantic import BaseModel
from typing import Any
from dotenv import load_dotenv
import os

load_dotenv()

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
    print(project_id)
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
        project_members_data = supabase.table("members").select("users (user_id, username, skills)").eq("project_id", project_id).execute()
        project_members = project_members_data.data
        print(project_members)
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
            subfeatures.append({"id": itr, "description": subfeature, "fr_id": id, "project_id": project_id, "assigned_to": assigned_to, "priority": "high"})
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

    for subfeature in subfeatures:
        assigment = subfeature.get("assigned_to", "")
        if len(assigment) > 0:
            subfeature["status"] = "ongoing"
        else:
            subfeature.pop("assigned_to")
            subfeature["status"] = "todo"


    # print(project_name)
    # print("lang_state ", langgraph_state)
    # print("frs", frs)
    # print("sub", subfeatures[0]["assigned_to"])
    # print("sub", type(subfeatures[0]["assigned_to"]))

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


@app.route('/github/webhook', methods=['POST'])
def github_webhook():
    payload = request.json
    event = request.headers.get("X-GitHub-Event")
    
    if event == "pull_request":
        action = payload.get("action")
        pr = payload.get("pull_request", {})
        
        if action == "closed" and pr.get("merged") is True:
            body = pr.get("body", "")
            repo_url = payload.get("repository").get("full_name")
            repo = "https://github.com/" + repo_url
            sender = pr.get("user").get("login")
            subtask_id = ""

            if '#' in body:
                itr = body.index("#")+1
                while itr < len(body) and body[itr].isdigit():
                    subtask_id += body[itr]
                    itr += 1
            
            try:
                project_data = supabase.table("projects").select("id").eq("github_url", repo).execute()
                project_id = project_data.data[0]["id"]
                subtask_update_data = supabase.table("subfeatures").update({"status": "complete"}).eq("id", int(subtask_id)).eq("project_id", project_id).execute()
            except Exception as e:
                print("error updating database", e)
            
    return jsonify({"message": "webhook handled successfully"}), 200


@app.route('/github/callback')
def github_callback():
    code = request.args.get('code')
    supabase_token = request.args.get("state")

    CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    SECRET_KEY = os.getenv("GITHUB_CLIENT_SECRET")

    user_resp = supabase.auth.get_user(supabase_token)
    if not user_resp.user:
        return "Invalid Supabase session token", 401

    user_id = user_resp.user.id 

    # Exchange GitHub code for access token
    token_res = requests.post(
        'https://github.com/login/oauth/access_token',
        headers={'Accept': 'application/json'},
        data={
            'client_id': CLIENT_ID,
            'client_secret': SECRET_KEY,
            'code': code
        }
    )
    token_json = token_res.json()
    access_token = token_json.get('access_token')
    if not access_token:
        return "GitHub OAuth failed", 400

    user_info = requests.get(
        'https://api.github.com/user',
        headers={'Authorization': f'token {access_token}'}
    ).json()

    github_username = user_info.get('login')
    if not github_username:
        return "Failed to fetch GitHub user info", 400

    supabase.table('github_tokens').insert({
        'user_id': user_id,
        'github_username': github_username,
        'access_token': access_token,
        'is_admin': True
    }).execute()

    return redirect("http://localhost:5173/projects/loading")

def get_supabase_user_id_from_header(request):
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.replace("Bearer ", "")
    return None


@app.route('/projects/create', methods=['POST'])
def create_project():
    data = request.json
    user_id = get_supabase_user_id_from_header(request)

    # Save project and members in Supabase
    project = {
        'name': data['title'],
        'description': data['description'],
        'github_url': data['url'],
        'admin': user_id
    }
    inserted_project = supabase.table("projects").insert(project).execute().data[0]

    for member in data['members']:
        supabase.table("members").insert({
            'project_id': inserted_project['id'],
            'user_id': member['user_id'] 
        }).execute()

    try:
        # Parse GitHub owner/repo from URL
        owner_repo = data['url'].replace("https://github.com/", "")
        owner, repo = owner_repo.split('/')

        access_token = supabase.table("github_tokens") \
            .select("access_token") \
            .eq("user_id", user_id) \
            .execute() \
            .data[0]['access_token']

        print("Creating webhook on:", f"{owner}/{repo}")
        print("Using token:", access_token)

        # Webhook URL
        ngrok_url = os.getenv("NGROK_URL")
        webhook_url = f"https://{ngrok_url}.ngrok-free.app/github/webhook"
        print(webhook_url)

        # Always create webhook (no check for existing ones)
        response = requests.post(
            f'https://api.github.com/repos/{owner}/{repo}/hooks',
            headers={
                'Authorization': f'token {access_token}',
                'Accept': 'application/vnd.github.v3+json'
            },
            json={
                'name': 'web',
                'active': True,
                'events': ['pull_request', 'pull_request_review'],
                'config': {
                    'url': webhook_url,
                    'content_type': 'json'
                }
            }
        )
        print("Webhook creation response:", response.status_code, response.json())

    except Exception as e:
        print("Exception during webhook setup:", e)

    return jsonify({
        'status': 'Project created and webhook handled',
        'project_id': inserted_project['id']
    })





if __name__ == "__main__":
    app.run(debug=True, port=5001)