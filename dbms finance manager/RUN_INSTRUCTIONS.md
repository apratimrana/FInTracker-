# How to Run the Personal Finance Manager

## 🚀 Quick Start Guide

### Method 1: Using Startup Scripts (Easiest)

#### Windows - Batch File
1. Double-click `start_app.bat`
2. Wait for the server to start
3. Open your browser to http://localhost:5000

#### Windows - PowerShell
1. Right-click `start_app.ps1`
2. Select "Run with PowerShell"
3. Open your browser to http://localhost:5000

### Method 2: Manual Setup

#### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2: Run the Application
```bash
python run.py
```

Or directly:
```bash
python app.py
```

#### Step 3: Access the Application
Open your web browser and go to:
- **Main Application**: http://localhost:5000

## 📋 Detailed Instructions

### Prerequisites
- **Python 3.7 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** - Usually comes with Python

### Step-by-Step Setup

1. **Open Terminal/Command Prompt**
   - Windows: Press `Win + R`, type `cmd`, press Enter
   - Or use PowerShell

2. **Navigate to Project Directory**
   ```bash
   cd "E:\dbms finance manager"
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   This will install:
   - Flask (web framework)
   - Flask-CORS (for API access)
   - Other required packages

4. **Run the Application**
   ```bash
   python run.py
   ```

5. **Access the Application**
   - The server will start on port 5000
   - Open your browser: http://localhost:5000
   - You should see the FinTrack homepage

### What Happens When You Run

1. ✅ Database is automatically created (`finance_manager.db`)
2. ✅ Sample data is added (5 sample transactions)
3. ✅ Flask server starts on http://localhost:5000
4. ✅ Frontend is served from the `frontend/` folder
5. ✅ API endpoints are available at `/api/*`

## 🎯 Using the Application

### Dashboard
- Click "Get Started" or "Dashboard" to view your financial overview
- See total income, expenses, and balance
- View recent transactions
- See category breakdown and monthly trends

### Add Transaction
1. Click "Add Transaction" button
2. Fill in the form:
   - Type: Income or Expense
   - Amount: Enter the amount
   - Category: e.g., Food, Transport, Salary
   - Description: Brief description
   - Date: Select the date
3. Click "Add Transaction"

### View Transactions
- All transactions are displayed in the dashboard
- Recent transactions show in the summary
- Full transaction list available via API

## 🔧 Troubleshooting

### Port 5000 Already in Use
If you get an error that port 5000 is in use:
```bash
# Option 1: Kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Change the port in app.py
# Edit app.py, line 231:
app.run(debug=True, host='0.0.0.0', port=5001)  # Change to 5001 or another port
```

### Python Not Found
- Make sure Python is installed
- Add Python to your PATH
- Try `python3` instead of `python`

### Dependencies Installation Fails
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Then install requirements
pip install -r requirements.txt
```

### Database Errors
- Delete `finance_manager.db` if it's corrupted
- The database will be recreated automatically on next run

## 📱 Accessing from Other Devices

If you want to access the application from other devices on your network:

1. Find your computer's IP address:
   ```bash
   # Windows:
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. The app is already configured to accept connections from any IP
3. Access from another device: `http://YOUR_IP:5000`
   - Example: `http://192.168.1.100:5000`

## 🛑 Stopping the Server

- Press `Ctrl + C` in the terminal
- Or close the terminal window

## 📝 Notes

- The database file (`finance_manager.db`) stores all your data
- Sample data is automatically added on first run
- The application runs in debug mode for development
- All changes are saved immediately to the database

## 🆘 Need Help?

If you encounter any issues:
1. Check that Python is installed correctly
2. Verify all dependencies are installed
3. Check that port 5000 is available
4. Review the error messages in the terminal
5. Make sure you're in the correct directory

