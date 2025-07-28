from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
from graph import graph
from doc import generate_srs_document

app = Flask(__name__)
CORS(app)

@app.route('/generate_srs', methods=["POST"])
def generate_srs():
    prompt = request.form.get('prompt')
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
    print(result)

    project_name = "AI Generated Project" 
    company_name = "Your Company Name"

    file_path = generate_srs_document(
        langgraph_state=result,
        project_name=project_name,
        company_name=company_name
    )

    return jsonify({
        'message': 'Files and prompt received successfully',
        'file_path': file_path
    }), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)