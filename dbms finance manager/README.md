# Personal Finance Manager

A full-stack Personal Finance Manager application with Flask backend and modern frontend.

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Installation & Running

#### Option 1: Using the Startup Scripts (Recommended for Windows)

**Using Batch File:**
```bash
start_app.bat
```

**Using PowerShell:**
```powershell
.\start_app.ps1
```

#### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**
   ```bash
   python run.py
   ```
   
   Or directly:
   ```bash
   python app.py
   ```

### 3. Access the Application

Once the server is running, open your browser and navigate to:

- **Main Application**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/api/...

The application will automatically:
- Create the database if it doesn't exist
- Add sample data for testing
- Start the Flask server on port 5000

## Features

### Core Functionality
- ✅ **Dashboard** - View financial summary and recent transactions
- ✅ **Add Transactions** - Create new income/expense entries
- ✅ **View Transactions** - List all transactions
- ✅ **Delete Transactions** - Remove unwanted entries
- ✅ **Chart APIs** - JSON endpoints for data visualization

### API Endpoints

#### Transaction Management
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add a new transaction
- `DELETE /api/transactions/<id>` - Delete a transaction
- `GET /api/summary` - Get dashboard summary (income, expenses, balance, recent transactions)

#### Chart Data
- `GET /api/charts/expense_breakdown` - Expense data by category (for pie charts)
- `GET /api/charts/monthly_comparison` - Monthly income vs expense data (for line/bar charts)

## 🗄️ Database

- **SQLite Database**: `finance_manager.db`
- **Sample Data**: Automatically created with 5 sample transactions
- **Table Structure**: 
  - `id` (Primary Key)
  - `type` (Income/Expense)
  - `amount` (Float)
  - `category` (Text)
  - `description` (Text)
  - `date` (Date)

## 🛠️ Technology Stack

- **Backend**: Python Flask 2.3.3
- **Database**: SQLite
- **API**: RESTful JSON endpoints
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Chart.js
- **CORS**: Enabled for cross-origin requests

## 📁 Project Structure

```
├── app.py                 # Main Flask application
├── run.py                 # Startup script
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── start_app.bat         # Windows batch startup script
├── start_app.ps1         # PowerShell startup script
├── finance_manager.db    # SQLite database (auto-created)
├── frontend/             # Frontend files
│   ├── index.html        # Main page
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── *.html           # Other HTML pages
└── templates/            # Flask templates (legacy)
```

## 🔧 Development

The application is set up for easy development and expansion:
- Debug mode enabled
- Auto-reload on code changes
- Sample data for immediate testing
- Clean, simple codebase ready for additional features

##  Sample Data

The application comes with sample transactions:
- $3,000 Salary income
- $150 Food expense (grocery)
- $80 Transport expense (bus fare)
- $500 Freelance income
- $200 Food expense (restaurant)

Perfect for testing the application immediately!
