from flask import Flask, request, jsonify, send_from_directory
from datetime import datetime
import sqlite3
import os
from flask_cors import CORS

# --- Basic Setup ---
app = Flask(__name__)
# Allows a frontend hosted on a different domain to communicate with this API
CORS(app)

DATABASE_FILE = 'finance_manager.db'


# --- Database Initialization ---
def setup_database():
    """Creates the database and tables if they don't already exist."""
    connection = sqlite3.connect(DATABASE_FILE)
    cursor = connection.cursor()

    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            payment_method TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Budget table for monthly and category budgets
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            monthly_budget REAL NOT NULL,
            current_month TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create unique index for category and month combination
    cursor.execute('''
        CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_category_month 
        ON budgets(category, current_month)
    ''')

    # Settings table for user preferences
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert default monthly budget setting if not exists
    cursor.execute('SELECT COUNT(*) FROM settings WHERE key = ?', ('monthly_budget',))
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ('monthly_budget', '0'))
        cursor.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ('currency', 'INR'))

    connection.commit()
    connection.close()


def get_db_connection():
    """Establishes a connection to the database."""
    connection = sqlite3.connect(DATABASE_FILE)
    # This lets us access columns by name (e.g., row['amount'])
    connection.row_factory = sqlite3.Row
    return connection


# --- Core API Endpoints ---

@app.route('/api/summary')
def get_dashboard_summary():
    """Provides a snapshot of the user's financial status with budget information."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get current month
    current_month = datetime.now().strftime('%Y-%m')

    # Get total income and expenses
    cursor.execute('''
        SELECT 
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
    ''')
    totals = cursor.fetchone()
    total_income = totals['total_income'] or 0
    total_expense = totals['total_expense'] or 0
    balance = total_income - total_expense

    # Get current month's income and expenses
    cursor.execute('''
        SELECT 
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as monthly_income,
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as monthly_expense
        FROM transactions
        WHERE strftime('%Y-%m', date) = ?
    ''', (current_month,))
    monthly_totals = cursor.fetchone()
    monthly_income = monthly_totals['monthly_income'] or 0
    monthly_expense = monthly_totals['monthly_expense'] or 0

    # Get monthly budget from settings
    cursor.execute('SELECT value FROM settings WHERE key = ?', ('monthly_budget',))
    budget_row = cursor.fetchone()
    monthly_budget = float(budget_row['value']) if budget_row and budget_row['value'] else 0

    # Calculate budget usage
    budget_used_percentage = (monthly_expense / monthly_budget * 100) if monthly_budget > 0 else 0
    budget_remaining = monthly_budget - monthly_expense if monthly_budget > 0 else 0

    # Get category budgets and spending
    cursor.execute('''
        SELECT category, monthly_budget 
        FROM budgets 
        WHERE current_month = ?
    ''', (current_month,))
    category_budgets = {row['category']: row['monthly_budget'] for row in cursor.fetchall()}

    cursor.execute('''
        SELECT category, SUM(amount) as spent
        FROM transactions
        WHERE type = 'Expense' AND strftime('%Y-%m', date) = ?
        GROUP BY category
    ''', (current_month,))
    category_spending = {row['category']: row['spent'] for row in cursor.fetchall()}

    # Get recent transactions
    cursor.execute('SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT 5')
    recent_transactions = [dict(row) for row in cursor.fetchall()]

    # Get currency setting
    cursor.execute('SELECT value FROM settings WHERE key = ?', ('currency',))
    currency_row = cursor.fetchone()
    currency = currency_row['value'] if currency_row and currency_row['value'] else 'INR'

    conn.close()

    return jsonify({
        'totalIncome': total_income,
        'totalExpense': total_expense,
        'balance': balance,
        'monthlyIncome': monthly_income,
        'monthlyExpense': monthly_expense,
        'monthlyBudget': monthly_budget,
        'budgetUsedPercentage': budget_used_percentage,
        'budgetRemaining': budget_remaining,
        'recentTransactions': recent_transactions,
        'categoryBudgets': category_budgets,
        'categorySpending': category_spending,
        'currency': currency
    })


@app.route('/api/transactions', methods=['GET'])
def get_all_transactions():
    """Retrieves a full list of all recorded transactions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM transactions ORDER BY date DESC')
    transactions = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify(transactions)


@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    """Adds a new transaction to the database."""
    try:
        # This endpoint accepts both standard form data and JSON
        data = request.get_json() if request.is_json else request.form

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO transactions (type, amount, category, description, date, payment_method, notes) 
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (
                data['type'],
                float(data['amount']),
                data['category'],
                data.get('description', ''),
                data.get('date', datetime.now().strftime('%Y-%m-%d')),
                data.get('paymentMethod', ''),
                data.get('notes', '')
            )
        )

        new_transaction_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # Respond with a success message and the ID of the new entry
        return jsonify({
            'message': 'Transaction added successfully!',
            'transactionId': new_transaction_id
        }), 201

    except (KeyError, ValueError):
        return jsonify({'error': 'Invalid or missing data provided. Please check your inputs.'}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred on the server.', 'details': str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Updates an existing transaction."""
    try:
        data = request.get_json() if request.is_json else request.form

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if transaction exists
        cursor.execute('SELECT id FROM transactions WHERE id = ?', (transaction_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': f'Transaction with ID {transaction_id} not found.'}), 404

        # Update transaction
        cursor.execute('''
            UPDATE transactions 
            SET type = ?, amount = ?, category = ?, description = ?, date = ?, 
                payment_method = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data['type'],
            float(data['amount']),
            data['category'],
            data.get('description', ''),
            data.get('date', datetime.now().strftime('%Y-%m-%d')),
            data.get('paymentMethod', ''),
            data.get('notes', ''),
            transaction_id
        ))

        conn.commit()
        conn.close()

        return jsonify({
            'message': f'Transaction with ID {transaction_id} was successfully updated.',
            'transactionId': transaction_id
        })

    except (KeyError, ValueError) as e:
        return jsonify({'error': 'Invalid or missing data provided.', 'details': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected server error occurred.', 'details': str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Gets a specific transaction by ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,))
        transaction = cursor.fetchone()
        conn.close()

        if not transaction:
            return jsonify({'error': f'Transaction with ID {transaction_id} not found.'}), 404

        return jsonify(dict(transaction))

    except Exception as e:
        return jsonify({'error': 'An unexpected server error occurred.', 'details': str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Deletes a specific transaction by its ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # First, check if the transaction even exists to provide a clear error
        cursor.execute('SELECT id FROM transactions WHERE id = ?', (transaction_id,))
        if not cursor.fetchone():
            return jsonify({'error': f'Transaction with ID {transaction_id} not found.'}), 404

        cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        conn.commit()
        conn.close()

        return jsonify({'message': f'Transaction with ID {transaction_id} was successfully deleted.'})

    except Exception as e:
        return jsonify({'error': 'An unexpected server error occurred while deleting.', 'details': str(e)}), 500


# --- Chart-Specific API Endpoints ---

@app.route('/api/charts/expense_breakdown')
def get_expense_breakdown_data():
    """Provides data structured for an expense category pie chart."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT category, SUM(amount) as total 
        FROM transactions 
        WHERE type = 'Expense'
        GROUP BY category
    ''')
    data = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(data)


@app.route('/api/charts/monthly_comparison')
def get_monthly_comparison_data():
    """Provides monthly income vs. expense data for a bar chart."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
    ''')
    data = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(data)


# --- Budget Management API Endpoints ---

@app.route('/api/budget', methods=['GET'])
def get_budget():
    """Gets the monthly budget and category budgets."""
    conn = get_db_connection()
    cursor = conn.cursor()

    current_month = datetime.now().strftime('%Y-%m')

    # Get monthly budget
    cursor.execute('SELECT value FROM settings WHERE key = ?', ('monthly_budget',))
    budget_row = cursor.fetchone()
    monthly_budget = float(budget_row['value']) if budget_row and budget_row['value'] else 0

    # Get category budgets
    cursor.execute('''
        SELECT category, monthly_budget 
        FROM budgets 
        WHERE current_month = ?
    ''', (current_month,))
    category_budgets = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'monthlyBudget': monthly_budget,
        'categoryBudgets': category_budgets,
        'currentMonth': current_month
    })


@app.route('/api/budget', methods=['POST'])
def set_budget():
    """Sets the monthly budget."""
    try:
        data = request.get_json() if request.is_json else request.form
        monthly_budget = float(data.get('monthlyBudget', 0))

        conn = get_db_connection()
        cursor = conn.cursor()

        # Update or insert monthly budget
        cursor.execute('SELECT COUNT(*) FROM settings WHERE key = ?', ('monthly_budget',))
        if cursor.fetchone()[0] > 0:
            cursor.execute('''
                UPDATE settings 
                SET value = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE key = ?
            ''', (str(monthly_budget), 'monthly_budget'))
        else:
            cursor.execute('''
                INSERT INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', ('monthly_budget', str(monthly_budget)))

        conn.commit()
        conn.close()

        return jsonify({
            'message': 'Monthly budget updated successfully!',
            'monthlyBudget': monthly_budget
        })

    except (ValueError, KeyError) as e:
        return jsonify({'error': 'Invalid budget value.', 'details': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.', 'details': str(e)}), 500


@app.route('/api/budget/category', methods=['POST'])
def set_category_budget():
    """Sets a budget for a specific category."""
    try:
        data = request.get_json() if request.is_json else request.form
        category = data.get('category')
        budget = float(data.get('budget', 0))
        current_month = datetime.now().strftime('%Y-%m')

        if not category:
            return jsonify({'error': 'Category is required.'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert or update category budget
        cursor.execute('''
            SELECT COUNT(*) FROM budgets 
            WHERE category = ? AND current_month = ?
        ''', (category, current_month))
        if cursor.fetchone()[0] > 0:
            cursor.execute('''
                UPDATE budgets 
                SET monthly_budget = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE category = ? AND current_month = ?
            ''', (budget, category, current_month))
        else:
            cursor.execute('''
                INSERT INTO budgets (category, monthly_budget, current_month, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ''', (category, budget, current_month))

        conn.commit()
        conn.close()

        return jsonify({
            'message': f'Budget for {category} updated successfully!',
            'category': category,
            'budget': budget
        })

    except (ValueError, KeyError) as e:
        return jsonify({'error': 'Invalid data provided.', 'details': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.', 'details': str(e)}), 500


@app.route('/api/budget/category/<category>', methods=['DELETE'])
def delete_category_budget(category):
    """Deletes a category budget."""
    try:
        current_month = datetime.now().strftime('%Y-%m')
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            DELETE FROM budgets 
            WHERE category = ? AND current_month = ?
        ''', (category, current_month))

        conn.commit()
        conn.close()

        return jsonify({'message': f'Budget for {category} deleted successfully!'})

    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.', 'details': str(e)}), 500


# --- Frontend Routes ---
# Serve static files (CSS, JS, images, etc.) from frontend folder
@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files."""
    return send_from_directory(os.path.join('frontend', 'css'), filename)


@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files."""
    return send_from_directory(os.path.join('frontend', 'js'), filename)


# Serve HTML pages
@app.route('/')
def index():
    """Serve the main index page."""
    return send_from_directory('frontend', 'index.html')


@app.route('/<page>')
def serve_html(page):
    """Serve HTML pages and other frontend files."""
    # Don't serve API routes as HTML
    if page.startswith('api'):
        return jsonify({'error': 'Not found'}), 404
    
    file_path = os.path.join('frontend', page)
    
    # If file exists, serve it
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory('frontend', page)
    
    # Try with .html extension for HTML pages
    html_file = f'{page}.html'
    html_path = os.path.join('frontend', html_file)
    if os.path.exists(html_path):
        return send_from_directory('frontend', html_file)
    
    return jsonify({'error': 'Page not found'}), 404


if __name__ == '__main__':
    # Ensure the database is ready before starting the server.
    setup_database()

    # Run the Flask application.
    # debug=True enables auto-reloading when you save code changes.
    app.run(debug=True, host='0.0.0.0', port=5000)
