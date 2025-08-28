import pickle
from flask import Flask, render_template, request, jsonify
from models.database import DatabaseManager
import os
import sys
import random
import re

# Helper function to resolve file paths
def get_resource_path(relative_path):
    """Return the absolute path to a resource file."""
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

app = Flask(
    __name__, 
    template_folder=get_resource_path('templates'),
    static_folder=get_resource_path('static')
)

db_manager = DatabaseManager()
model_path = get_resource_path(os.path.join('data', 'model.pkl'))

# Load intent classifier model
try:
    with open(model_path, 'rb') as f:
        intent_classifier = pickle.load(f)
    print("Model loaded successfully:", model_path)
except Exception as e:
    print("Model load error:", e)
    sys.exit(1)

# Formal compliment and greeting options
COMPLIMENTS = [
    "You're welcome.",
    "I'm glad I could assist you.",
    "Happy to help.",
    "It was my pleasure.",
    "I'm here if you require further assistance.",
    "Glad I could be of service."
]

GREETINGS = [
    "Hello.",
    "Good day.",
    "Greetings.",
    "Welcome.",
    "How may I assist you today?",
    "Good morning.",
    "Good afternoon.",
    "Good evening."
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/query', methods=['POST'])
def api_query():
    user_msg = request.json.get('message')
    intent, confidence = intent_classifier.predict_intent(user_msg)
    require_form = False
    required_fields = []
    response = "The command was not recognized."

    # Formal and structured intent handling
    if intent == 'add_student':
        response = "Please provide the student's details."
        require_form = True
        required_fields = ['roll number', 'name', 'marks', 'house', 'email', 'class', 'section']

    elif intent == 'modify_marks':
        response = "Please provide the student's name and the new marks."
        require_form = True
        required_fields = ['name', 'marks']

    elif intent == 'display_all':
        data = db_manager.get_all_records()
        if data:
            record_fields = list(data[0].keys())
            return jsonify({
                'response': "Here are all student records:",
                'records': data,
                'record_fields': record_fields
            })
        else:
            response = "No student records are available."

    elif intent == 'show_desc_marks':
        data = db_manager.get_desc_marks()
        if data:
            return jsonify({
                'response': "Students listed by marks (descending):",
                'records': data,
                'record_fields': ['name', 'marks_obtained']
            })
        else:
            response = "No records are available for display."

    elif intent == 'introduce':
        response = (
            "Hello, I am AskGrade, your dedicated assistant for managing student records efficiently. "
            "I can help you add new students, update or delete records, retrieve marks, and provide class statistics such as averages and top rankings. "
            "Please inform me of your requirements, and I will do my best to assist you."
        )

    elif intent == 'compliment':
        response = random.choice(COMPLIMENTS)

    elif intent == 'greet':
        response = random.choice(GREETINGS)

    elif intent == 'show_top3':
        data = db_manager.get_top_n(3)
        if data:
            return jsonify({
                'response': "Top three students:",
                'records': data,
                'record_fields': ['name', 'marks_obtained']
            })
        else:
            response = "No student records are available."

    elif intent == 'class_average':
        avg = db_manager.get_class_average()
        response = f"The class average is {avg:.2f}." if avg is not None else "Class average is not available."

    elif intent == 'fail_records':
        fails = db_manager.get_failing_students()
        if fails:
            return jsonify({
                'response': "Students who have failed:",
                'records': fails,
                'record_fields': ['name', 'marks_obtained']
            })
        else:
            response = "No failing records found."

    elif intent == "delete_student":
        response = "Please provide the student's name for deletion."
        require_form = True
        required_fields = ["name"]

    elif intent == 'get_marks':
        response = "Please enter the student's name to retrieve marks."
        require_form = True
        required_fields = ['name']

    elif intent == "Unknown":
        response = "The command was not recognized."

    return jsonify({
        'response': response,
        'require_form': require_form,
        'required_fields': required_fields,
        'intent': intent
    })

@app.route('/api/student_names', methods=['GET'])
def get_student_names():
    data = db_manager.get_all_student_names()
    names = [d['name'] for d in data]
    return jsonify({"names": names})

@app.route('/api/submit_form', methods=['POST'])
def submit_form():
    if not request.is_json or request.json is None:
        return jsonify({'response': 'Please provide data in JSON format.'}), 400

    intent = request.json.get('intent')
    data = request.json.get('form')

    if intent not in ['add_student', 'modify_marks', 'delete_student', 'get_marks']:
        return jsonify({'response': 'The specified intent is not permitted.'}), 400
    if not data or not isinstance(data, dict):
        return jsonify({'response': 'The form data is incomplete.'}), 400

    try:
        if intent == 'add_student':
            student_id = data.get('roll number')
            name = data.get('name')
            marks = data.get('marks')
            email = data.get('email')
            student_class = data.get('class')
            section = data.get('section')
            house = data.get('house')

            try:
                student_id = int(str(student_id).strip())
            except Exception:
                return jsonify({'response': "The roll number must be an integer."}), 400

            if name and not isinstance(name, str):
                return jsonify({'response': "The student's name must be a string."}), 400
            if email and email.strip() and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$', email.strip()):
                return jsonify({'response': "The provided email address is not valid."}), 400

            try:
                marks = int(marks)
            except (ValueError, TypeError):
                marks = None

            db_manager.add_student(student_id, name, marks, house, email, student_class, section)
            return jsonify({'response': "The student record has been added successfully."})

        elif intent == 'modify_marks':
            name = data.get('name')
            marks = data.get('marks')
            if not name or not isinstance(name, str):
                return jsonify({'response': "The student's name is required."}), 400
            try:
                marks = int(marks)
            except (ValueError, TypeError):
                return jsonify({'response': "The marks value must be an integer."}), 400

            success = db_manager.modify_marks_by_name(name.strip(), marks)
            response = (
                f"The marks for {name} have been updated to {marks}." if success
                else f"No matching student record found for {name}."
            )
            return jsonify({'response': response})

        elif intent == 'delete_student':
            name = data.get('name')
            if not name or not isinstance(name, str):
                return jsonify({'response': "The student's name is required."}), 400
            success = db_manager.delete_student_by_name(name.strip())
            response = (
                f"The record for {name} has been deleted." if success
                else f"No matching student record found for {name}."
            )
            return jsonify({'response': response})

        elif intent == 'get_marks':
            name = data.get('name')
            if not name or not isinstance(name, str):
                return jsonify({'response': "The student's name is required."}), 400
            record = db_manager.get_marks_by_name(name.strip())
            if record:
                marks_display = record.get('marks_obtained', 'No marks recorded')
                response = f"{record['name']} has obtained {marks_display} marks."
            else:
                response = f"No matching student record found for {name}."
            return jsonify({'response': response})

    except Exception as e:
        return jsonify({'response': f"An unexpected server error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
