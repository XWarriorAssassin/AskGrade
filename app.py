import pickle
from flask import Flask, render_template, request, jsonify
from models.database import DatabaseManager
import os
import random

app = Flask(__name__)
db_manager = DatabaseManager()

# Load the trained model at startup
model_path = os.path.join(os.path.dirname(__file__), 'data', 'model.pkl')
with open(model_path, 'rb') as f:
    intent_classifier = pickle.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/query', methods=['POST'])
def api_query():
    user_msg = request.json.get('message')
    intent, confidence = intent_classifier.predict_intent(user_msg)
    response = "Command not recognized."
    require_form = False
    required_fields = []
    print("Confidence:",int(confidence*100),"%")
    if intent == 'add_student':
        response = "Please enter the student's details below."
        require_form = True
        required_fields = ['roll number','name', 'marks','house', 'email', 'class', 'section']

    elif intent == 'modify_marks':
        response = "Please enter the student name and new marks below."
        require_form = True
        required_fields = ['name', 'marks']

    elif intent == 'display_all':
        data = db_manager.get_all_records()
        if data:
            record_fields = list(data[0].keys())
            response = "Here are the student records:"
            return jsonify({
                'response': response,
                'records': data,
                'record_fields': record_fields
            })
        else:
            response = "No records to display."


    elif intent == 'show_desc_marks':
        data = db_manager.get_desc_marks()
        if data:
            response = "Students ordered by marks (descending):"
            return jsonify({
                'response': response,
                'records': data,
                'record_fields': ['name', 'marks_obtained']
            })
        else:
            response = "No records to display."
    
    elif intent=="compliment":
        
        responses = [
        "You’re welcome",
        "Anytime",
        "No problem",
        "Always welcome",
        "Sure, happy to help",
        "No worries at all",
        "That’s okay, don’t mention it",
        "Glad I could help you",
        "Of course, no issue",
        "It’s fine, anytime you ask",
        "You got it",
        "Okay, done",
        "That’s good, I’m happy it worked",
        "No issue, always here for you",
        "Sure thing",
        "Happy to do that for you",
        "It’s nothing, really",
        "That’s alright, my pleasure",
        "Okay, glad to help",
        "I’m here if you need more help",
        "Don’t worry, it was simple",
        "It’s fine, not a big deal",
        "Okay, I liked helping you",
        "That’s okay, I enjoy helping",
        "Sure, it was easy",
        "Alright, glad it’s useful",
        "No trouble at all",
        "Okay, anytime you want",
        "You’re most welcome",
        "Fine, always happy to support",
        "That’s okay, good to know it helped",
        "No stress, I’m here for you",
        "It’s good, I like helping others",
        "Okay, nothing hard in that",
        "No worries, that was quick",
        "Always glad to see you happy",
        "Sure, anything for you",
        "Okay, no problem at all",
        "I’m happy it worked out for you",
        "Alright, you can always ask me",
        "It’s fine, I don’t mind helping",
        "Of course, happy to do it",
        "No issue, hope it’s clear now",
        "Okay, that’s nothing big",
        "Happy that it made things easier",
        "Don’t mention it, I like doing this",
        "It’s okay, I enjoy these small helps",
        "Sure, I’m glad it helped you understand",
        "Always nice to help people like you",
        "Okay, I’ll always try to help whenever you need"
    ]
        response=random.choice(responses)

    elif intent=="greet":
        responses=["Hello",
        "Hi there",
        "Hey",
        "Good to see you",
        "Hope you’re having a good day",
        "Wishing you a great day",
        "Hi, how are you?",
        "Hello, nice to meet you",
        "Hey, glad you’re here",
        "Good morning",
        "Good afternoon",
        "Good evening",
        "Hope everything’s going well",
        "Hi, hope you’re doing fine",
        "Hello, how’s your day going?",
        "Hey, it’s nice to see you",
        "Wishing you a wonderful day ahead",
        "Hi there, hope all is well",
        "Good to have you here",
        "Hope you have a fantastic day",
        "Hello, I’m happy to talk with you",
        "Hi, wishing you a pleasant day",
        "Hey, how’s everything?",
        "Hope you’re having a nice time",
        "Good to see you again",
        "Hello, hope today’s treating you well",
        "Hi, I hope you’re in good spirits",
        "Hey, hope things are going smoothly",
        "Good morning, hope you feel fresh today",
        "Good afternoon, wishing you a productive day",
        "Good evening, hope you had a nice day",
        "Hi there, it’s nice to connect with you",
        "Hello, I hope everything’s going great for you",
        "Hey, hope your day’s been good so far",
        "Wishing you peace and happiness today",
        "Hi, glad to catch up with you",
        "Hope you’re having a cheerful day",
        "Hello, hope your day is full of positivity",
        "Good to see you smiling",
        "Hey, hope you’re enjoying yourself",
        "Hi, wishing you joy and success today",
        "Hope today brings you lots of good things",
        "Hello, may your day be bright and happy",
        "Hey, hope you’re feeling good today",
        "Good morning, hope you slept well",
        "Good evening, hope you’re relaxing now",
        "Hi, hope your plans are going well",
        "Hello, always glad to greet you",
        "Hope you’re having a wonderful time"]
        response=random.choice(responses)
     

    elif intent == 'show_top3':
        data = db_manager.get_top_n(3)
        if data:
            response = "Top 3 students:"
            return jsonify({
                'response': response,
                'records': data,
                'record_fields': ['name', 'marks_obtained']
            })
        else:
            response = "No records to display."

    elif intent == 'class_average':
        avg = db_manager.get_class_average()
        response = f"Class average: {avg:.2f}" if avg is not None else "No grades found."

    elif intent == 'fail_records':
        fails = db_manager.get_failing_students()
        if fails:
            response = "Students who failed:"
            return jsonify({
                'response': response,
                'records': fails,
                'record_fields': ['name', 'marks_obtained']
            })
        else:
            response = "No fail marks found."

    elif intent == "delete_student":
        response = "Enter the student's name below."
        require_form = True
        required_fields=["name"]
    
    elif intent == 'get_marks':
        response = "Please enter the student's name to get marks."
        require_form = True
        required_fields = ['name']


    return jsonify({
        'response': response,
        'require_form': require_form,
        'required_fields': required_fields,
        'intent': intent
    })

# New route for handling form submissions
@app.route('/api/submit_form', methods=['POST'])
def submit_form():
    intent = request.json.get('intent')
    data = request.json.get('form')
    response = "Form submission not recognized."

    if intent == 'add_student':
        student_id = data.get('roll number')
        name = data.get('name') or None
        marks = data.get('marks')
        email = data.get('email') or None
        student_class = data.get('class') or None
        section = data.get('section') or None
        house= data.get('house') or None

        # Convert marks to int if provided and valid, else None
        try:
            marks = int(marks) if marks not in [None, ''] else None
        except ValueError:
            marks = None

        db_manager.add_student(student_id,name, marks,house, email, student_class, section)
        response = "Added student record."

    elif intent == 'modify_marks':
        name = data.get('name') or None
        marks = data.get('marks')
        try:
            marks = int(marks) if marks not in [None, ''] else None
        except ValueError:
            marks = None

        if name and marks is not None:
            success = db_manager.modify_marks_by_name(name, marks)
            response = f"Updated {name}'s marks to {marks}." if success else f"Student {name} not found."
        else:
            response = "Please provide both student name and marks to modify."

    elif intent == 'delete_student':
        name = data.get('name') or None
        if name:
            success = db_manager.delete_student_by_name(name)
            response = f"Deleted {name}'s record." if success else f"Student {name} not found."
        else:
            response = "Please provide the student's name to delete."

    elif intent == 'get_marks':
        name = data.get('name') or None
        if name:
            record = db_manager.get_marks_by_name(name)
            if record:
                response = f"{record['name']} has scored {record['marks_obtained']} marks."
            else:
                response = f"No records found for student named {name}."
        else:
            response = "Please provide the student's name."

    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000,debug=True)
