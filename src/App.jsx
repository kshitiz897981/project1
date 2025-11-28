import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Activity, Calendar, Download, Wallet } from 'lucide-react';

// Utility
import { formatMoney } from './utils'; 

// Components
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import ExpenseForm from './components/ExpenseForm'; 
import ExpenseItem from './components/ExpenseItem';
import BillSplitter from './components/BillSplitter'; 
import ChartSection from './components/ChartSection'; 
import FilterControls from './components/FilterControls'; 

export default function App() {
  const [view, setView] = useState('tracker');
  const [budget, setBudget] = useState(10000); 
  const [filter, setFilter] = useState('All'); 
  const [sort, setSort] = useState('date_desc'); 

  // --- Master People List State (Used for splitting across all files) ---
  const [people, setPeople] = useState(() => {
    const savedPeople = localStorage.getItem('masterPeopleList');
    // Initial data based on your requirements (Dhruv, Harsh, Kshitij)
    return savedPeople ? JSON.parse(savedPeople) : [
      { id: 1, name: 'Dhruv Saini' },
      { id: 2, name: 'Harsh' },
      { id: 3, name: 'Kshitij' },
    ];
  });
  
  // Initialize state from Local Storage
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [
      // Sample data reflecting custom split
      { id: 1, title: 'Group Dinner', amount: 2500, category: 'Food', date: '2023-10-25', paidBy: 1, participants: [1, 2, 3] },
      { id: 2, title: 'Metro Tickets', amount: 300, category: 'Transport', date: '2023-11-01', paidBy: 2, participants: [1, 2] }, 
    ];
  });

  // Save People list and Expenses to Local Storage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('masterPeopleList', JSON.stringify(people));
  }, [expenses, people]);

  const addExpense = (expense) => {
    setExpenses([{ ...expense, id: Date.now() }, ...expenses]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const editExpense = (id, updatedData) => {
    setExpenses(expenses.map(e => e.id === id ? updatedData : e));
  };

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedExpenses = useMemo(() => {
    let result = expenses;

    // 1. Filtering (simplified for display)
    if (filter !== 'All') {
      result = result.filter(e => e.category === filter);
    }

    // 2. Sorting
    result.sort((a, b) => {
      if (sort === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'amount_desc') return b.amount - a.amount;
      if (sort === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, filter, sort]);


  const exportCSV = () => {
    const headers = ['ID,Title,Amount (INR),Category,Date,Paid By ID,Participants IDs'];
    const rows = expenses.map(e => 
      `${e.id},"${e.title}",${e.amount},${e.category},${e.date},${e.paidBy || ''},"${e.participants ? e.participants.join('|') : ''}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_expenses_and_splits.csv");
    document.body.appendChild(link);
    link.click();
  };

  const totalSpending = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
  const budgetProgress = Math.min((totalSpending / budget) * 100, 100);

  // Formatting values for StatCards
  const formattedTotalSpent = formatMoney(totalSpending);
  const formattedHighestExpense = formatMoney(highestExpense);


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-indigo-100 selection:text-indigo-700">
      <Navbar view={view} setView={setView} />

      <div className="max-w-6xl mx-auto px-6">
        {view === 'tracker' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Header, Budget, and Stats Grid (Simplified JSX) */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-1">Track your spending in INR (₹)</p>
              </div>
              <button 
                onClick={exportCSV}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            {/* Budget Progress Bar */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-end mb-2">
                <div>
                  <p className="text-indigo-200 font-medium text-sm mb-1">Monthly Budget</p>
                  <h2 className="text-3xl font-bold">{formatMoney(budget - totalSpending)}</h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">{Math.round(budgetProgress)}% used</p>
                </div>
              </div>
              <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ease-out ${budgetProgress > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-400 to-purple-400'}`} style={{ width: `${budgetProgress}%` }}></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Spent" value={formattedTotalSpent} icon={DollarSign} colorClass="bg-indigo-500" />
              <StatCard title="Highest Item" value={formattedHighestExpense} icon={Activity} colorClass="bg-rose-500" />
              <StatCard title="Transactions" value={expenses.length} icon={Calendar} colorClass="bg-emerald-500" />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Form and Chart */}
              <div className="lg:col-span-1 space-y-8">
                {/* --- PASSING PEOPLE AND SETPEOPLE TO FORM --- */}
                <ExpenseForm 
                  onAdd={addExpense} 
                  people={people} 
                  setPeople={setPeople} 
                />
                <ChartSection expenses={expenses} /> 
              </div>
              
              {/* Right Column: List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 min-h-[400px]">
                  
                  {/* List Header and Controls (simplified JSX) */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-indigo-500" /> All Transactions
                    </h2>
                    <FilterControls 
                      filter={filter} setFilter={setFilter}
                      sort={sort} setSort={setSort}
                    />
                  </div>

                  {/* Expense List */}
                  <div className="space-y-3">
                    {filteredAndSortedExpenses.length === 0 ? (
                      <div className="text-center py-16 text-slate-500">No expenses found.</div>
                    ) : null}
                    
                    {filteredAndSortedExpenses.map(expense => (
                      <ExpenseItem 
                        key={expense.id} 
                        expense={expense} 
                        onDelete={deleteExpense} 
                        onEdit={editExpense}
                        people={people} // Pass people for display purposes (e.g., "Paid by Dhruv")
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
             {/* --- PASSING EXPENSES AND PEOPLE TO DEBT CALCULATOR --- */}
             <BillSplitter expenses={expenses} people={people} />
          </div>
        )}
      </div>
    </div>
  );
}