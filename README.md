# ARC - AI-Powered Project Management & Requirements Generation

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.52.0-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **ARC** is an intelligent project management platform that automatically generates software requirements, breaks down tasks, and assigns work to team members using AI with in app project management to track progress. Perfect for software development teams looking to streamline their project planning process.

## Features

### AI-Powered Requirements Generation
- **Automatic SRS Creation**: Generate comprehensive Software Requirements Specification documents from prompts or uploaded files
- **Smart Task Breakdown**: AI automatically breaks down functional requirements into manageable subtasks
- **Intelligent Assignment**: Tasks are intelligently assigned to team members based on their skills and expertise
- **Multi-format Input**: Support for text prompts and PDF document uploads
- **Document Editing**: In app editing of document before finalization, with an edit option throughout the project lifecycle

### Team Collaboration
- **Project Management**: Create and manage multiple projects with team members
- **GitHub Integration**: Seamless GitHub repository linking with webhook automation
- **Real-time Updates**: Live project status and task progress tracking

### Task Management
- **Kanban-style Workflow**: Tasks organized by status (Todo, In Progress, Completed)
- **Priority Management**: High, Medium, Low priority levels for effective task prioritization
- **Progress Tracking**: Visual progress indicators and completion status
- **Assignment Management**: Easy task reassignment and workload distribution

### Professional Documentation
- **SRS Generation**: Automatically create professional Word documents
- **Structured Output**: Well-organized requirements with clear hierarchies
- **Export Capabilities**: Download generated documents for stakeholder review

## Architecture

### Frontend (React + Vite)
- **React 19**
- **Tailwind CSS**
- **React Router**
- **Supabase Client**

### Backend (Flask + Python)
- **Flask API**
- **LangGraph**
- **PDF Processing**
- **Document Generation**

### AI & ML
- **Groq LLM Integration (gemma-9b-it)**
- **Structured Output**: Pydantic models for consistent AI responses
- **Workflow Automation**: LangGraph for complex AI processing pipelines
- **Skill-based Assignment**: Intelligent task distribution based on team expertise

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- GitHub OAuth app
- Groq API key

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_NGROK_URL=your_ngrok_url
```

**Backend (.env)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GROQ_API_KEY=your_groq_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NGROK_URL=your_ngrok_url
```

## Usage Guide

### 1. Project Creation
1. **Login/Register**: Create an account or sign in
2. **Create Project**: Fill in project details, description, and GitHub URL
3. **Add Team Members**: Search and add team members by username
4. **GitHub OAuth**: Authorize repository access for webhook setup

### 2. Requirements Generation
1. **Upload Documents**: Add PDF files or provide text prompts
2. **AI Processing**: Let AI analyze and generate requirements
3. **Review & Edit**: Manually refine AI-generated content
4. **Finalize**: Confirm requirements and generate SRS document

### 3. Task Management
1. **View Requirements**: See all functional requirements and subtasks
2. **Track Progress**: Monitor task completion across the project
3. **Update Status**: Mark tasks as complete or in progress
4. **Team Collaboration**: Coordinate with team members on assignments



*Transform your project planning with AI-powered intelligence*
