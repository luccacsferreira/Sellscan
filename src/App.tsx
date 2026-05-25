/**
 * @version 1.0.4 - Manual Build Refresh
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import sellscanLogo from './assets/sellscan_logo_transparent.png';
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
import { AuthModal } from './components/AuthModal';
import { ScanResult, Project, UserStats, ProductAnalysis } from './types';
import { analyzeProduct, AIModel } from './services/aiService';
import { cn } from './lib/utils';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { dbService } from './services/dbService';
import { User } from '@supabase/supabase-js';
import { Search, Globe, Users, TrendingUp, Sparkles, Loader2, X, Trash2, MapPin, CircleDollarSign, Check, AlertTriangle, Settings2 } from 'lucide-react';
import { LocationProvider, useLocation } from './lib/LocationContext';
import { UserLocation } from './types';
import { AuthCallback } from './components/AuthCallback';
import { DocsPage } from './components/DocsPage';
import { AffiliatePage } from './components/AffiliatePage';
import { NotificationModal } from './components/NotificationModal';

type View = 'landing' | 'upload' | 'dashboard' | 'history' | 'settings' | 'home' | 'project-detail' | 'analytics' | 'auth-callback' | 'docs' | 'affiliate';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState<{ email?: string, name?: string, avatar?: string } | null>(null);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } finally {
        setIsAuthInitializing(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_IN') {
        setIsAuthInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('sellscan_ref_code', refCode);
      // Clean up URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

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
  const [imageToAnalyze, setImageToAnalyze] = useState<string | null>(null);
  const [detectedName, setDetectedName] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [activePlatforms, setActivePlatforms] = useState<string[]>([]);
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('sellscan_theme_mode') as 'dark' | 'light' | 'system') || 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Logic to resolve theme based on mode
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };

      handleChange(mediaQuery);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(themeMode);
    }
  }, [themeMode]);

  // Sync theme with document element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    localStorage.setItem('sellscan_theme_mode', themeMode);
  }, [resolvedTheme, themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'system') return resolvedTheme === 'dark' ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    return (localStorage.getItem('sellscan_model') as AIModel) || 'gemini';
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', color: '#55cdd1' });
  
  const { location, setLocation, currency, setCurrency, requestLocation, isLoading: isLocating } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scanError, setScanError] = useState<{ title: string; message: string } | null>(null);
  const [pendingScan, setPendingScan] = useState<{ image?: string, description?: string } | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<string | null>(null);
  const [manualCountry, setManualCountry] = useState('');
  const [manualState, setManualState] = useState('');

  const handleAuthSuccess = (authenticatedUser: User) => {
    setShowAuthModal(false);
    setUser(authenticatedUser);

    if (pendingScan) {
      handleAnalyze(pendingScan.image, pendingScan.description, false, authenticatedUser);
      setPendingScan(null);
    } else if (pendingCheckout) {
      // If we're on the landing page and have a pending checkout, stay here
      // so the user can click the button again, now logged in.
      setPendingCheckout(null);
    } else if (view === 'landing') {
      setView('home');
    }
  };

  // Handle OAuth Callback from Popup
  useEffect(() => {
    const isCallback = window.location.hash.includes('access_token') || 
                      window.location.search.includes('code=') || 
                      window.location.search.includes('error=');
    
    if (isCallback) {
      setView('auth-callback');
    }

    const handleMessage = async (event: MessageEvent) => {
      // Be more permissive with origins in development/preview environments
      const isAllowedOrigin = event.origin === window.location.origin || 
                             event.origin.includes('run.app') || 
                             event.origin.includes('localhost');
      
      if (!isAllowedOrigin && window.location.hostname !== 'localhost') {
        console.warn('⚠️ Ignored cross-origin message:', event.origin);
        return;
      }
      
      if (event.data?.type === 'SUPABASE_OAUTH_SUCCESS') {
        if (event.data.user) {
          setLoadingUserInfo(event.data.user);
        }
        setIsAuthInitializing(true);
        // Refresh session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          handleAuthSuccess(session.user);
        }
        setIsAuthInitializing(false);
        setLoadingUserInfo(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('sellscan_projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Sync from Supabase using dbService
      const fetchData = async () => {
        try {
          const [projectsData, scansData] = await Promise.all([
            dbService.getProjects(),
            dbService.getScans()
          ]);
          
          if (projectsData) setProjects(projectsData);
          if (scansData) setHistory(scansData);
        } catch (e) {
          console.error("Failed to sync from database", e);
        }
      };
      fetchData();
    }
  }, [user]);

  const saveToHistory = async (scan: ScanResult) => {
    const updated = [scan, ...history];
    setHistory(updated);
    localStorage.setItem('sellscan_history', JSON.stringify(updated));

    if (user) {
      try {
        await dbService.saveScan(scan);
      } catch (e) {
        console.error("Failed to save scan to DB", e);
      }
    }
  };

  const saveProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('sellscan_projects', JSON.stringify(updatedProjects));
  };

  const stats: UserStats = useMemo(() => {
    // Filter out any invalid scans just in case
    const validHistory = (history || []).filter(s => s && s.analysis);
    const totalScans = validHistory.length;
    const totalMarketValue = validHistory.reduce((acc, scan) => acc + (scan?.analysis?.priceRange?.sweetSpot || 0), 0);
    const averageSweetSpot = totalScans > 0 ? totalMarketValue / totalScans : 0;
    
    const catMap: Record<string, { count: number; value: number }> = {};
    validHistory.forEach(scan => {
      const cat = scan?.analysis?.productDetails?.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { count: 0, value: 0 };
      catMap[cat].count++;
      catMap[cat].value += (scan?.analysis?.priceRange?.sweetSpot || 0);
    });

    const categories = Object.entries(catMap).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Group scans by date for the trend chart
    const dateMap: Record<string, number> = {};
    validHistory.slice(0, 30).forEach(scan => {
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

  const handleAnalyze = async (image?: string, description?: string, isDemo: boolean = false, forceUser?: User | null) => {
    const activeUser = forceUser !== undefined ? forceUser : user;
    
    if (!activeUser && !isDemo) {
      setPendingScan({ image, description });
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    setLoadingStage('identifying');
    setImageToAnalyze(image || null);
    setDetectedName(null);
    setLivePrice(null);
    setLiveRating(null);
    setActivePlatforms([]);
    
    const stageTimer = (stage: LoadingStage, delay: number) => 
      new Promise(res => setTimeout(() => { setLoadingStage(stage); res(true); }, delay));

    try {
      const aiPromise = analyzeProduct({ 
        image: image || undefined, 
        description, 
        location: location || undefined, 
        isDemo,
        model: selectedModel
      });
      
      // Simulate detection name appearing after a bit
      setTimeout(() => {
        if (description) {
           const words = description.split(' ');
           if (words.length > 2) setDetectedName(words.slice(0, 3).join(' ') + '...');
           else if (words.length > 0) setDetectedName(words.join(' '));
        } else {
           setDetectedName("Calculating product ID...");
        }
      }, 800);

      await stageTimer('searching', isDemo ? 500 : 1500);
      
      // We will update these once we have the actual analysis or better simulations
      
      await stageTimer('analyzing_reviews', isDemo ? 500 : 2500);
      
      // If we are still waiting for AI, show some "Found" indicators
      if (!isDemo) {
        setLiveRating(4.5 + Math.random() * 0.4);
      }

      await stageTimer('calculating', isDemo ? 500 : 2500);
      
      if (!isDemo) {
        // Just a placeholder until actual data arrives
        setLivePrice(20 + Math.floor(Math.random() * 100));
      }

      await stageTimer('finishing', isDemo ? 500 : 1500);

      const analysis = await aiPromise;
      
      // Now update the "Live" data with reality before we switch views
      setDetectedName(analysis.productDetails.brand + ' ' + (analysis.productDetails.type || analysis.productDetails.category));
      setActivePlatforms(analysis.platforms.slice(0, 5).map(p => p.name));
      setLivePrice(analysis.priceRange.sweetSpot);
      setLiveRating(analysis.buyerSentiment?.overallRating || 4.8);

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
      const isMissingKey = error instanceof Error && 
        (error.message === "API_KEY_MISSING" || error.message.includes("GEMINI_API_KEY is not configured"));
        
      if (isMissingKey) {
        setScanError({
          title: "Setup Required",
          message: "Gemini API Key is missing. You can add your own key in Settings > Secrets or continue this scan in Demo Mode to see the interface."
        });
      } else {
        const isAnalysisError = error instanceof Error && error.message.includes("Analysis failed");
        setScanError({
          title: isAnalysisError ? "Refining Analysis" : "Detection Failed",
          message: isAnalysisError 
            ? "Our engine had trouble identifying this specific image. Please try a clearer photo or provide a text description above."
            : "Vision processing interrupted. This can happen with extremely high-resolution images (>20MB) or slow networks. Try a smaller file."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    const projectTemplate: Omit<Project, 'id' | 'createdAt'> = {
      name: newProjectData.name,
      description: newProjectData.description,
      color: newProjectData.color,
    };
    
    let projectId = Math.random().toString(36).substring(7);

    if (user) {
      try {
        const data = await dbService.createProject(projectTemplate);
        if (data) projectId = data.id;
      } catch (e) {
        console.error("Failed to create project in DB", e);
      }
    }

    const newProject: Project = {
      ...projectTemplate,
      id: projectId,
      createdAt: Date.now()
    };

    saveProjects([...projects, newProject]);
    setShowNewProjectModal(false);
    setNewProjectData({ name: '', description: '', color: '#55cdd1' });
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    const updated = projects.map(p => 
      p.id === editingProject.id 
        ? { ...p, ...newProjectData } 
        : p
    );

    if (user) {
      try {
        await dbService.updateProject({
          ...editingProject,
          ...newProjectData
        });
      } catch (e) {
        console.error("Failed to update project in DB", e);
      }
    }

    saveProjects(updated);
    setEditingProject(null);
    setNewProjectData({ name: '', description: '', color: '#55cdd1' });
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    const updated = projects.filter(p => p.id !== projectToDelete.id);
    
    if (user) {
      try {
        await dbService.deleteProject(projectToDelete.id);
      } catch (e) {
        console.error("Failed to delete project from DB", e);
      }
    }

    saveProjects(updated);
    setHistory((history || []).map(scan => (scan && scan.projectId === projectToDelete.id) ? { ...scan, projectId: undefined } : scan));
    setProjectToDelete(null);
    setView('home');
  };

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId)
  , [projects, activeProjectId]);

  const activeProjectScans = useMemo(() => 
    (history || []).filter(scan => scan && scan.projectId === activeProjectId)
  , [history, activeProjectId]);

  const handleUpdateScan = async (updatedScan: ScanResult) => {
    const updatedHistory = (history || []).map(h => (h && h.id === updatedScan.id) ? updatedScan : h);
    setHistory(updatedHistory);
    localStorage.setItem('sellscan_history', JSON.stringify(updatedHistory));
    
    if (currentScan?.id === updatedScan.id) {
       setCurrentScan(updatedScan);
    }

    if (user) {
      // If it's a real scan (has UUID or from DB), we update it
      // If it's a demo scan (short random string), it might not work with upsert if it expects UUID
      // But scans from DB will have proper IDs.
      try {
        await supabase.from('scans').upsert({
          id: updatedScan.id,
          user_id: user.id,
          project_id: updatedScan.projectId || null,
          timestamp: updatedScan.timestamp,
          image_url: updatedScan.imageUrl,
          description: updatedScan.description,
          analysis: updatedScan.analysis
        });
      } catch (e) {
        console.error("Failed to sync updated scan to Supabase", e);
      }
    }
  };

  const handleUpdateAnalysis = (newAnalysis: ProductAnalysis) => {
    if (currentScan) {
      const updatedScan = { ...currentScan, analysis: newAnalysis };
      handleUpdateScan(updatedScan);
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

  if (isAuthInitializing && view !== 'auth-callback') {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-brand-text">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm glass-card p-10 bg-brand-bg border-brand-accent/20 text-center shadow-2xl relative overflow-hidden"
        >
          {loadingUserInfo ? (
            <div className="space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-brand-accent/10" />
                <div className="absolute inset-0 rounded-full border-4 border-brand-accent border-t-transparent animate-spin" />
                <div className="absolute inset-0 p-1.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-brand-bg border border-brand-border overflow-hidden">
                    {loadingUserInfo.avatar ? (
                      <img src={loadingUserInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-accent/10">
                        <Loader2 className="w-8 h-8 text-brand-accent animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black italic tracking-tight mb-1">
                  {loadingUserInfo.name?.split(' ')[0] || 'Welcome back'}
                </h2>
                <div className="flex items-center justify-center gap-2 text-brand-accent font-bold text-[10px] uppercase tracking-[0.2em]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Logging you in
                </div>
                <div className="mt-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-brand-text-muted text-[10px] inline-block font-bold">
                  {loadingUserInfo.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-brand-accent/20" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-brand-accent border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-brand-accent" />
                </div>
              </div>
              <div className="text-center">
                <img src={sellscanLogo} alt="Sellscan" className="h-4 mx-auto mb-2 opacity-80" />
                <p className="text-brand-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Initializing Secure Session</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (view === 'auth-callback') {
    return <AuthCallback />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-accent selection:text-brand-bg transition-colors duration-300">
      <Navbar 
        onGoHome={handleGoHome}
        onNewScan={() => setView('upload')}
        onViewHistory={() => setView('history')}
        onViewAnalytics={() => setView('analytics')}
        onViewSettings={() => setView('settings')}
        onViewDocs={() => setView('docs')}
        onViewAffiliate={() => setView('affiliate')}
        onSignInClick={() => setShowAuthModal(true)}
        isLoggedIn={!!user}
        userEmail={user?.email}
        theme={resolvedTheme}
        onToggleTheme={toggleTheme}
      />

      {/* Referral Welcome Banner */}
      {localStorage.getItem('sellscan_ref_code') && view !== 'landing' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-accent text-brand-bg px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Partner Referral Applied</span>
            <button 
              onClick={() => {
                localStorage.removeItem('sellscan_ref_code');
                window.location.reload();
              }}
              className="p-1 hover:bg-black/10 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Critical Configuration Warning Banner */}
      {!isSupabaseConfigured && view !== 'landing' && (
        <div className="fixed top-16 left-0 right-0 z-[100] bg-red-500/10 backdrop-blur-md border-y border-red-500/20 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                Database Not Configured: trysellscan.com may be pointing to a static host (like GitHub Pages).
              </p>
            </div>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:brightness-110 transition-all whitespace-nowrap"
            >
              <Settings2 className="w-3 h-3" />
              Open Troubleshooter
            </button>
          </div>
        </div>
      )}
      
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
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-brand-bg/20 backdrop-blur-[12px] overflow-y-auto"
            >
              <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-4 animate-in zoom-in-95 duration-500 items-stretch h-fit">
                 
                 {/* Left Column: Progress Checklist (Bloom.ai style) */}
                 <div className="md:col-span-4 glass-card p-6 md:p-8 border-white/5 bg-brand-bg/60 backdrop-blur-xl flex flex-col shadow-2xl">
                    <div className="mb-6 md:mb-8">
                       <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-4 md:mb-5">
                          <Sparkles className="w-5 h-5 text-brand-accent" />
                       </div>
                       <h2 className="text-lg md:text-xl font-black tracking-tight text-white leading-tight">
                         Scanning environment
                       </h2>
                       <p className="text-brand-text-muted text-[10px] mt-2 font-medium tracking-wide uppercase opacity-60">Status: Real-time analysis</p>
                    </div>

                    <div className="space-y-2 md:space-y-4 flex-grow">
                      {[
                        { id: 'identifying', label: 'Extracting context' },
                        { id: 'searching', label: 'Searching market' },
                        { id: 'analyzing_reviews', label: 'Social sentiment' },
                        { id: 'calculating', label: 'Pricing parity' },
                        { id: 'finishing', label: 'Polishing data' }
                      ].map((stage, idx, arr) => {
                        const stages = arr.map(s => s.id);
                        const currentIdx = stages.indexOf(loadingStage);
                        const isCompleted = stages.indexOf(stage.id) < currentIdx;
                        const isActive = stage.id === loadingStage;

                        return (
                          <div key={stage.id} className="relative pl-8 h-9 md:h-10 flex items-center">
                            {/* Connector Line */}
                            {idx < arr.length - 1 && (
                              <div className={cn(
                                "absolute left-[9.5px] top-[26px] md:top-[28px] w-[1px] h-[18px] md:h-[22px] transition-colors duration-500",
                                isCompleted ? "bg-brand-accent" : "bg-brand-border/20"
                              )} />
                            )}
                            
                            <div className={cn(
                              "absolute left-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500 shrink-0",
                              isCompleted ? "bg-brand-accent border-brand-accent text-brand-bg shadow-[0_0_10px_rgba(85,205,209,0.3)]" : 
                              isActive ? "border-brand-accent bg-brand-accent/10" : "border-brand-border/30"
                            )}>
                              {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : (
                                isActive ? <div className="w-1 h-1 rounded-full bg-brand-accent animate-ping" /> : 
                                <div className="w-1 h-1 rounded-full bg-brand-border/20" />
                              )}
                            </div>
                            
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-[11px] md:text-[12px] font-bold tracking-tight transition-colors",
                                isCompleted || isActive ? "text-white" : "text-brand-text-muted/30"
                              )}>
                                {stage.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 md:mt-8 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-brand-text-muted text-[10px] font-black uppercase tracking-widest opacity-40">
                         <Loader2 className="w-3 h-3 animate-spin text-brand-accent" />
                         Engine Active
                      </div>
                    </div>
                 </div>

                 {/* Right: Visual Bento Grid */}
                 <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Top Shared Span Card - Image Preview */}
                    <div className="sm:col-span-2 glass-card p-3 border-white/5 bg-black/40 overflow-hidden aspect-video group relative flex items-center justify-center">
                       {imageToAnalyze ? (
                         <motion.img 
                           key={imageToAnalyze}
                           src={imageToAnalyze} 
                           initial={{ scale: 1.1, opacity: 0 }}
                           animate={{ scale: 1, opacity: 0.5 }}
                           transition={{ duration: 1.5 }}
                           className="w-full h-full object-contain rounded-lg" 
                         />
                       ) : (
                         <div className="flex flex-col items-center gap-3 text-brand-text-muted/40">
                            <Globe className="w-8 h-8 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Scan Engine</span>
                         </div>
                       )}
                       
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative">
                             <div className="w-20 h-20 rounded-full border-2 border-brand-accent/20 animate-[ping_3s_infinite]" />
                             <div className="absolute inset-0 w-20 h-20 rounded-full border border-brand-accent/40 flex items-center justify-center">
                                <Search className="w-8 h-8 text-brand-accent opacity-60" />
                             </div>
                          </div>
                       </div>

                       <div className="absolute bottom-4 left-4 p-2 px-4 rounded-full bg-brand-bg/80 border border-white/5 backdrop-blur-md flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{LOADING_STAGE_TEXT[loadingStage]}</span>
                       </div>
                    </div>

                    {/* Discovery Engine Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-4 md:p-6 border-white/5 flex flex-col justify-center bg-brand-bg/40 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                         <div className="w-10 md:w-12 h-10 md:h-12 rounded-full border border-brand-accent animate-[spin_10s_linear_infinite]" />
                      </div>
                      
                      <h4 className="text-[9px] font-black uppercase text-brand-accent tracking-[0.3em] mb-3 md:mb-4">Discovery Engine</h4>
                      <AnimatePresence mode="wait">
                        {detectedName ? (
                          <motion.div 
                            key="detected"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1"
                          >
                            <p className="text-[9px] md:text-[10px] font-bold text-brand-text-muted/60 uppercase tracking-widest">Identified Asset</p>
                            <h3 className="text-sm md:text-xl font-black text-white italic leading-tight uppercase">
                              {detectedName}
                            </h3>
                          </motion.div>
                        ) : (
                          <motion.div key="wait" className="space-y-2 md:space-y-3">
                             <div className="h-4 bg-white/5 animate-pulse rounded w-3/4" />
                             <div className="h-6 bg-white/5 animate-pulse rounded w-1/2" />
                             <p className="text-[9px] text-brand-text-muted/30 font-black uppercase tracking-widest animate-pulse italic">Connecting...</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Live Network Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6 border-white/5 flex flex-col bg-brand-accent/5 backdrop-blur-2xl"
                    >
                      <h4 className="text-[10px] font-black uppercase text-brand-text-muted/60 tracking-[0.2em] mb-4">Platform Reach</h4>
                      <div className="flex flex-wrap gap-2">
                         {activePlatforms.map((p) => (
                           <motion.span 
                             key={p} 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="text-[9px] px-2 py-1 rounded-md bg-brand-bg border border-white/5 text-brand-text font-bold"
                           >
                             {p}
                           </motion.span>
                         ))}
                         {activePlatforms.length === 0 && (
                            <div className="space-y-2 w-full">
                               {[1,2,3].map(i => (
                                 <div key={i} className="h-4 bg-white/5 animate-pulse rounded w-full" />
                               ))}
                            </div>
                         )}
                      </div>
                    </motion.div>

                    {/* Live Price / Rating Card */}
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.4 }}
                       className="sm:col-span-2 grid grid-cols-2 gap-4"
                    >
                       <div className="glass-card p-5 border-white/5 bg-brand-bg/40">
                          <h4 className="text-[9px] font-black uppercase text-brand-text-muted/40 tracking-widest mb-2">Price Estimate</h4>
                          <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-black text-brand-accent">
                               {livePrice ? `${currency === 'GBP' ? '£' : '$'}${livePrice.toFixed(0)}` : '--'}
                             </span>
                             {livePrice && <span className="text-[10px] font-bold text-brand-text-muted">avg</span>}
                          </div>
                       </div>
                       <div className="glass-card p-5 border-white/5 bg-brand-bg/40">
                          <h4 className="text-[9px] font-black uppercase text-brand-text-muted/40 tracking-widest mb-2">Market Heat</h4>
                          <div className="flex items-center gap-2">
                             <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(i => (
                                   <div 
                                     key={i} 
                                     className={cn(
                                       "w-2 h-4 rounded-full transition-colors", 
                                       liveRating && i <= Math.round(liveRating) ? "bg-brand-accent" : "bg-white/5"
                                     )} 
                                   />
                                ))}
                             </div>
                             <span className="text-xs font-black text-white">{liveRating ? liveRating.toFixed(1) : '--'}</span>
                          </div>
                       </div>
                    </motion.div>
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
              <LandingPage 
                onStart={() => user ? setView('home') : setShowAuthModal(true)} 
                onSignIn={(tier) => {
                  if (tier) setPendingCheckout(tier);
                  setShowAuthModal(true);
                }}
                isLoggedIn={!!user}
              />
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
                onUpdateScan={handleUpdateScan}
                projects={projects}
                onBack={() => setView('home')}
                selectedModel={selectedModel}
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
                 projects={projects}
                 onUpdateScan={handleUpdateScan}
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
               <SettingsPage 
                 selectedModel={selectedModel} 
                 setSelectedModel={(model) => {
                   setSelectedModel(model);
                   localStorage.setItem('sellscan_model', model);
                 }} 
                 isLoggedIn={!!user}
                 userEmail={user?.email || undefined}
                 themeMode={themeMode}
                 setThemeMode={setThemeMode}
               />
             </motion.div>
          )}

          {view === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-screen pt-20"
            >
              <DocsPage onBack={() => setView('landing')} />
            </motion.div>
          )}

          {view === 'affiliate' && (
            <motion.div
              key="affiliate"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="min-h-screen pt-20"
            >
              <AffiliatePage />
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
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={handleAuthSuccess} 
      />

      <NotificationModal 
        isOpen={!!scanError}
        onClose={() => setScanError(null)}
        title={scanError?.title || ''}
        message={scanError?.message || ''}
        type="error"
        actionLabel={scanError?.title === "Setup Required" ? "Try Demo Mode" : "Refresh & Try Again"}
        onAction={() => {
          if (scanError?.title === "Setup Required") {
            handleAnalyze(imageToAnalyze || undefined, undefined, true);
          } else {
            window.location.reload();
          }
        }}
      />
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
