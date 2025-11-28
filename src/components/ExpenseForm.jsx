import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const PersonalExpenseForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    // IMPORTANT: No paidBy or participants fields here
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    
    // For personal expenses, we assume the user paid 100% and participated 100%
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
      isPersonal: true // Flag this for future tracking/filtering (though not strictly needed yet)
    });

    setFormData(prev => ({ 
        ...prev, 
        title: '', 
        amount: ''
    }));
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-700";
  const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 h-fit">
      
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
          <PlusCircle className="w-5 h-5" />
        </div>
        Record Personal Expense
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className={labelClass}>Description</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className={inputClass}
              placeholder="e.g. Daily Coffee, Subscription Fee"
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Amount (₹)</label>
            <input 
                type="number" 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className={inputClass}
                placeholder="0"
            />
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={inputClass}
            />
          </div>
        </div>

        <div>
            <label className={labelClass}>Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={inputClass}
            >
              <option value="Food">🍔 Food & Dining</option>
              <option value="Transport">🚕 Transport</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Housing">🏠 Housing</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Health">🏥 Health</option>
              <option value="Utilities">💡 Utilities</option>
              <option value="Other">📦 Other</option>
            </select>
        </div>


        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95">
          Save My Expense
        </button>
      </form>
    </div>
  );
};

export default PersonalExpenseForm;