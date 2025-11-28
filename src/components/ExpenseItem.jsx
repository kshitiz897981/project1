import React, { useState } from 'react';
import { Trash2, Edit2, Save, X } from 'lucide-react';

const ExpenseItem = ({ expense, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(expense);

  const handleSave = () => {
    onEdit(expense.id, editData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-center animate-in fade-in">
        <input 
          className="w-1/3 p-1 border rounded text-sm" 
          value={editData.title} 
          onChange={(e) => setEditData({...editData, title: e.target.value})}
        />
        <input 
          type="number"
          className="w-1/4 p-1 border rounded text-sm" 
          value={editData.amount} 
          onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value)})}
        />
        <button onClick={handleSave} className="p-1 bg-green-500 text-white rounded hover:bg-green-600">
          <Save className="w-4 h-4" />
        </button>
        <button onClick={() => setIsEditing(false)} className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
          ${expense.category === 'Food' ? 'bg-orange-400' : 
            expense.category === 'Transport' ? 'bg-blue-400' :
            expense.category === 'Housing' ? 'bg-purple-400' :
            expense.category === 'Entertainment' ? 'bg-pink-400' : 'bg-gray-400'
          }`}
        >
          {expense.category[0]}
        </div>
        
        {/* Details */}
        <div>
          <p className="font-semibold text-slate-800">{expense.title}</p>
          <p className="text-xs text-slate-500">{expense.date} • {expense.category}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-slate-700">-₹{expense.amount.toFixed(2)}</span>
        <button onClick={() => setIsEditing(true)} className="text-slate-300 hover:text-blue-500 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(expense.id)} className="text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;
