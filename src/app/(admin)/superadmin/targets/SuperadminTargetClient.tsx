"use client";

import { useRouter } from "next/navigation";
import { Target, Calendar, User, TrendingUp } from "lucide-react";

export default function SuperadminTargetClient({ initialMonth, admins }: { initialMonth: string, admins: any[] }) {
  const router = useRouter();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    router.push(`/superadmin/targets?month=${newMonth}`);
  };

  // Calculate team totals
  let totalTarget = 0;
  let totalAchieved = 0;

  admins.forEach(admin => {
    const t = admin.monthlyTargets?.[0];
    if (t) {
      totalTarget += t.targetAmount;
      totalAchieved += t.achievedAmount;
    }
  });

  const teamPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalAchieved / totalTarget) * 100)) : 0;
  
  let teamProgressColor = "bg-red-500";
  if (teamPercentage >= 100) teamProgressColor = "bg-emerald-500";
  else if (teamPercentage >= 75) teamProgressColor = "bg-green-500";
  else if (teamPercentage >= 40) teamProgressColor = "bg-amber-500";

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Target className="text-indigo-600" />
            Team Targets Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">Monitor all salespeople's monthly goals and achievements</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Calendar size={18} className="text-gray-400" />
          <input 
            type="month" 
            value={initialMonth} 
            onChange={handleMonthChange}
            className="text-sm font-bold text-gray-700 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Team Summary Card */}
      <div className="card p-6 md:p-8 mb-8 overflow-hidden relative bg-gradient-to-br from-indigo-900 to-indigo-700 text-white border-0">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
          <TrendingUp size={120} />
        </div>
        
        <h2 className="text-lg font-bold text-white/90 mb-6">Team Total for {initialMonth}</h2>
        
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">Achieved</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">₹{totalAchieved.toLocaleString()}</span>
              <span className="text-indigo-300 font-bold">/ ₹{totalTarget.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`text-2xl font-black ${teamPercentage >= 100 ? 'text-emerald-400' : 'text-white'}`}>
              {teamPercentage}%
            </span>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1">Completed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-indigo-950/50 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full ${teamProgressColor} transition-all duration-1000 ease-out`}
            style={{ width: `${teamPercentage}%` }}
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Salesperson</th>
                <th className="px-6 py-4 text-right">Target (₹)</th>
                <th className="px-6 py-4 text-right">Achieved (₹)</th>
                <th className="px-6 py-4 text-right">Pending (₹)</th>
                <th className="px-6 py-4">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No admins found.</td>
                </tr>
              ) : (
                admins.map(admin => {
                  const t = admin.monthlyTargets?.[0];
                  const tAmt = t?.targetAmount || 0;
                  const aAmt = t?.achievedAmount || 0;
                  const pct = tAmt > 0 ? Math.min(100, Math.round((aAmt / tAmt) * 100)) : 0;
                  const pending = Math.max(0, tAmt - aAmt);
                  
                  let pColor = "bg-red-500";
                  if (pct >= 100) pColor = "bg-emerald-500";
                  else if (pct >= 75) pColor = "bg-green-500";
                  else if (pct >= 40) pColor = "bg-amber-500";

                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <User size={14} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {tAmt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {aAmt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-500">
                        {pending > 0 ? pending.toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center gap-3">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${pColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-9 text-right ${pct >= 100 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
