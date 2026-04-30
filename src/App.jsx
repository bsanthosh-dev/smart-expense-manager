import { useEffect, useState } from "react";
import {
  PieChart, Pie, Tooltip, Legend, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

function App() {
  const [filter, setFilter] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [editId, setEditId] = useState(null);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.length;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

  const categoryData = ["Food", "Travel", "Shopping"].map(cat => ({
    name: cat,
    value: expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  const monthlyData = expenses.reduce((acc, e) => {
    const month = e.date ? e.date.slice(0, 7) : "Unknown";
    const found = acc.find(item => item.month === month);
    if (found) found.amount += e.amount;
    else acc.push({ month, amount: e.amount });
    return acc;
  }, []);

  const loadExpenses = async () => {
    const res = await fetch("http://localhost:8081/api/expenses");
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async () => {
    const url = editId
      ? `http://localhost:8081/api/expenses/${editId}`
      : "http://localhost:8081/api/expenses";

    await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        amount: parseFloat(amount),
        category,
        date,
      }),
    });

    setTitle("");
    setAmount("");
    setCategory("");
    setDate("");
    setEditId(null);
    loadExpenses();
  };

  const editExpense = (e) => {
    setEditId(e.id);
    setTitle(e.title);
    setAmount(e.amount);
    setCategory(e.category);
    setDate(e.date);
  };

  const deleteExpense = async (id) => {
    if (!confirm("Delete this expense?")) return;

    await fetch(`http://localhost:8081/api/expenses/${id}`, {
      method: "DELETE",
    });

    loadExpenses();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Smart Expense Manager</h1>
        <p style={styles.subtitle}>Analytics dashboard for daily expenses</p>

        <div style={styles.card}>
          <h2>{editId ? "Update Expense" : "Add Expense"}</h2>

          <input style={styles.input} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input style={styles.input} placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />

          <select style={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
          </select>

          <input style={styles.input} type="date" value={date} onChange={e => setDate(e.target.value)} />

          <button style={styles.primaryBtn} onClick={handleSubmit}>
            {editId ? "Update Expense" : "Add Expense"}
          </button>
        </div>

        <div style={styles.cardContainer}>
          <div style={styles.dashboardCard}>
            <h4>Total Spent</h4>
            <p>₹{totalAmount}</p>
          </div>

          <div style={styles.dashboardCard}>
            <h4>Total Expenses</h4>
            <p>{totalExpenses}</p>
          </div>

          <div style={styles.dashboardCard}>
            <h4>Highest Expense</h4>
            <p>₹{highestExpense}</p>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h2>Category Analytics</h2>
          <PieChart width={320} height={300}>
            <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={["#00C49F", "#FFBB28", "#FF8042"][index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div style={styles.chartCard}>
          <h2>Monthly Expense Graph</h2>
          <BarChart width={500} height={300} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#38bdf8" />
          </BarChart>
        </div>

        <h2 style={styles.sectionTitle}>All Expenses</h2>

        <select style={styles.input} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
        </select>

        {expenses
          .filter(e => (filter ? e.category === filter : true))
          .map(e => (
            <div key={e.id} style={styles.expenseCard}>
              <h3>{e.title}</h3>
              <p>Amount: ₹{e.amount}</p>
              <p>Category: {e.category}</p>
              <p>Date: {e.date}</p>

              <div style={{ marginTop: "10px" }}>
              <button style={styles.editBtn}>Edit</button>
             <button style={styles.deleteBtn}>Delete</button>
            </div>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
   minHeight: "100vh",
   background: "linear-gradient(135deg, #0f172a, #1e293b)",
   color: "white",
   padding: "25px",
   fontFamily: "Arial",
  },
   container: {
   maxWidth: "850px",
   margin: "auto",
  },
   title: {
   textAlign: "center",
   fontSize: "38px",
  },
   subtitle: {
   textAlign: "center",
   color: "#cbd5e1",
  },
  card: {
   background: "#1e293b",
   padding: "22px",
   borderRadius: "16px",
   marginTop: "25px",
  },
   input: {
   width: "100%",
   padding: "12px",
   marginBottom: "12px",
   borderRadius: "8px",
   border: "none",
   fontSize: "15px",
  },
   primaryBtn: {
   width: "100%",
   padding: "12px",
   background: "#38bdf8",
   border: "none",
   borderRadius: "8px",
   fontWeight: "bold",
   cursor: "pointer",
  },
   cardContainer: {
   display: "flex",
   gap: "15px",
   marginTop: "25px",
  },
   dashboardCard: {
   flex: 1,
   background: "#1e293b",
   padding: "18px",
   borderRadius: "14px",
   textAlign: "center",
  },
   chartCard: {
   background: "#1e293b",
   padding: "20px",
   borderRadius: "16px",
   marginTop: "20px",
  },
   sectionTitle: {
   marginTop: "30px",
  },
   expenseCard: {
   background: "rgba(255,255,255,0.05)",
   backdropFilter: "blur(10px)",
   border: "1px solid rgba(255,255,255,0.1)",
   padding: "20px",
   borderRadius: "16px",
   marginTop: "15px",
},
   editBtn: {
   marginRight: "10px",
   background: "#facc15",
   border: "none",
   padding: "10px 16px",
   borderRadius: "8px",
   fontWeight: "bold",
   cursor: "pointer",
},
   deleteBtn: {
   background: "#ef4444",
   border: "none",
   padding: "10px 16px",
   borderRadius: "8px",
   color: "white",
   fontWeight: "bold",
   cursor: "pointer",
},
};

export default App;