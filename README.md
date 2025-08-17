# AskGrade

**AskGrade** is a smart student marks management system built with **Flask**, **MySQL**, and a custom **NLP intent classifier**.  
It helps teachers manage marks, generate insights, and query the database using natural language.

---

## ✨ Features

- 📊 **Student Marks Management** – Add, update, and view student records easily  
- 🤖 **AI-powered Queries** – Natural language intent classifier to interpret teacher queries  
- 📈 **Insights & Statistics** – Max, min, average, and other statistics on student performance  
- 📤 **Export to Excel** – Export student data for reports and sharing  
- 🌐 **Frontend + Backend** – Clean frontend with Flask-based backend  

---

## 🛠️ Tech Stack

- **Backend:** Flask (Python)  
- **Database:** MySQL  
- **Frontend:** HTML, CSS (component-specific styling, no global CSS)  
- **AI/NLP:** Custom intent classification model  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/XWarriorAssassin/AskGrade.git
cd AskGrade
```

### 2. Set Up Virtual Environment (recommended)

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

### 4. Configure Database

- Create a MySQL database (e.g., `askgrade_db`)
- Update connection settings in `database.py`

### 5. Run the App

```bash
flask run
```

---

## 📌 Roadmap

- Teacher & student login system
- More advanced NLP understanding
- Data visualization dashboards
- SaaS deployment

---

## 📜 License

This project is licensed. See LICENSE for details.

---

## 💡 Inspiration

AskGrade was created to help schools and teachers who struggle with Excel-based mark management. With AI assistance, it makes marks entry and analysis fast, intuitive, and reliable.
