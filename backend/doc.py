import docx
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from datetime import datetime
import re

# --- Helper functions (no changes here) ---
def set_font_and_style(run, size=11, bold=False, color=(0, 0, 0)):
    font = run.font
    font.name = 'Calibri'
    font.size = Pt(size)
    font.bold = bold
    font.color.rgb = RGBColor(*color)

def add_main_heading(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font_and_style(run, size=16, bold=True)
    p.paragraph_format.space_before = Pt(24)
    p.paragraph_format.space_after = Pt(12)

def add_sub_heading(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font_and_style(run, size=14, bold=True)
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    
def add_fr_heading(doc, text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font_and_style(run, size=12, bold=True)
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)

def add_body_text(doc, text):
    p = doc.add_paragraph(text)
    set_font_and_style(p.runs[0])
    p.paragraph_format.line_spacing = 1.15

def add_list_item(doc, text, level=0):
    p = doc.add_paragraph(text, style='List Bullet')
    p.paragraph_format.left_indent = Pt(36 * (level + 1))
    set_font_and_style(p.runs[0])
    
def format_key_name(key):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', key)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1)
    return s2.title()

# --- Main generator function (changes are inside) ---
def generate_srs_document(langgraph_state: dict, project_name: str, company_name: str) -> str:
    doc = docx.Document()
    
    # --- Title Page (no changes) ---
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('Software Requirements Specification (SRS)\n')
    set_font_and_style(run, size=24, bold=True)
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run(f'Project: {project_name}')
    set_font_and_style(run, size=18, bold=True)
    doc.add_paragraph()
    details = doc.add_paragraph()
    details.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_font_and_style(details.add_run(f"Prepared By: {company_name}\n"), size=12)
    set_font_and_style(details.add_run("Version: 1.0\n"), size=12)
    set_font_and_style(details.add_run(f"Date: {datetime.now().strftime('%B %d, %Y')}"), size=12)
    doc.add_page_break()

    # --- Introduction (no changes) ---
    add_main_heading(doc, '1. Introduction')
    add_sub_heading(doc, '1.1 Purpose')
    purpose = langgraph_state.get('purpose', 'To be defined.')
    add_body_text(doc, f"This document outlines the functional and non-functional requirements for the {project_name} system. The primary purpose of this project is {purpose}.")
    add_sub_heading(doc, '1.2 Scope')
    scope_items = langgraph_state.get('scope', [])
    add_body_text(doc, f"The {project_name} system will provide functionalities for:")
    for item in scope_items:
        add_list_item(doc, item.title())
    add_sub_heading(doc, '1.3 Intended Audience')
    audience_items = langgraph_state.get('audience', [])
    add_body_text(doc, "This document is intended for the following stakeholders:")
    for item in audience_items:
        add_list_item(doc, item)
    add_list_item(doc, "Project Managers")
    add_list_item(doc, "Developers")
    add_list_item(doc, "QA/Testers")

    # --- System Overview (no changes) ---
    add_main_heading(doc, '2. System Overview')
    overview = langgraph_state.get('overview', ["No overview provided."])[0]
    add_body_text(doc, overview)
    add_body_text(doc, "The system will consist of the following primary functional areas:")
    for fr in langgraph_state.get('completed_frs', []):
        add_list_item(doc, fr.get('Title', 'Untitled Requirement'))
    
    # --- Functional Requirements (no changes) ---
    add_main_heading(doc, '3. Functional Requirements')
    completed_frs = langgraph_state.get('completed_frs', [])
    for i, fr in enumerate(completed_frs, 1):
        fr_id = fr.get('ID', f'FR-0{i}')
        fr_title = fr.get('Title', 'Untitled Requirement')
        add_fr_heading(doc, f"3.{i} {fr_title} [{fr_id}]")
        for key, value in fr.items():
            if key in ['ID', 'Title']:
                continue
            p = doc.add_paragraph()
            run_key = p.add_run(f"{format_key_name(key)}: ")
            set_font_and_style(run_key, bold=True)
            if isinstance(value, list) and value:
                first_item = value[0]
                run_value = p.add_run(str(first_item))
                set_font_and_style(run_value)
                for item in value[1:]:
                    add_list_item(doc, str(item), level=0)
            else:
                run_value = p.add_run(str(value))
                set_font_and_style(run_value)
    
    # --- 4. Non-Functional Requirements (FIX APPLIED HERE) ---
    add_main_heading(doc, '4. Non-Functional Requirements')
    nfrs = langgraph_state.get('nfrs', [])
    if nfrs:
        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'
        table.autofit = True
        
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = 'ID'
        hdr_cells[1].text = 'Description'
        for cell in hdr_cells:
            set_font_and_style(cell.paragraphs[0].runs[0], bold=True)
        
        # Use attribute access (.id, .description) instead of .get()
        for nfr in nfrs:
            row_cells = table.add_row().cells
            row_cells[0].text = nfr.id if hasattr(nfr, 'id') else 'N/A'
            row_cells[1].text = nfr.description if hasattr(nfr, 'description') else 'No description.'
            for cell in row_cells:
                 set_font_and_style(cell.paragraphs[0].runs[0])
    else:
        add_body_text(doc, "No non-functional requirements have been defined.")

    # --- Save Document (no changes) ---
    file_path = f"./docs/SRS_Document_{project_name.replace(' ', '_')}.docx"
    doc.save(file_path)
    print(f"SRS Document successfully generated at: {file_path}")
    return file_path