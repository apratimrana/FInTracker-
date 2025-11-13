#!/usr/bin/env python3
"""
Simple startup script for Personal Finance Manager
Run this file to start the Flask application
"""

from app import app, setup_database

if __name__ == '__main__':
    print("Starting Personal Finance Manager...")
    print("Initializing database...")
    setup_database()
    print("Database initialized successfully!")
    print("Starting Flask server...")
    print("Application will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
