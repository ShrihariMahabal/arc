from dotenv import load_dotenv
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field
from typing_extensions import Literal
import operator
from langgraph.constants import Send
from langchain_google_genai import ChatGoogleGenerativeAI
import json
import re

load_dotenv()
groq_key = os.getenv("GROQ_API_KEY")
langsmith_key = os.getenv("LANGSMITH_API_KEY")
google_key = os.getenv("GEMINI_API_KEY")

os.environ["LANGCHAIN_API_KEY"] = langsmith_key
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "arc"

llm = ChatGroq(groq_api_key=groq_key, model_name="gemma2-9b-it")
llm1 = ChatGroq(groq_api_key=groq_key, model_name="deepseek-r1-distill-llama-70b")
# llm1 = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash",
#     google_api_key=google_key,
#     temperature=0.3
# )

class Intro(BaseModel):
    purpose: str = Field(
        description="The purpose of the application, e.g., 'to help users manage their tasks efficiently.'"
    )
    scope: list[str] = Field(
        description="The scope of the application, e.g., 'task management, project planning.'"
    )
    audience: list[str] = Field(
        description="The target audience for the application, e.g., 'students, professionals.'"
    )
    overview: list[str] = Field(
        description="A brief overview of the application, e.g., 'a web-based task management tool that allows users to create, edit, and delete tasks.'"
    )

class FRTitle(BaseModel):
    title: str = Field(
        description="A functional requirement title, e.g., 'User Authentication.'"
    )
    description: str = Field(
        description="A detailed description of the functional requirement, e.g., 'The application should allow users to log in using their email and password.'"
    )

class FRTitles(BaseModel):
    titles: list[FRTitle] = Field(
        description="A list of functional requirement titles for the application."
    )

class NFR(BaseModel):
    id: str = Field(
        description="A unique identifier for the non-functional requirement."
    )
    description: str = Field(
        description="A detailed description of the non-functional requirement, e.g., 'The application should be able to handle 1000 concurrent users without performance degradation.'"
    )

class NFRs(BaseModel):
    nfrs: list[NFR] = Field(
        description="A list of non-functional requirements for the application."
    )

class State(TypedDict):
    user_input: str
    members: list[dict]
    frs_titles: list[FRTitle]
    completed_frs: Annotated[list, operator.add]
    purpose: str
    scope: list[str]
    audience: list[str]
    overview: list[str]
    nfrs: list[NFR]

class WorkerState(TypedDict):
    idx: int
    overview: list[str]
    title: FRTitle
    completed_frs: Annotated[list, operator.add]
    members: list[dict]
    last_assignments: Annotated[list[str], operator.add]

llm_for_fr_titles = llm.with_structured_output(FRTitles)
llm_for_intro = llm.with_structured_output(Intro)
llm_for_nfrs = llm.with_structured_output(NFRs)

def get_intro(state: State):
    template = ChatPromptTemplate.from_messages([
        ("system", "You are an expert in software requirements gathering."),
        ("user", "Please provide the purpose, scope, audience, and overview of the application: {user_input}"),
    ])
    prompt = template.invoke({"user_input": state["user_input"]})
    res = llm_for_intro.invoke(prompt)
    return {"purpose": res.purpose,
            "scope": res.scope,
            "audience": res.audience,
            "overview": res.overview}

def orchestrator(state: State):
    template = ChatPromptTemplate.from_messages([
        ("system", "You are an expert in software requirements gathering. Your task is to gather the functional requirements of an application based on the provided introduction."),
        ("user", "Based on the provided application overview: {overview} and user input which contains both uploaded file contend and user prompt: {user_input}, please generate the titles of functional requirements. Each title should be a concise description of a functional requirement, e.g., 'User Authentication, Task Creation, Task Deletion.' Please include every possible functional requirement from start of the app to the end(for example secure user authentication till the last feature of the app)"),
    ])
    prompt = template.invoke({
        "overview": state["overview"],
        "user_input": state["user_input"]
    })
    res = llm_for_fr_titles.invoke(prompt)
    return {"frs_titles": res.titles}

def worker(state: WorkerState):
    template = ChatPromptTemplate.from_messages([
        ("system", 
         "You are an expert in software requirements gathering. Your task is to generate a complete single functional requirement in JSON format based on the provided title, description, and application overview. "
         "The JSON should contain keys: 'Title', 'Description', 'Constraints', 'Subtasks' and any other relevant keys based on the context. Make sure there are other relevant keys as well. Please note that subtasks should be a list of strings, each string represents a sub feature of the functional requirement title: {title} and it should be a short description of the sub-feature. Make sure that the Subtasks key is always 'Subtasks', nothing else"
         "The JSON should also have the key: 'assigned' which should contain the user_id of the member whose skill set is the most relevant. The list of members along with their skills and their user_id will be given to you. Please ensure you are not repeating the same user_id multiple times and assigning tasks to other users as well. Make sure the assigned key should not have the same value as the last_assigment: {last_assignment}"
         "Ensure the output is a valid JSON object. No preamble/postamble or additional text should be included in the output."),
        ("user", 
         "Based on the following:\n\n"
         "Application Overview: {overview}\n\n"
         "Functional Requirement Title: {title}\n"
         "Functional Requirement Description: {description}\n\n"
         "Members: {members}"
         "Please generate a detailed, complete functional requirement in valid JSON format.")
    ])
    
    prompt = template.invoke({
        "overview": state["overview"],
        "title": state["title"].title,
        "description": state["title"].description,
        "members": state["members"],
        "last_assignment": state["last_assignment"]
    })

    res = llm.invoke(prompt)

    raw_content = res.content.strip()
    
    # Remove markdown code block if present
    if raw_content.startswith("```json"):
        raw_content = re.sub(r"^```json\s*|\s*```$", "", raw_content.strip(), flags=re.DOTALL)

    try:
        parsed = json.loads(raw_content)
        parsed["ID"] = state["idx"]
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        print("Raw content that failed:\n", raw_content)
        raise e  # Or return a default/fallback object
    last = ''
    if "assigned" in parsed:
        last = parsed["assigned"]
    elif "Assigned" in parsed:
        last = parsed["Assigned"]

    return {"completed_frs": [parsed], "last_assignment": [last]}

def assign(state: State):
    return [Send("worker", {"title": title, "overview": state["overview"], "idx": i, "members": state["members"], "last_assignment": ""}) for i, title in enumerate(state["frs_titles"])]

def get_nfrs(state: State):
    template = ChatPromptTemplate.from_messages([
        ("system", "You are an expert in software requirements gathering. Your task is to gather the non-functional requirements of an application based on the provided introduction."),
        ("user", "Based on the provided application overview: {overview} and user input which contains both uploaded file contend and user prompt: {user_input}, please generate a list of non-functional requirements. Each requirement should be a concise description, e.g., 'The application should be able to handle 1000 concurrent users without performance degradation.'"),
    ])
    prompt = template.invoke({
        "overview": state["overview"],
        "user_input": state["user_input"]
    })
    res = llm_for_nfrs.invoke(prompt)
    return {"nfrs": res.nfrs}

graph_builder = StateGraph(State)

graph_builder.add_node("get_intro", get_intro)
graph_builder.add_node("get_nfrs", get_nfrs)
graph_builder.add_node("orchestrator", orchestrator)
graph_builder.add_node("worker", worker)

graph_builder.add_edge(START, "get_intro")
graph_builder.add_edge("get_intro", "get_nfrs")
graph_builder.add_edge("get_nfrs", "orchestrator")
graph_builder.add_conditional_edges("orchestrator", assign, ["worker"])
graph_builder.add_edge("worker", END)

graph = graph_builder.compile()
# result = graph.invoke({
#     "user_input": "Create a task management application that allows users to create, edit, and delete tasks. I dont have much information about the application, so add your own assumptions.",
#     "members": [{"user_id": "548d65f4-de57-40ac-ba3d-57a19776fba9", "username": "shrihari", "skills": "react, flask"}, {"user_id": "6cc80aaa-ea19-43a3-9f75-b8888e27dd7e", "username": "shrihari1", "skills": "vue, node, express"}]
# })

# print(result)