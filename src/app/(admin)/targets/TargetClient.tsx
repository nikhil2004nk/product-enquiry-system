"use client";

import { useState } from "react";
import { getMonthlyTarget, updateTargetAmount, addTargetEntry, editTargetEntry, deleteTargetEntry } from "./actions";
import { Target, TrendingUp, TrendingDown, Minus, Calendar, Loader2, CheckCircle2, ListPlus, Pencil, Trash2, X, Check, Settings2, Plus } from "lucide-react";
import { CustomDateTimePicker } from "@/components/ui/CustomDateTimePicker";
import { CustomMonthPicker } from "@/components/ui/CustomMonthPicker";
import { CustomSelect } from "@/components/ui/CustomSelect";

export default function TargetClient({ initialMonth, initialTarget, historicalTargets = [] }: { initialMonth: string, initialTarget: any, historicalTargets?: any[] }) {
  const [month, setMonth] = useState(initialMonth);
  const [target, setTarget] = useState(initialTarget);
  const [loading, setLoading] = useState(false);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);
  
  const [targetInput, setTargetInput] = useState(initialTarget?.targetAmount?.toString() || "");
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [chartRange, setChartRange] = useState<number>(6);
  
  // Toggles for forms
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Entry State
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [addDateObj, setAddDateObj] = useState<Date | undefined>(new Date());

  // Edit Entry State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDateObj, setEditDateObj] = useState<Date | undefined>(undefined);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const reloadTarget = async (m: string) => {
    const newTarget = await getMonthlyTarget(m);
    setTarget(newTarget);
    return newTarget;
  };

  const handleMonthChangeSelection = async (newMonth: string) => {
    setMonth(newMonth);
    setLoading(true);
    const newTarget = await reloadTarget(newMonth);
    setTargetInput(newTarget?.targetAmount?.toString() || "");
    setLoading(false);
    setShowTargetForm(false);
    setShowAddForm(false);
  };

  const handleUpdateTarget = async () => {
    if (!targetInput) return;
    setIsUpdatingTarget(true);
    await updateTargetAmount(month, parseFloat(targetInput));
    await reloadTarget(month);
    setIsUpdatingTarget(false);
    setShowTargetForm(false);
  };

  const handleAddEntry = async () => {
    if (!addAmount || !addDateObj) return;
    setIsAddingEntry(true);
    const dateStr = addDateObj.toISOString();
    await addTargetEntry(month, parseFloat(addAmount), dateStr);
    setAddAmount("");
    setAddDateObj(new Date());
    await reloadTarget(month);
    setIsAddingEntry(false);
    setShowAddForm(false);
  };

  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditAmount(entry.amount.toString());
    setEditDateObj(new Date(entry.date));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
    setEditDateObj(undefined);
  };

  const saveEdit = async (id: string) => {
    if (!editAmount || !editDateObj) return;
    setIsSavingEdit(true);
    await editTargetEntry(id, parseFloat(editAmount), editDateObj.toISOString());
    await reloadTarget(month);
    setEditingId(null);
    setIsSavingEdit(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this installment?")) return;
    setIsDeletingId(id);
    await deleteTargetEntry(id);
    await reloadTarget(month);
    setIsDeletingId(null);
  };

  const targetAmount = target?.targetAmount || 0;
  const achievedAmount = target?.achievedAmount || 0;
  const percentage = targetAmount > 0 ? Math.min(100, Math.round((achievedAmount / targetAmount) * 100)) : 0;
  
  let progressColor = "bg-red-500";
  if (percentage >= 100) progressColor = "bg-emerald-500";
  else if (percentage >= 75) progressColor = "bg-green-500";
  else if (percentage >= 40) progressColor = "bg-amber-500";

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Target className="text-indigo-600" />
            My Sales Targets
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track your monthly performance and sales installments</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-1 py-1 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
          <CustomMonthPicker 
            value={month} 
            onChange={handleMonthChangeSelection}
          />
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6 border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('current')} 
          className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'current' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Current Target
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          History & Comparison
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-indigo-500">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="font-bold">Loading Data...</p>
        </div>
      ) : activeTab === 'current' ? (
        <div className="grid grid-cols-1 gap-6">
          
          {/* Progress Card */}
          <div className="card p-6 md:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <TrendingUp size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold text-gray-900">Monthly Progress</h2>
              <button 
                onClick={() => setShowTargetForm(!showTargetForm)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Settings2 size={14} />
                {showTargetForm ? "Cancel" : "Edit Goal"}
              </button>
            </div>
            
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Achieved</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">₹{achievedAmount.toLocaleString()}</span>
                  <span className="text-gray-400 font-bold">/ ₹{targetAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`text-2xl font-black ${percentage >= 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>
                  {percentage}%
                </span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Completed</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              {percentage >= 100 ? (
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex">
                  <CheckCircle2 size={16} /> Target Reached! Amazing job.
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-500">
                  <span className="text-gray-900 font-bold">₹{Math.max(0, targetAmount - achievedAmount).toLocaleString()}</span> left to hit your goal.
                </p>
              )}
            </div>
          </div>

          {/* Edit Target Form (Expandable) */}
          {showTargetForm && (
            <div className="card p-6 h-fit bg-indigo-50/50 border-indigo-100 animate-fade-up">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Target size={16} className="text-indigo-600" />
                Set Target Amount for {month}
              </h3>
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Goal Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      className="input pl-8 w-full"
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpdateTarget} 
                  disabled={isUpdatingTarget}
                  className="btn btn-primary w-full sm:w-auto px-8"
                >
                  {isUpdatingTarget ? "Saving..." : "Save Goal"}
                </button>
              </div>
            </div>
          )}

          {/* Installments Card */}
          <div className="card p-0 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ListPlus size={16} className="text-emerald-600" />
                </div>
                Sales Installments
              </h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors"
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                {showAddForm ? "Cancel" : "Add Sale"}
              </button>
            </div>

            {/* Add Installment Form (Expandable) */}
            {showAddForm && (
              <div className="p-4 md:p-6 border-b border-gray-100 bg-emerald-50/30 animate-fade-up">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Date</label>
                    <CustomDateTimePicker 
                      value={addDateObj} 
                      onChange={setAddDateObj}
                      placeholder="Select Date"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="input pl-8 w-full bg-white"
                        placeholder="e.g. 20000"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleAddEntry} 
                    disabled={isAddingEntry || !addAmount || !addDateObj}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto px-6 h-10"
                  >
                    {isAddingEntry ? "Adding..." : "Add to Target"}
                  </button>
                </div>
              </div>
            )}

            {/* List of Entries */}
            <div className="p-0 overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
                <thead className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(!target?.entries || target.entries.length === 0) ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                        <p className="font-semibold text-gray-500">No sales recorded yet.</p>
                        <p className="text-sm mt-1">Click "Add Sale" to log your first installment.</p>
                      </td>
                    </tr>
                  ) : (
                    target.entries.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 min-w-[220px]">
                          {editingId === entry.id ? (
                            <CustomDateTimePicker 
                              value={editDateObj} 
                              onChange={setEditDateObj}
                              placeholder="Edit Date"
                            />
                          ) : (
                            <span className="text-gray-900 font-medium">
                              {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(entry.date))}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {editingId === entry.id ? (
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                              <input 
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="input px-2 pl-6 py-1 h-8 text-xs w-28"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-900 font-bold">₹{entry.amount.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {editingId === entry.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => saveEdit(entry.id)}
                                disabled={isSavingEdit}
                                className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={cancelEdit}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => startEdit(entry)}
                                className="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => handleDelete(entry.id)}
                                disabled={isDeletingId === entry.id}
                                className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                {isDeletingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Historical Performance */
        <div className="animate-fade-up">
          {historicalTargets.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <p className="font-bold">No historical data found.</p>
              <p className="text-sm mt-1">Previous targets will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header and Filter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="font-bold text-gray-900 text-xl">Performance Trend</h3>
                <div className="w-full sm:w-48 z-20">
                  <CustomSelect 
                    value={chartRange} 
                    onChange={(val) => setChartRange(Number(val))}
                    options={[
                      { label: "Current Month", value: 1 },
                      { label: "Last 3 Months", value: 3 },
                      { label: "Last 6 Months", value: 6 },
                      { label: "Last 1 Year", value: 12 },
                      { label: "All Time", value: 999 }
                    ]}
                  />
                </div>
              </div>

              {/* Stats Bar */}
              {(() => {
                const displayHistorical = historicalTargets.slice(0, chartRange);
                if (displayHistorical.length >= 3) {
                  let bestMonth = displayHistorical[0];
                  let bestPct = 0;
                  displayHistorical.forEach(h => {
                    const pct = h.targetAmount > 0 ? (h.achievedAmount / h.targetAmount) * 100 : 0;
                    if (pct > bestPct) { bestPct = pct; bestMonth = h; }
                  });
                  return (
                    <div className="card p-5 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between border border-indigo-100">
                       <div>
                         <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Best Performing Month</p>
                         <p className="text-xl font-black text-indigo-900 mt-1">
                           {new Date(bestMonth.month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                         </p>
                       </div>
                       <div className="text-right">
                         <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-4 py-1.5 rounded-full shadow-sm">
                           {Math.round(bestPct)}% Achieved
                         </span>
                       </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Bar Chart */}
              <div className="card p-4 sm:p-6 w-full">
                <div className="w-full overflow-x-auto pb-6 pt-4">
                  <div className="flex items-end h-56 gap-3 sm:gap-6 min-w-[500px] md:min-w-0 w-full px-2">
                    {(() => {
                    const displayHist = historicalTargets.slice(0, chartRange).reverse();
                    const maxVal = Math.max(1, ...displayHist.map(h => Math.max(h.targetAmount, h.achievedAmount)));

                    return displayHist.map((hist, i) => {
                      const targetPct = maxVal > 0 ? (hist.targetAmount / maxVal) * 85 : 0;
                      const achievedPct = maxVal > 0 ? (hist.achievedAmount / maxVal) * 85 : 0;
                      
                      // Ensure small values don't completely disappear (minimum 2% height) if they are > 0
                      const displayTargetPct = hist.targetAmount > 0 ? Math.max(2, targetPct) : 0;
                      const displayAchievedPct = hist.achievedAmount > 0 ? Math.max(2, achievedPct) : 0;
                      
                      const dateObj = new Date(hist.month + "-01");
                      const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });
                      
                      const formatCompact = (num: number) => new Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(num);

                      const trueIdx = historicalTargets.findIndex(h => h.id === hist.id);
                      const prevMonth = trueIdx !== -1 && trueIdx + 1 < historicalTargets.length ? historicalTargets[trueIdx + 1] : null;
                      
                      const getGrowth = (current: number, prev: number | undefined) => {
                         if (prev === undefined || prev === 0) return current > 0 ? "+100%" : "0%";
                         const pct = ((current - prev) / prev) * 100;
                         if (pct > 0) return `+${pct > 999 ? '>999' : pct.toFixed(1)}%`;
                         return `${pct.toFixed(1)}%`;
                      };

                      const targetGrowth = getGrowth(hist.targetAmount, prevMonth?.targetAmount);
                      const achievedGrowth = getGrowth(hist.achievedAmount, prevMonth?.achievedAmount);

                      return (
                        <div key={`chart-${hist.id}`} tabIndex={0} className="flex flex-col items-center flex-1 h-full group relative cursor-pointer pt-6 outline-none">
                          {/* Tooltip */}
                          <div className="absolute top-12 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                            <span className="text-gray-300 font-normal">Target:</span> ₹{hist.targetAmount.toLocaleString()} <span className={targetGrowth.startsWith('+') ? 'text-emerald-400' : targetGrowth === '0%' ? 'text-gray-400' : 'text-red-400'}>({targetGrowth})</span><br/>
                            <span className="text-gray-300 font-normal">Achieved:</span> ₹{hist.achievedAmount.toLocaleString()} <span className={achievedGrowth.startsWith('+') ? 'text-emerald-400' : achievedGrowth === '0%' ? 'text-gray-400' : 'text-red-400'}>({achievedGrowth})</span>
                          </div>

                        <div className="relative w-full flex justify-center h-full items-end gap-0.5 sm:gap-1">
                          
                          {/* Target Bar with Value on Top */}
                          <div className="w-1/2 max-w-[20px] h-full flex flex-col justify-end items-center">
                            <span className="text-[9px] font-bold text-amber-500 mb-1 leading-none">{formatCompact(hist.targetAmount)}</span>
                            <div 
                              className="w-full bg-amber-400 rounded-t-sm relative group-hover:bg-amber-500 transition-colors shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                              style={{ height: `${displayTargetPct}%` }}
                            />
                          </div>
                          
                          {/* Achieved Bar with Value on Top */}
                          <div className="w-1/2 max-w-[20px] h-full flex flex-col justify-end items-center">
                            <span className="text-[9px] font-bold text-indigo-500 mb-1 leading-none">{formatCompact(hist.achievedAmount)}</span>
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm relative opacity-90 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                              style={{ height: `${displayAchievedPct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 mt-2 truncate max-w-full uppercase tracking-wider">{monthName}</span>
                        {displayHist.length < 3 && (
                          <span className={`text-[9px] font-bold mt-0.5 ${(hist.targetAmount > 0 ? (hist.achievedAmount / hist.targetAmount) * 100 : 0) >= 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>
                            {Math.round(hist.targetAmount > 0 ? (hist.achievedAmount / hist.targetAmount) * 100 : 0)}%
                          </span>
                        )}
                      </div>
                    );
                  });
                  })()}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-sm"></div>
                    <span className="text-xs font-bold text-gray-500">Target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                    <span className="text-xs font-bold text-gray-500">Achieved</span>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {historicalTargets.slice(0, chartRange).map((hist, idx) => {
                  const hPct = hist.targetAmount > 0 ? Math.min(100, Math.round((hist.achievedAmount / hist.targetAmount) * 100)) : 0;
                  let hColor = "text-red-500 bg-red-50 border-red-100";
                  let hBar = "bg-red-500";
                  if (hPct >= 100) { hColor = "text-emerald-600 bg-emerald-50 border-emerald-100"; hBar = "bg-emerald-500"; }
                  else if (hPct >= 75) { hColor = "text-green-600 bg-green-50 border-green-100"; hBar = "bg-green-500"; }
                  else if (hPct >= 40) { hColor = "text-amber-600 bg-amber-50 border-amber-100"; hBar = "bg-amber-500"; }
                  
                  const dateObj = new Date(hist.month + "-01");
                  const monthName = dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });

                  // Growth Calculation
                  const prevMonth = historicalTargets[idx + 1];
                  let growthBadge = null;
                  if (prevMonth) {
                    let growthPct = 0;
                    if (prevMonth.achievedAmount === 0 && hist.achievedAmount > 0) {
                      growthPct = 100;
                    } else if (prevMonth.achievedAmount > 0) {
                      growthPct = ((hist.achievedAmount - prevMonth.achievedAmount) / prevMonth.achievedAmount) * 100;
                    }

                    if (growthPct > 0) {
                      const displayPct = growthPct > 999 ? ">999" : growthPct.toFixed(1);
                      growthBadge = <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md"><TrendingUp size={10} /> +{displayPct}%</span>;
                    } else if (growthPct < 0) {
                      growthBadge = <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md"><TrendingDown size={10} /> {growthPct.toFixed(1)}%</span>;
                    } else {
                      growthBadge = <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md"><Minus size={10} /> 0%</span>;
                    }
                  }

                  return (
                    <div key={hist.id} className={`p-4 rounded-xl border ${hColor} transition-transform hover:-translate-y-1 hover:shadow-md relative`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">{monthName}</p>
                        {growthBadge}
                      </div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-lg font-black">₹{hist.achievedAmount.toLocaleString()}</span>
                        <span className="text-xs font-bold opacity-60">/ ₹{hist.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full ${hBar}`} style={{ width: `${hPct}%` }} />
                      </div>
                      <p className="text-right text-[10px] font-bold mt-1 opacity-80">{hPct}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
