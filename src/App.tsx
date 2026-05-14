/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ImageUpload } from './components/ImageUpload';
import { ScanDashboard } from './components/ScanDashboard';
import { HistoryPage } from './components/HistoryPage';
import { SettingsPage } from './components/SettingsPage';
import { DashboardHome } from './components/DashboardHome';
import { ProjectDetail } from './components/ProjectDetail';
import { AnalyticsPage } from './components/AnalyticsPage';
import { BottomNav } from './components/BottomNav';
import { ProductAnalysis, ScanResult, Project, UserStats } from './types';
import { analyzeProduct } from './services/geminiService';
import { cn } from './lib/utils';
import { Search, Globe, Users, TrendingUp, Sparkles, Loader2, X, Trash2, MapPin, CircleDollarSign } from 'lucide-react';
import { LocationProvider, useLocation } from './lib/LocationContext';
import { UserLocation } from './types';

type View = 'landing' | 'upload' | 'dashboard' | 'history' | 'settings' | 'home' | 'project-detail' | 'analytics';

type LoadingStage = 
  | 'identifying' 
  | 'searching' 
  | 'analyzing_reviews' 
  | 'calculating' 
  | 'finishing';

const LOADING_STAGE_TEXT: Record<LoadingStage, string> = {
  identifying: "Identifying product details...",
  searching: "Searching up online for market data...",
  analyzing_reviews: "Analyzing buyer sentiment and reviews...",
  calculating: "Calculating optimal resale price...",
  finishing: "Writing optimized listing description..."
};

export default function App() {
  return (
    <LocationProvider>
      <AppContent />
    </LocationProvider>
  );
}

function AppContent() {
  const [view, setView] = useState<View>('landing');
  const [history, setHistory] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem('sellscan_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    // Return sample data if nothing is saved
    return [{
      id: 'demo-1',
      timestamp: Date.now(),
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
      analysis: {
        quickVerdict: "High resale potential. This is a sought-after vintage piece that performs well on fashion-focused platforms.",
        improvements: [
          "Wipe down the leather with a damp cloth to restore natural sheen.",
          "Take photos against a neutral, well-lit background (ideally near a window).",
          "Mention the specific year/collection if known to attract collectors."
        ],
        platforms: [
          { name: "Vinted", matchScore: 95, reasoning: "Highest demand for this category with lower seller fees." },
          { name: "Depop", matchScore: 88, reasoning: "Great for the vintage aesthetic this item carries." },
          { name: "eBay", matchScore: 75, reasoning: "Good fall-back for reaching a wider international audience." }
        ],
        suggestedTitle: "Vintage 1990s Leather Biker Jacket - Excellent Condition",
        suggestedDescription: "Beautifully preserved vintage leather jacket. Features classic heavy-duty zippers and a quilted lining. Perfectly broken in with a natural patina. Size Medium. No visible flaws.",
        priceRange: {
          min: 85,
          max: 120,
          sweetSpot: 95,
          currency: "GBP"
        },
        productDetails: {
          type: "Apparel",
          condition: "Vintage / Pre-owned",
          brand: "Authentic Vintage",
          category: "Jackets"
        },
        buyerSentiment: {
          overallRating: 4.8,
          summary: "Buyers love this specific era for its durability and timeless style.",
          pros: ["High-quality full-grain leather", "Classic fit", "Increasing value year-over-year"],
          cons: ["Sizing can be smaller than modern standards", "Slight vintage scent expected"]
        }
      }
    }];
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('identifying');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', color: '#55cdd1' });
  
  const { location, setLocation, currency, setCurrency, requestLocation, isLoading: isLocating } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [manualCountry, setManualCountry] = useState('');
  const [manualState, setManualState] = useState('');

  // Ask for location/currency if not set
  useEffect(() => {
    if (view !== 'landing') {
      const savedCurrency = localStorage.getItem('sellscan_currency');
      if (!savedCurrency) {
        setShowCurrencyModal(true);
      } else if (!location) {
        setShowLocationModal(true);
      }
    }
  }, [location, view]);

  // Load theme, history, and projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('sellscan_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }

    const savedTheme = localStorage.getItem('sellscan_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Sync theme with document element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('sellscan_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const saveToHistory = (scan: ScanResult) => {
    const updated = [scan, ...history];
    setHistory(updated);
    localStorage.setItem('sellscan_history', JSON.stringify(updated));
  };

  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('sellscan_projects', JSON.stringify(updatedProjects));
  };

  const stats: UserStats = useMemo(() => {
    const totalScans = history.length;
    const totalMarketValue = history.reduce((acc, scan) => acc + scan.analysis.priceRange.sweetSpot, 0);
    const averageSweetSpot = totalScans > 0 ? totalMarketValue / totalScans : 0;
    
    const catMap: Record<string, { count: number; value: number }> = {};
    history.forEach(scan => {
      const cat = scan.analysis.productDetails.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { count: 0, value: 0 };
      catMap[cat].count++;
      catMap[cat].value += scan.analysis.priceRange.sweetSpot;
    });

    const categories = Object.entries(catMap).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Group scans by date for the trend chart
    const dateMap: Record<string, number> = {};
    history.slice(0, 30).forEach(scan => {
      const date = new Date(scan.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    const scansByDate = Object.entries(dateMap).map(([date, count]) => ({ date, count })).reverse();

    return {
      totalScans,
      totalMarketValue,
      averageSweetSpot,
      categories,
      scansByDate
    };
  }, [history]);

  const handleAnalyze = async (image?: string, description?: string, isDemo: boolean = false) => {
    setIsLoading(true);
    setLoadingStage('identifying');
    
    const stageTimer = (stage: LoadingStage, delay: number) => 
      new Promise(res => setTimeout(() => { setLoadingStage(stage); res(true); }, delay));

    try {
      const aiPromise = analyzeProduct(image, description, location || undefined, isDemo);
      
      await stageTimer('searching', isDemo ? 500 : 1500);
      await stageTimer('analyzing_reviews', isDemo ? 500 : 2500);
      await stageTimer('calculating', isDemo ? 500 : 2500);
      await stageTimer('finishing', isDemo ? 500 : 1500);

      const analysis = await aiPromise;
      
      const newScan: ScanResult = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        imageUrl: image,
        description: description,
        analysis,
        projectId: activeProjectId || undefined
      };
      
      setCurrentScan(newScan);
      saveToHistory(newScan);
      setView('dashboard');
    } catch (error) {
      console.error("Analysis failed:", error);
      if (error instanceof Error && error.message === "API_KEY_MISSING") {
        if (confirm("Gemini API Key is not set in project settings. Would you like to run in Demo Mode to check the layout? \n\nOtherwise, you can add your key in the Settings > Secrets panel.")) {
          handleAnalyze(image, description, true);
        }
      } else {
        alert("Something went wrong during analysis. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: newProjectData.name,
      description: newProjectData.description,
      color: newProjectData.color,
      createdAt: Date.now()
    };
    saveProjects([...projects, newProject]);
    setShowNewProjectModal(false);
    setNewProjectData({ name: '', description: '', color: '#55cdd1' });
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    const updated = projects.map(p => 
      p.id === editingProject.id 
        ? { ...p, ...newProjectData } 
        : p
    );
    saveProjects(updated);
    setEditingProject(null);
    setNewProjectData({ name: '', description: '', color: '#55cdd1' });
  };

  const handleDeleteProject = () => {
    if (!projectToDelete) return;
    const updated = projects.filter(p => p.id !== projectToDelete.id);
    saveProjects(updated);
    setHistory(history.map(scan => scan.projectId === projectToDelete.id ? { ...scan, projectId: undefined } : scan));
    setProjectToDelete(null);
    setView('home');
  };

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId)
  , [projects, activeProjectId]);

  const activeProjectScans = useMemo(() => 
    history.filter(scan => scan.projectId === activeProjectId)
  , [history, activeProjectId]);

  const handleUpdateAnalysis = (newAnalysis: ProductAnalysis) => {
    if (currentScan) {
      const updatedScan = { ...currentScan, analysis: newAnalysis };
      setCurrentScan(updatedScan);
      const updatedHistory = history.map(h => h.id === currentScan.id ? updatedScan : h);
      setHistory(updatedHistory);
      localStorage.setItem('sellscan_history', JSON.stringify(updatedHistory));
    }
  };

  const handleSelectProject = (project: Project) => {
    setActiveProjectId(project.id);
    setView('project-detail');
  };

  const handleGoHome = () => {
    if (view === 'landing') {
      setView('landing');
    } else {
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-accent selection:text-brand-bg transition-colors duration-300">
      <Navbar 
        onGoHome={handleGoHome}
        onNewScan={() => setView('upload')}
        onViewHistory={() => setView('history')}
        onViewAnalytics={() => setView('analytics')}
        onViewSettings={() => setView('settings')}
        isLoggedIn={true}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className={cn(
        "min-h-[calc(100vh-64px)] overflow-x-hidden pt-16 transition-all duration-300",
        view !== 'landing' ? "pb-28 md:pb-0" : ""
      )}>
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              key="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-brand-bg/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
            >
              <div className="w-full max-w-md">
                <div className="relative mb-12 flex justify-center">
                   <div className="w-24 h-24 rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center relative">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-brand-accent/5 rounded-3xl"
                      />
                      {loadingStage === 'identifying' && <Search className="w-10 h-10 text-brand-accent" />}
                      {loadingStage === 'searching' && <Globe className="w-10 h-10 text-brand-accent" />}
                      {loadingStage === 'analyzing_reviews' && <Users className="w-10 h-10 text-brand-accent" />}
                      {loadingStage === 'calculating' && <TrendingUp className="w-10 h-10 text-brand-accent" />}
                      {loadingStage === 'finishing' && <Sparkles className="w-10 h-10 text-brand-accent" />}
                   </div>
                   <div className="absolute -bottom-2 -right-2">
                     <div className="bg-brand-accent text-brand-bg p-2 rounded-xl shadow-xl">
                        <Loader2 className="w-5 h-5 animate-spin" />
                     </div>
                   </div>
                </div>

                <div className="space-y-6">
                  <motion.div
                    key={loadingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      y: 0 
                    }}
                    transition={{ 
                      opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 0.3 }
                    }}
                    className="text-center"
                  >
                    <h3 className="text-2xl font-bold mb-2">{LOADING_STAGE_TEXT[loadingStage]}</h3>
                    <p className="text-brand-text-muted text-sm tracking-widest uppercase font-bold">Sellscan AI is working...</p>
                  </motion.div>

                  <div className="h-1 w-full bg-brand-border rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-accent"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: 
                          loadingStage === 'identifying' ? '20%' : 
                          loadingStage === 'searching' ? '40%' : 
                          loadingStage === 'analyzing_reviews' ? '65%' : 
                          loadingStage === 'calculating' ? '85%' : '95%'
                      }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-2 px-2">
                    <StageDot active={true} />
                    <StageDot active={['searching', 'analyzing_reviews', 'calculating', 'finishing'].includes(loadingStage)} />
                    <StageDot active={['analyzing_reviews', 'calculating', 'finishing'].includes(loadingStage)} />
                    <StageDot active={['calculating', 'finishing'].includes(loadingStage)} />
                    <StageDot active={loadingStage === 'finishing'} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'landing' && (
            <motion.div
              key="landing"
              className="pt-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage onStart={() => setView('home')} />
            </motion.div>
          )}

          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardHome 
                stats={stats}
                recentScans={history}
                projects={projects}
                onStartNewScan={() => { setActiveProjectId(null); setView('upload'); }}
                onCreateProject={() => setShowNewProjectModal(true)}
                onViewProject={handleSelectProject}
                onViewAllScans={() => setView('history')}
                onViewAnalytics={() => setView('analytics')}
              />
            </motion.div>
          )}

          {view === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-24 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-4">What are you selling today?</h1>
                  <p className="text-brand-text-muted">
                    {activeProject ? `Adding to project: ${activeProject.name}` : "Upload a photo for the best analysis, or describe it in details."}
                  </p>
                </div>
                <ImageUpload onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>
            </motion.div>
          )}

          {view === 'project-detail' && activeProject && (
             <motion.div
               key="project-detail"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               <ProjectDetail 
                 project={activeProject}
                 scans={activeProjectScans}
                 onBack={() => setView('home')}
                 onEdit={() => {
                   setNewProjectData({
                     name: activeProject.name,
                     description: activeProject.description,
                     color: activeProject.color
                   });
                   setEditingProject(activeProject);
                 }}
                 onDelete={() => setProjectToDelete(activeProject)}
                 onNewScan={() => setView('upload')}
                 onSelectScan={(scan) => { setCurrentScan(scan); setView('dashboard'); }}
               />
             </motion.div>
          )}

          {view === 'analytics' && (
             <motion.div
               key="analytics"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               <AnalyticsPage stats={stats} onBack={() => setView('home')} />
             </motion.div>
          )}

          {view === 'dashboard' && currentScan && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScanDashboard 
                scan={currentScan} 
                onUpdateAnalysis={handleUpdateAnalysis}
                onBack={() => setView('home')}
              />
            </motion.div>
          )}

          {view === 'history' && (
             <motion.div
               key="history"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               <HistoryPage 
                 history={history} 
                 onSelect={(scan) => { setCurrentScan(scan); setView('dashboard'); }} 
                 onClear={() => { setHistory([]); localStorage.removeItem('sellscan_history'); }} 
               />
             </motion.div>
          )}

          {view === 'settings' && (
             <motion.div
               key="settings"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
             >
               <SettingsPage />
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <AnimatePresence>
        {view !== 'landing' && !isLoading && !showLocationModal && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <BottomNav activeView={view} onNavigate={setView} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Modal (Create/Edit) */}
      <AnimatePresence>
        {(showNewProjectModal || editingProject) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => {
                 setShowNewProjectModal(false);
                 setEditingProject(null);
                 setNewProjectData({ name: '', description: '', color: '#55cdd1' });
               }}
               className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg glass-card p-8 bg-brand-bg"
             >
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                 <button 
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setEditingProject(null);
                    setNewProjectData({ name: '', description: '', color: '#55cdd1' });
                  }} 
                  className="text-brand-text-muted hover:text-brand-text"
                >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold uppercase tracking-widest text-brand-text-muted">Project Name</label>
                   <input 
                     type="text" 
                     value={newProjectData.name}
                     onChange={e => setNewProjectData({...newProjectData, name: e.target.value})}
                     className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-all"
                     placeholder="e.g., Spring Garage Sale"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold uppercase tracking-widest text-brand-text-muted">Description</label>
                   <textarea 
                     value={newProjectData.description}
                     onChange={e => setNewProjectData({...newProjectData, description: e.target.value})}
                     className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-all h-24 resize-none"
                     placeholder="What's this project about?"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold uppercase tracking-widest text-brand-text-muted">Project Color</label>
                   <div className="flex gap-3">
                     {['#55cdd1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                       <button 
                         key={color}
                         onClick={() => setNewProjectData({...newProjectData, color})}
                         className={cn(
                           "w-10 h-10 rounded-full transition-all border-4",
                           newProjectData.color === color ? "border-brand-text scale-110" : "border-transparent"
                         )}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                   </div>
                 </div>
                 <button 
                   onClick={editingProject ? handleUpdateProject : handleCreateProject}
                   disabled={!newProjectData.name.trim()}
                   className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                 >
                   {editingProject ? 'Save Changes' : 'Create Project'}
                 </button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setProjectToDelete(null)}
               className="absolute inset-0 bg-brand-bg/90 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-md glass-card p-8 bg-brand-bg border-red-500/20"
             >
               <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                    <Trash2 className="w-8 h-8 text-red-500" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2">Delete Project?</h2>
                 <p className="text-brand-text-muted mb-8 text-sm">
                   Are you sure you want to delete <span className="font-bold text-brand-text">"{projectToDelete.name}"</span>? 
                   The items inside won't be deleted, but they will be moved to your general history.
                 </p>

                 <div className="flex flex-col w-full gap-3">
                   <button 
                     onClick={handleDeleteProject}
                     className="w-full py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-[0_10px_30px_-10px_rgba(239,68,68,0.3)]"
                   >
                     Delete Project
                   </button>
                   <button 
                     onClick={() => setProjectToDelete(null)}
                     className="w-full py-4 rounded-xl bg-brand-bg border border-brand-border font-bold hover:bg-brand-card transition-all"
                   >
                     Keep Project
                   </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Currency Modal */}
      <AnimatePresence>
        {showCurrencyModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-brand-bg/95 backdrop-blur-xl"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 20 }}
               className="relative w-full max-w-md glass-card p-10 bg-brand-bg text-center border-brand-accent/20"
             >
               <div className="w-20 h-20 rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-8">
                  <CircleDollarSign className="w-10 h-10 text-brand-accent" />
               </div>
               <h2 className="text-3xl font-bold mb-4 italic tracking-tight">Set your currency</h2>
               <p className="text-brand-text-muted mb-10 text-lg">
                 Choose the currency you use for listing. You can change this anytime in settings.
               </p>

               <div className="grid grid-cols-2 gap-4">
                 {[
                   { code: 'GBP', symbol: '£', name: 'British Pound' },
                   { code: 'USD', symbol: '$', name: 'US Dollar' },
                   { code: 'EUR', symbol: '€', name: 'Euro' },
                   { code: 'BRL', symbol: 'R$', name: 'Real' }
                 ].map((c) => (
                   <button 
                     key={c.code}
                     onClick={() => {
                       setCurrency(c.code);
                       setShowCurrencyModal(false);
                       if (!location) setShowLocationModal(true);
                     }}
                     className="flex flex-col items-center justify-center p-6 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 transition-all group"
                   >
                     <span className="text-2xl font-black mb-1 group-hover:scale-110 transition-transform">{c.symbol}</span>
                     <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-muted group-hover:text-brand-accent transition-colors">{c.code}</span>
                   </button>
                 ))}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-brand-bg/95 backdrop-blur-xl"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.8, y: 20 }}
               className="relative w-full max-w-md glass-card p-8 bg-brand-bg text-center"
             >
               <div className="w-20 h-20 rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-8">
                  <MapPin className="w-10 h-10 text-brand-accent" />
               </div>
               <h2 className="text-3xl font-bold mb-4">Personalize your market</h2>
               <p className="text-brand-text-muted mb-8 text-lg">
                 Sellscan adapts pricing and selling platforms to your current location for the most accurate results.
               </p>

               <div className="space-y-6">
                 <button 
                   onClick={async () => {
                     await requestLocation();
                     setShowLocationModal(false);
                   }}
                   disabled={isLocating}
                   className="w-full py-4 rounded-xl bg-brand-accent text-brand-bg font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                 >
                   {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                   {isLocating ? 'Locating...' : 'Use current location'}
                 </button>

                 <div className="relative">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-border" /></div>
                   <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-bg px-2 text-brand-text-muted font-bold">Or enter manually</span></div>
                 </div>

                 <div className="space-y-4">
                   <input 
                     type="text" 
                     placeholder="Country (e.g. United Kingdom)" 
                     value={manualCountry}
                     onChange={e => setManualCountry(e.target.value)}
                     className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-all"
                   />
                   <input 
                     type="text" 
                     placeholder="State/Region (optional)" 
                     value={manualState}
                     onChange={e => setManualState(e.target.value)}
                     className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 outline-none focus:border-brand-accent transition-all"
                   />
                   <button 
                     onClick={() => {
                        if (manualCountry.trim()) {
                          const newLocation: UserLocation = {
                            country: manualCountry.trim(),
                            state: manualState.trim() || undefined,
                            method: 'manual',
                            timestamp: Date.now()
                          };
                          setLocation(newLocation);
                          setShowLocationModal(false);
                        }
                     }}
                     disabled={!manualCountry.trim()}
                     className="w-full py-4 rounded-xl bg-brand-card border border-brand-border text-brand-text font-bold hover:bg-brand-border transition-all disabled:opacity-50"
                   >
                     Confirm Location
                   </button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageDot({ active }: { active: boolean }) {
  return (
    <div className={cn(
      "h-1 rounded-full transition-all duration-500",
      active ? "bg-brand-accent shadow-[0_0_8px_var(--color-brand-accent-glow)]" : "bg-brand-border"
    )} />
  );
}
