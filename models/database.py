import mysql.connector
import dbprivate
class DatabaseManager:
    def __init__(self):
        self.conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=dbprivate.password,
            database='askgrade'
        )
        self.cursor = self.conn.cursor(dictionary=True)

    def add_student(self,student_id, name, marks,house, email=None, student_class=None, section=None):
        # Note: 'class' is a reserved word, use backticks!
        query = "INSERT INTO students (roll_no,name, house ,email, `class`, section) VALUES (%s, %s, %s, %s, %s,%s)"
        self.cursor.execute(query, (student_id,name,house , email, student_class, section))
        self.conn.commit()
        
        # Insert marks
        query = "INSERT INTO grades (roll_no, marks_obtained) VALUES (%s, %s)"
        self.cursor.execute(query, (student_id, marks))
        self.conn.commit()
        return True

    def get_all_records(self):
        query = """
            SELECT *
            FROM students
            JOIN grades ON students.roll_no = grades.roll_no
        """
        self.cursor.execute(query)
        return self.cursor.fetchall()

    def get_desc_marks(self):
        query = """
            SELECT students.name, grades.marks_obtained
            FROM students
            JOIN grades ON students.roll_no = grades.roll_no
            ORDER BY marks_obtained DESC
        """
        self.cursor.execute(query)
        return self.cursor.fetchall()

    def get_top_n(self, n=3):
        query = """
            SELECT students.name, grades.marks_obtained
            FROM students
            JOIN grades ON students.roll_no = grades.roll_no
            ORDER BY marks_obtained DESC
            LIMIT %s
        """
        self.cursor.execute(query, (n,))
        return self.cursor.fetchall()

    def get_class_average(self):
        query = "SELECT AVG(marks_obtained) AS class_average FROM grades"
        self.cursor.execute(query)
        result = self.cursor.fetchone()
        return result['class_average'] if result else None

    def get_failing_students(self, fail_mark=40):
        query = """
            SELECT students.name, grades.marks_obtained
            FROM students
            JOIN grades ON students.roll_no = grades.roll_no
            WHERE marks_obtained < %s
        """
        self.cursor.execute(query, (fail_mark,))
        return self.cursor.fetchall()

    def modify_marks_by_name(self, name, new_marks):
        # Get student ID
        self.cursor.execute("SELECT roll_no FROM students WHERE name=%s", (name,))
        result = self.cursor.fetchone()
        if not result:
            return False
        student_id = result['roll_no']
        # Update marks
        self.cursor.execute("UPDATE grades SET marks_obtained=%s WHERE roll_no=%s", (new_marks, student_id))
        self.conn.commit()
        return True

    def close(self):
        self.conn.close()

    def delete_student_by_name(self, name):
        # Get student ID
        self.cursor.execute("SELECT roll_no FROM students WHERE name=%s", (name,))
        result = self.cursor.fetchone()
        if not result:
            return False
        student_id = result['roll_no']

        # Delete from grades (child table)
        self.cursor.execute("DELETE FROM grades WHERE roll_no=%s", (student_id,))
        # Delete from students
        self.cursor.execute("DELETE FROM students WHERE roll_no=%s", (student_id,))
        self.conn.commit()
        return True
    
    def get_marks_by_name(self, name):
        query = """
            SELECT students.name, grades.marks_obtained
            FROM students
            JOIN grades ON students.roll_no = grades.roll_no
            WHERE students.name = %s
        """
        self.cursor.execute(query, (name,))
        return self.cursor.fetchone()  # Returns a single record or None

