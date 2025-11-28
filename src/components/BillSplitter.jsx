import React, { useState, useEffect } from 'react';
import { Users, Trash2, PlusCircle, ArrowRight, BarChart3 } from 'lucide-react';
import { formatMoney } from '../utils';

// Component for the settlement chart (Who owes whom)
const SettlementChart = ({ settlementData }) => {
  if (settlementData.length === 0) return null;

  const maxAbsAmount = Math.max(...settlementData.map(d => Math.abs(d.amount)));
  if (maxAbsAmount === 0) return null;

  return (
    <div className="mt-8">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Settlement Visualization
        </h3>
        <div className="space-y-4">
            {settlementData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium truncate">{item.name}</span>
                    <div className="flex-1 h-5 rounded-full overflow-hidden relative bg-slate-100">
                        {/* Bar */}
                        <div 
                            className={`h-full absolute transition-all duration-700 rounded-full
                                ${item.type === 'owes' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ 
                                width: `${(Math.abs(item.amount) / maxAbsAmount) * 100}%`,
                                [item.type === 'owes' ? 'right' : 'left']: 0 
                            }}
                        ></div>
                        {/* Label */}
                        <span className={`absolute inset-0 text-xs font-bold flex items-center px-2
                            ${item.type === 'owes' ? 'justify-end text-white' : 'justify-start text-white'}`}
                        >
                            {formatMoney(Math.abs(item.amount))}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};


const BillSplitter = () => {
  // Master list of people (for persistence, using localStorage for simplicity)
  const [allPeople, setAllPeople] = useState(() => {
    const saved = localStorage.getItem('splitPeopleMaster');
    return saved ? JSON.parse(saved) : [{ name: 'You', id: 1 }, { name: 'Friend A', id: 2 }];
  });
  
  // State for the CURRENT bill
  const [billDetails, setBillDetails] = useState([
    { personId: 1, name: 'You', paid: 0, isParticipant: true }
  ]);
  const [splitResult, setSplitResult] = useState(null);

  // Sync master list to bill details when allPeople changes
  useEffect(() => {
    // 1. Update bill details with latest names from allPeople
    const updatedDetails = billDetails.map(detail => {
        const masterPerson = allPeople.find(p => p.id === detail.personId);
        return masterPerson ? { ...detail, name: masterPerson.name } : detail;
    });

    // 2. Ensure all people from master list are represented in bill details (if not already)
    allPeople.forEach(masterPerson => {
        if (!updatedDetails.some(d => d.personId === masterPerson.id)) {
            updatedDetails.push({ 
                personId: masterPerson.id, 
                name: masterPerson.name, 
                paid: 0, 
                isParticipant: true // Default all to participating
            });
        }
    });

    // Filter out people who are no longer in the master list
    const filteredDetails = updatedDetails.filter(detail => 
        allPeople.some(p => p.id === detail.personId)
    );
    
    setBillDetails(filteredDetails);
    localStorage.setItem('splitPeopleMaster', JSON.stringify(allPeople));
  }, [allPeople]);


  const updateBillDetail = (personId, field, val) => {
    setBillDetails(prev => prev.map(p => 
      p.personId === personId 
        ? { ...p, [field]: field === 'paid' ? val : val } // Keep paid as string (text input)
        : p
    ));
    setSplitResult(null); // Reset results on change
  };
  
  const updateMasterPersonName = (id, newName) => {
      setAllPeople(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  }

  const addMasterPerson = () => {
    const newId = Date.now();
    setAllPeople(prev => [...prev, { name: `New Friend`, id: newId }]);
  };

  const removeMasterPerson = (id) => {
      if (allPeople.length <= 1) return;
      setAllPeople(prev => prev.filter(p => p.id !== id));
      setSplitResult(null); 
  };


  const calculateSplit = () => {
    // Convert paid string values to numbers and filter participants
    const participants = billDetails
        .map(p => ({
            ...p,
            paid: parseFloat(p.paid) || 0 // Conversion happens here
        }))
        .filter(p => p.isParticipant);

    const totalPaid = participants.reduce((sum, p) => sum + p.paid, 0);
    
    if (participants.length === 0) {
        setSplitResult({ total: 0, perPerson: 0, owes: [], owed: [], chartData: [] });
        return;
    }

    const perPersonShare = totalPaid / participants.length;
    
    const owes = [];
    const owed = [];
    const chartData = [];

    billDetails.forEach(p => {
        let diff = 0;
        let finalShare = 0;
        
        // Get the numerical paid value (safely parse the string)
        const paidAmount = parseFloat(p.paid) || 0;

        // Only participants have a share
        if (p.isParticipant) {
            finalShare = perPersonShare;
        }

        diff = paidAmount - finalShare;

        if (diff < -0.01) {
            owes.push({ name: p.name, amount: Math.abs(diff) });
            chartData.push({ name: p.name, amount: Math.abs(diff), type: 'owes' });
        } else if (diff > 0.01) {
            owed.push({ name: p.name, amount: diff });
            chartData.push({ name: p.name, amount: diff, type: 'owed' });
        }
    });

    setSplitResult({ 
        total: totalPaid, 
        perPerson: perPersonShare, 
        owes, 
        owed, 
        chartData 
    });
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Input Section */}
      <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-500" /> Customizable Bill Splitter
        </h2>
        <p className="text-slate-500 mb-6 text-sm">Define your group and the expenses for this bill.</p>

        {/* --- Master People List (for naming consistency) --- */}
        <div className="mb-8 border border-slate-200 p-4 rounded-xl bg-slate-50">
            <h3 className="text-base font-bold mb-3 text-slate-600">Your Group Members</h3>
            <div className="space-y-2">
                {allPeople.map((p) => (
                    <div key={p.id} className="flex gap-2 items-center">
                        <input 
                            className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" 
                            placeholder="Name"
                            value={p.name} 
                            onChange={e => updateMasterPersonName(p.id, e.target.value)} 
                        />
                         {p.id !== 1 && ( // Prevent deleting "You"
                            <button onClick={() => removeMasterPerson(p.id)} className="text-slate-400 hover:text-rose-500 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={addMasterPerson} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline mt-4">
                <PlusCircle className="w-4 h-4" /> Add Person to Group
            </button>
        </div>


        {/* --- Current Bill Details --- */}
        <h3 className="text-xl font-bold mb-4 text-slate-800">Current Bill Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-semibold text-slate-600 text-sm mb-3 border-b pb-2">
            <span>Name</span>
            <span className="text-right">Amount Paid (₹)</span>
            <span className="text-center">Include in Split?</span>
        </div>

        <div className="space-y-3 mb-8">
          {billDetails.map((p) => (
            <div key={p.personId} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <span className="font-medium text-slate-800 truncate">{p.name}</span>
              
              {/* Amount Paid - CHANGED TO type="text" */}
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 text-sm">₹</span>
                <input 
                  className="w-full p-3 pl-6 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right" 
                  type="text" // Changed from number to text
                  placeholder="0.00"
                  value={p.paid} 
                  onChange={e => updateBillDetail(p.personId, 'paid', e.target.value)} 
                  // Input value is now a string, parsed in calculateSplit()
                />
              </div>

              {/* Participation Checkbox */}
              <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={p.isParticipant}
                    onChange={e => updateBillDetail(p.personId, 'isParticipant', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
              </div>
            </div>
          ))}
        </div>

        <button onClick={calculateSplit} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
          Calculate Split
        </button>
      </div>

      {/* Result Section (Receipt Style) */}
      <div className="lg:col-span-1 relative">
        {splitResult ? (
           <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-6 text-center uppercase tracking-widest border-b border-dashed border-slate-200 pb-4">Settlement Summary</h3>
            
            <div className="flex justify-between text-slate-600 mb-2">
              <span>Total Bill (Divided)</span>
              <span className="font-bold text-slate-900">{formatMoney(splitResult.total)}</span>
            </div>
            <div className="flex justify-between text-slate-600 mb-6 pb-6 border-b border-dashed border-slate-200">
              <span>Per Participant Share</span>
              <span className="font-bold text-slate-900">{formatMoney(splitResult.perPerson)}</span>
            </div>

            {splitResult.owes.length === 0 && splitResult.owed.length === 0 ? (
              <div className="text-center py-10 bg-green-50 rounded-xl border border-green-100 text-green-700 font-medium">
                All settled up! 🎉
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-md font-bold text-slate-800">Who Pays Whom:</h4>
                {splitResult.owes.map((o, i) => (
                  <div key={i} className="flex items-center justify-between bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-700">{o.name}</span>
                      <span className="text-xs text-rose-400 uppercase">PAYS</span>
                    </div>
                    <span className="font-bold text-rose-700">{formatMoney(o.amount)}</span>
                  </div>
                ))}
                
                <div className="text-center text-sm text-slate-400 font-medium my-2">-- Transfers --</div>

                {splitResult.owed.map((o, i) => (
                  <div key={i} className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700">{o.name}</span>
                      <span className="text-xs text-emerald-400 uppercase">RECEIVES</span>
                    </div>
                    <span className="font-bold text-emerald-700">{formatMoney(o.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Settlement Bar Chart */}
            <SettlementChart settlementData={splitResult.chartData} />

            <div className="mt-8 text-center text-xs text-slate-400">Custom Split Calculated</div>
           </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p>Enter details and click 'Calculate Split'</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillSplitter;