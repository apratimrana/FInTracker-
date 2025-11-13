# Personal Finance Manager - API Documentation

## Backend API Endpoints

Your Flask backend is now running as a **JSON API** that works perfectly with your existing frontend!

### **Base URL:** `http://localhost:5000`

---

## **Dashboard Data**
**GET** `/`
Returns complete dashboard data including totals, recent transactions, and expense breakdown.

**Response:**
```json
{
  "total_income": 3500.0,
  "total_expense": 430.0,
  "balance": 3070.0,
  "recent_transactions": [
    {
      "id": 5,
      "type": "Expense",
      "amount": 200.0,
      "category": "Food",
      "description": "Restaurant dinner",
      "date": "2024-01-19"
    }
  ],
  "expense_breakdown": [
    {
      "category": "Food",
      "total": 350.0
    },
    {
      "category": "Transport", 
      "total": 80.0
    }
  ],
  "status": "success"
}
```

---

## **Add Transaction**
**POST** `/add_transaction`

**Request Body (JSON):**
```json
{
  "type": "Income",
  "amount": 500.0,
  "category": "Freelance",
  "description": "Website project",
  "date": "2024-01-20"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Transaction added successfully",
  "transaction_id": 6
}
```

---

## **View All Transactions**
**GET** `/transactions`

**Response:**
```json
{
  "status": "success",
  "transactions": [
    {
      "id": 5,
      "type": "Expense",
      "amount": 200.0,
      "category": "Food",
      "description": "Restaurant dinner",
      "date": "2024-01-19"
    }
  ],
  "count": 5
}
```

---

## **Delete Transaction**
**DELETE** `/delete_transaction/<transaction_id>`

**Response:**
```json
{
  "status": "success",
  "message": "Transaction deleted successfully"
}
```

---

## **Chart Data APIs**

### **Expense Breakdown (Pie Chart)**
**GET** `/api/expense_breakdown`

**Response:**
```json
[
  {
    "category": "Food",
    "amount": 350.0
  },
  {
    "category": "Transport",
    "amount": 80.0
  }
]
```

### **Monthly Comparison (Bar Chart)**
**GET** `/api/monthly_comparison`

**Response:**
```json
[
  {
    "month": "2024-01",
    "income": 3500.0,
    "expense": 430.0
  }
]
```

---

## **Frontend Integration**

### **JavaScript Fetch Examples:**

```javascript
// Get dashboard data
fetch('http://localhost:5000/')
  .then(response => response.json())
  .then(data => {
    console.log('Balance:', data.balance);
    console.log('Recent transactions:', data.recent_transactions);
  });

// Add new transaction
fetch('http://localhost:5000/add_transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'Expense',
    amount: 50.0,
    category: 'Food',
    description: 'Lunch',
    date: '2024-01-20'
  })
})
.then(response => response.json())
.then(data => console.log('Transaction added:', data));

// Get all transactions
fetch('http://localhost:5000/transactions')
  .then(response => response.json())
  .then(data => {
    console.log('All transactions:', data.transactions);
  });

// Delete transaction
fetch('http://localhost:5000/delete_transaction/1', {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => console.log('Delete result:', data));
```

---

##  **Status: READY TO USE**

- All endpoints working
-  CORS enabled for frontend integration
-  JSON responses
-  Error handling
- Sample data loaded
- Database initialized

Your backend is now **fully functional** and ready to work with your existing frontend!
