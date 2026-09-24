import React, { useState } from 'react';
import { Utensils, Sparkles, ChefHat, Clock, TrendingDown, Calendar, PlusCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface FoodPrepWidgetProps {
  onLogSuccess?: () => void;
}

export const FoodPrepWidget: React.FC<FoodPrepWidgetProps> = ({ onLogSuccess }) => {
  const [activeTab, setActiveTab] = useState<'estimator' | 'logger'>('estimator');

  // Estimator Form State
  const [cafeteria, setCafeteria] = useState('Main Campus Dining Hall');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [headcount, setHeadcount] = useState(850);
  const [historicalWaste, setHistoricalWaste] = useState(45);
  const [weather, setWeather] = useState('Partly Cloudy, 22°C (Pleasant)');
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Daily Post-Meal Logger State
  const [logCafeteria, setLogCafeteria] = useState('Main Campus Dining Hall');
  const [logMealType, setLogMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [prepWeight, setPrepWeight] = useState(420);
  const [wasteWeight, setWasteWeight] = useState(48);
  const [actualHeadcount, setActualHeadcount] = useState(820);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logFeedback, setLogFeedback] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setAiResult(null);

    try {
      const data = await api.predictFoodPrep({
        cafeteria_name: cafeteria,
        meal_type: mealType,
        target_date: new Date().toISOString().split('T')[0],
        expected_headcount: Number(headcount),
        historical_avg_waste_kg: Number(historicalWaste),
        weather_forecast: weather,
      });
      setAiResult(data.prediction);
    } catch (err: any) {
      console.error('Failed to generate food prep plan:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);
    setLogFeedback(null);

    try {
      await api.logFoodWaste({
        cafeteria_name: logCafeteria,
        meal_type: logMealType,
        prepared_weight_kg: Number(prepWeight),
        waste_weight_kg: Number(wasteWeight),
        headcount: Number(actualHeadcount),
      });
      setLogFeedback('Food waste log saved successfully and indexed to database!');
      if (onLogSuccess) onLogSuccess();
    } catch (err: any) {
      setLogFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      {/* Header and Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cafeteria Food Waste Intelligence</h3>
            <p className="text-xs text-slate-400">
              AI-driven portion scheduling, headcount correlation, and post-service waste auditing
            </p>
          </div>
        </div>

        <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'estimator'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Prep Estimator
          </button>
          <button
            onClick={() => setActiveTab('logger')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'logger'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Post-Meal Waste Logger
          </button>
        </div>
      </div>

      {activeTab === 'estimator' ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form (5 cols) */}
          <form onSubmit={handlePredict} className="lg:col-span-5 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Cafeteria Facility</label>
              <select
                value={cafeteria}
                onChange={(e) => setCafeteria(e.target.value)}
                className="w-full rounded-xl glass-input p-2.5 text-xs"
              >
                <option value="Main Campus Dining Hall">Main Campus Dining Hall</option>
                <option value="Science Tower Cafe">Science Tower Cafe</option>
                <option value="Engineering Bistro">Engineering Bistro</option>
                <option value="Athletics Training Kitchen">Athletics Training Kitchen</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Meal Service</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full rounded-xl glass-input p-2.5 text-xs"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Expected Headcount</label>
                <input
                  type="number"
                  min="20"
                  max="5000"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full rounded-xl glass-input p-2.5 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Historical Avg Waste (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={historicalWaste}
                  onChange={(e) => setHistoricalWaste(Number(e.target.value))}
                  className="w-full rounded-xl glass-input p-2.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Weather Forecast</label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full rounded-xl glass-input p-2.5 text-xs"
                  placeholder="e.g. Rainy 18°C"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPredicting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-glow-amber transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isPredicting ? 'Consulting Gemini 2.5...' : 'Generate AI Prep Plan'}
            </button>
          </form>

          {/* AI Output Result Box (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 flex flex-col justify-between">
            {aiResult ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Metric Summary row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Target Prep Weight</span>
                    <p className="text-xl font-black text-white mt-1">{aiResult.recommended_prep_kg} <span className="text-xs font-normal text-slate-400">kg</span></p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Waste Reduction Target</span>
                    <p className="text-xl font-black text-emerald-300 mt-1">-{aiResult.waste_reduction_target_pct}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Projected Leftovers</span>
                    <p className="text-xl font-black text-white mt-1">{aiResult.expected_waste_kg} <span className="text-xs font-normal text-slate-400">kg</span></p>
                  </div>
                </div>

                {/* Staggered Batch Schedule */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Staggered Batch Production Schedule
                  </h4>
                  <div className="space-y-2">
                    {aiResult.batch_preparation_schedule?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-400 font-bold text-[10px]">
                            {item.prep_portion_pct}%
                          </span>
                          <span className="font-semibold text-slate-200">{item.batch_time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 text-right truncate max-w-[260px]">{item.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Menu Batch Adjustments */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                    <ChefHat className="h-3.5 w-3.5 text-emerald-400" />
                    Actionable Kitchen Directives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {aiResult.menu_adjustments?.map((adj: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{adj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <ChefHat className="h-10 w-10 text-slate-700 animate-pulse" />
                <p className="text-xs font-medium text-slate-400 max-w-sm">
                  Configure headcount and weather variables on the left, then click "Generate AI Prep Plan" to synthesize Gemini batching models.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Daily Post-Meal Waste Logger */
        <form onSubmit={handleLogSubmit} className="mt-6 max-w-2xl space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Cafeteria Name</label>
              <select
                value={logCafeteria}
                onChange={(e) => setLogCafeteria(e.target.value)}
                className="w-full rounded-xl glass-input p-2.5 text-xs"
              >
                <option value="Main Campus Dining Hall">Main Campus Dining Hall</option>
                <option value="Science Tower Cafe">Science Tower Cafe</option>
                <option value="Engineering Bistro">Engineering Bistro</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Meal Service</label>
              <select
                value={logMealType}
                onChange={(e) => setLogMealType(e.target.value as any)}
                className="w-full rounded-xl glass-input p-2.5 text-xs"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Total Prepared (kg)</label>
              <input
                type="number"
                step="0.1"
                value={prepWeight}
                onChange={(e) => setPrepWeight(Number(e.target.value))}
                className="w-full rounded-xl glass-input p-2.5 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Scraped / Waste Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={wasteWeight}
                onChange={(e) => setWasteWeight(Number(e.target.value))}
                className="w-full rounded-xl glass-input p-2.5 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Actual Headcount Served</label>
              <input
                type="number"
                value={actualHeadcount}
                onChange={(e) => setActualHeadcount(Number(e.target.value))}
                className="w-full rounded-xl glass-input p-2.5 text-xs"
                required
              />
            </div>
          </div>

          {logFeedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              logFeedback.startsWith('Error')
                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
            }`}>
              <CheckCircle2 className="h-4 w-4" />
              <span>{logFeedback}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingLog}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-glow-emerald transition-all flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {isSubmittingLog ? 'Saving Log...' : 'Submit Food Waste Log'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
