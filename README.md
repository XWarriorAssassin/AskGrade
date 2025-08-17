# AskGrade

**AskGrade** is a smart student marks management system built with **Flask**, **MySQL**, and a custom **NLP intent classifier**.  
It helps teachers manage marks, generate insights, and query the database using natural language.

---

##  Features

-  **Student Marks Management** – Add, update, and view student records easily  
-  **AI-powered Queries** – Natural language intent classifier to interpret teacher queries  
-  **Insights & Statistics** – Max, min, average, and other statistics on student performance    
-  **Frontend + Backend** – Clean frontend with Flask-based backend  

---

## Tech Stack

- **Backend:** Flask (Python)  
- **Database:** MySQL  
- **Frontend:** HTML, CSS (component-specific styling, no global CSS)  
- **AI/NLP:** Custom intent classification model  

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/XWarriorAssassin/AskGrade.git
cd AskGrade
```

### 2. Install Requirements

```bash
pip install -r requirements.txt
```
In Python:
```bash
import nltk
nltk.download('stopwords')
nltk.download('punkt')
```

### 3. Configure Database

- Create a MySQL database askgrade with the following tables
 ```bash
  CREATE DATABASE askgrade;
  CREATE TABLE students (roll_no INT PRIMARY KEY,name VARCHAR(100) NOT NULL,email VARCHAR(100),house VARCHAR(10),`class` VARCHAR(50),section VARCHAR(10));
  CREATE TABLE grades (grade_id INT PRIMARY KEY AUTO_INCREMENT, roll_no INT, marks_obtained DECIMAL(5,2), FOREIGN KEY (roll_no) REFERENCES students(roll_no));
  ```
- Update connection settings in `database.py`

### 4. Run the App

- Run ```train_classifier.py``` to train the model
- Run ```app.py``` to run the application

##  Roadmap

- Teacher & student login system
- More advanced NLP understanding
- Data visualization dashboards
- SaaS deployment

---

##  License

This project is licensed. See LICENSE for details.

---

## 💡 Inspiration

AskGrade was created to help schools and teachers who struggle with Excel-based mark management. With AI assistance, it makes marks entry and analysis fast, intuitive, and reliable.
