import sqlite3

conn = sqlite3.connect('sqlite.db')
cursor = conn.cursor()
cursor.execute("SELECT email, role, id FROM users;")
print(cursor.fetchall())
conn.close()
