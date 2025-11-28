import React from 'react';
import { Filter, SortAsc } from 'lucide-react';

const categories = [
    { value: 'All', label: 'All Categories' },
    { value: 'Food', label: '🍔 Food & Dining' },
    { value: 'Transport', label: '🚕 Transport' },
    { value: 'Shopping', label: '🛍️ Shopping' },
    { value: 'Housing', label: '🏠 Housing' },
    { value: 'Entertainment', label: '🎬 Entertainment' },
    { value: 'Health', label: '🏥 Health' },
    { value: 'Utilities', label: '💡 Utilities' },
    { value: 'Other', label: '📦 Other' },
];

const FilterControls = ({ filter, setFilter, sort, setSort }) => {
    
    const inputClass = "p-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-slate-700 bg-white shadow-sm";

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-start">
            
            {/* Filter by Category */}
            <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-500" />
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className={inputClass}
                >
                    {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
                <SortAsc className="w-5 h-5 text-indigo-500" />
                <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value)}
                    className={inputClass}
                >
                    <option value="date_desc">Date (Newest First)</option>
                    <option value="date_asc">Date (Oldest First)</option>
                    <option value="amount_desc">Amount (Highest First)</option>
                    <option value="amount_asc">Amount (Lowest First)</option>
                </select>
            </div>
        </div>
    );
};

export default FilterControls;