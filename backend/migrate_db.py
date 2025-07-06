"""
Database migration script to add new columns
"""
import sqlite3
import os

def migrate_database():
    db_path = "learning_tracker.db"
    
    if not os.path.exists(db_path):
        print("Database doesn't exist yet, skipping migration")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add category and priority columns to goals table
        try:
            cursor.execute("ALTER TABLE goals ADD COLUMN category TEXT")
            print("Added category column to goals table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Category column already exists in goals table")
            else:
                raise
        
        try:
            cursor.execute("ALTER TABLE goals ADD COLUMN priority TEXT DEFAULT 'medium'")
            print("Added priority column to goals table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Priority column already exists in goals table")
            else:
                raise
        
        # Add priority and estimated_hours columns to tasks table
        try:
            cursor.execute("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'")
            print("Added priority column to tasks table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Priority column already exists in tasks table")
            else:
                raise
        
        try:
            cursor.execute("ALTER TABLE tasks ADD COLUMN estimated_hours INTEGER")
            print("Added estimated_hours column to tasks table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Estimated_hours column already exists in tasks table")
            else:
                raise
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database() 