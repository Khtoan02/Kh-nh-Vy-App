
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ruler, Weight, Utensils, User, TrendingUp, Plus, Sparkles, ChefHat, Activity, Save, Settings, Trash2, X, Calendar, Clock, ChevronRight, Heart } from 'lucide-react';
import { ChildProfile, GrowthRecord, MealRecord, Gender, MealSuggestion } from './types';
import { WHO_STANDARDS, MEAL_TYPES } from './constants';
import { getMealSuggestions, analyzeGrowthWithAI } from './services/geminiService';

const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up md:animate-zoom-in relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2">
            <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
            {title}
        </h3>
        {children}
    </div>
  </div>
);

const App = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'growth' | 'food'>('home');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAddGrowth, setShowAddGrowth] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const savedProfile = localStorage.getItem('child_profile');
    const savedGrowth = localStorage.getItem('growth_records');
    const savedMeals = localStorage.getItem('meal_records');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedGrowth) setGrowthRecords(JSON.parse(savedGrowth));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
  }, []);

  // AI Analysis Sync
  useEffect(() => {
    if (profile && growthRecords.length > 0) {
      const analyze = async () => {
        const result = await analyzeGrowthWithAI(profile, growthRecords);
        setAiAnalysis(result);
      }
      analyze();
    }
  }, [growthRecords, profile]);

  const fetchSuggestions = useCallback(async () => {
    if (!profile) return;
    setLoadingSuggestions(true);
    const result = await getMealSuggestions(profile, growthRecords[growthRecords.length - 1], meals.slice(-5));
    setSuggestions(result);
    setLoadingSuggestions(false);
  }, [profile, growthRecords, meals]);

  useEffect(() => {
    if (profile && suggestions.length === 0) fetchSuggestions();
  }, [profile, fetchSuggestions]);

  // Persist Data
  useEffect(() => {
    if (profile) localStorage.setItem('child_profile', JSON.stringify(profile));
    localStorage.setItem('growth_records', JSON.stringify(growthRecords));
    localStorage.setItem('meal_records', JSON.stringify(meals));
  }, [profile, growthRecords, meals]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] p-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl max-w-md w-full border-4 border-white">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Heart className="text-primary fill-current" size={48} />
            </div>
            <h1 className="text-3xl font-black text-gray-800">Chào Mẹ & Bé!</h1>
            <p className="text-gray-500 mt-2">Hãy bắt đầu hành trình theo dõi bé yêu cùng Khánh Vy App nhé.</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            setProfile({
              id: Date.now().toString(),
              name: formData.get('name') as string,
              birthDate: formData.get('birthDate') as string,
              gender: formData.get('gender') as Gender,
            });
          }} className="space-y-4">
            <input name="name" placeholder="Tên của bé" required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20" />
            <input name="birthDate" type="date" required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:text-blue-600 transition-all">
                <input type="radio" name="gender" value={Gender.MALE} defaultChecked className="hidden" />
                <span className="font-bold">Bé Trai</span>
              </label>
              <label className="flex items-center gap-2 p-4 bg-gray-50 rounded-2xl cursor-pointer has-[:checked]:bg-pink-50 has-[:checked]:text-pink-600 transition-all">
                <input type="radio" name="gender" value={Gender.FEMALE} className="hidden" />
                <span className="font-bold">Bé Gái</span>
              </label>
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-rose-400 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
              Bắt Đầu Ngay
            </button>
          </form>
        </div>
      </div>
    );
  }

  const latestGrowth = growthRecords[growthRecords.length - 1];

  return (
    <div className="min-h-screen bg-[#FDFCFD] text-gray-800 pb-24 md:pb-8 font-sans">
      <div className="max-w-xl mx-auto md:pt-10">
        
        {/* Top Header */}
        <header className="px-6 py-4 flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center text-3xl shadow-sm overflow-hidden">
              {profile.gender === Gender.MALE ? '👶' : '👧'}
            </div>
            <div>
              <h1 className="font-black text-xl text-gray-800">Bé {profile.name}</h1>
              <p className="text-primary text-xs font-bold uppercase tracking-widest">Gia đình là tất cả</p>
            </div>
          </div>
          <button onClick={() => setShowProfile(true)} className="p-3 bg-white shadow-sm rounded-2xl text-gray-400 hover:text-primary transition-all">
            <Settings size={20} />
          </button>
        </header>

        <main className="px-6 space-y-6">
          
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500 p-5 rounded-[32px] text-white shadow-lg shadow-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <Weight size={24} className="opacity-80" />
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-tighter">Cân nặng</span>
                  </div>
                  <div className="text-3xl font-black">{latestGrowth?.weight || '--'}<span className="text-sm ml-1 opacity-70">kg</span></div>
                  <p className="text-[10px] mt-2 opacity-70">Cập nhật: {latestGrowth ? new Date(latestGrowth.date).toLocaleDateString('vi') : 'Chưa có'}</p>
                </div>
                <div className="bg-teal-500 p-5 rounded-[32px] text-white shadow-lg shadow-teal-200">
                  <div className="flex justify-between items-start mb-4">
                    <Ruler size={24} className="opacity-80" />
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full uppercase tracking-tighter">Chiều cao</span>
                  </div>
                  <div className="text-3xl font-black">{latestGrowth?.height || '--'}<span className="text-sm ml-1 opacity-70">cm</span></div>
                  <p className="text-[10px] mt-2 opacity-70">Cập nhật: {latestGrowth ? new Date(latestGrowth.date).toLocaleDateString('vi') : 'Chưa có'}</p>
                </div>
              </div>

              {/* AI Insight Section */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Sparkles size={80} className="text-primary" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-black text-gray-800">Lời Khuyên Từ Chuyên Gia</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-2xl italic">
                  "{aiAnalysis}"
                </p>
              </div>

              {/* Next Meal Suggestion Preview */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h3 className="font-black text-lg">Món ngon cho bé</h3>
                  <button onClick={() => setActiveTab('food')} className="text-primary text-xs font-bold flex items-center gap-1">Xem tất cả <ChevronRight size={14} /></button>
                </div>
                {suggestions.slice(0, 1).map((s, i) => (
                  <div key={i} className="bg-white p-5 rounded-[32px] border border-gray-50 shadow-sm flex items-center gap-4">
                    <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl">🍲</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-orange-500 uppercase">{s.suggestedFor}</span>
                      <h4 className="font-bold text-gray-800">{s.dishName}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" /> Hành Trình Phát Triển
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthRecords}>
                      <defs>
                        <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString('vi')}
                      />
                      <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorW)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-4">
                  <button onClick={() => setShowAddGrowth(true)} className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all">
                    <Plus size={18} /> Ghi chỉ số mới
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 font-bold text-gray-800">Lịch sử ghi nhận</div>
                <div className="divide-y divide-gray-50">
                  {growthRecords.slice().reverse().map(r => (
                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center text-gray-500">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{new Date(r.date).toLocaleDateString('vi')}</p>
                          <p className="text-[10px] text-gray-400">Đã lưu thành công</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">{r.weight}kg / {r.height}cm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'food' && (
            <div className="space-y-6 animate-fade-in">
              {/* AI Suggestions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <ChefHat className="text-orange-500" /> Thực đơn mẹ nấu
                  </h3>
                  <button onClick={fetchSuggestions} disabled={loadingSuggestions} className="text-xs font-bold text-primary flex items-center gap-1 disabled:opacity-50">
                    {loadingSuggestions ? 'Đang nghĩ...' : <><Sparkles size={14} /> Làm mới</>}
                  </button>
                </div>
                <div className="grid gap-4">
                  {suggestions.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{s.suggestedFor}</span>
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300"><Heart size={16} /></div>
                      </div>
                      <h4 className="text-lg font-black text-gray-800 mb-2">{s.dishName}</h4>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {s.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-gray-50 text-gray-500 text-[10px] px-2 py-1 rounded-md font-medium">{ing}</span>
                        ))}
                      </div>
                      <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100/50">
                        <h5 className="text-[10px] font-black text-yellow-700 uppercase mb-2 flex items-center gap-1"><Activity size={12} /> Cách nấu nhanh</h5>
                        <p className="text-xs text-yellow-800/80 leading-relaxed italic">"{s.instructions}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal Diary Log */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-lg">Nhật ký món ăn</h3>
                   <button onClick={() => setShowAddMeal(true)} className="p-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-100"><Plus size={20} /></button>
                </div>
                <div className="space-y-4">
                  {meals.length === 0 ? (
                    <div className="text-center py-10 text-gray-300">
                      <Utensils size={40} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Chưa có món nào được ghi lại</p>
                    </div>
                  ) : (
                    meals.slice().reverse().map(m => (
                      <div key={m.id} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                          <div className="w-1.5 h-full bg-gray-100 group-last:h-4 rounded-full"></div>
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex justify-between items-start">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(m.date).toLocaleDateString('vi')} - {MEAL_TYPES.find(t=>t.id===m.mealType)?.label}</span>
                             <button onClick={() => setMeals(meals.filter(meal => meal.id !== m.id))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                          <p className="font-bold text-gray-700 mt-1">{m.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-3 flex justify-around items-center z-40">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-primary scale-110' : 'text-gray-300'}`}>
            <Heart size={24} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase">Home</span>
          </button>
          <button onClick={() => setActiveTab('growth')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'growth' ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
            <TrendingUp size={24} />
            <span className="text-[10px] font-black uppercase">Bé Lớn</span>
          </button>
          <button onClick={() => setActiveTab('food')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'food' ? 'text-orange-500 scale-110' : 'text-gray-300'}`}>
            <ChefHat size={24} />
            <span className="text-[10px] font-black uppercase">Bé Ăn</span>
          </button>
        </nav>

        {/* Modals */}
        {showAddGrowth && (
          <Modal title="Cập nhật thể chất" onClose={() => setShowAddGrowth(false)}>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setGrowthRecords([...growthRecords, {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                weight: parseFloat(formData.get('weight') as string),
                height: parseFloat(formData.get('height') as string)
              }]);
              setShowAddGrowth(false);
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Cân nặng (kg)</label>
                  <input name="weight" type="number" step="0.1" required autoFocus className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-200 text-lg font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase">Chiều cao (cm)</label>
                  <input name="height" type="number" step="0.1" required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-teal-200 text-lg font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100">Lưu Chỉ Số</button>
            </form>
          </Modal>
        )}

        {showAddMeal && (
          <Modal title="Nhật ký ăn uống" onClose={() => setShowAddMeal(false)}>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              setMeals([...meals, {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                mealType: formData.get('type') as any,
                description: formData.get('desc') as string
              }]);
              setShowAddMeal(false);
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase">Bữa ăn</label>
                <select name="type" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none appearance-none font-bold">
                  {MEAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase">Hôm nay bé ăn gì?</label>
                <textarea name="desc" required placeholder="Ví dụ: Cháo yến mạch bí đỏ..." className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-200 h-32 resize-none font-medium"></textarea>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-100">Ghi Lại Món</button>
            </form>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default App;
