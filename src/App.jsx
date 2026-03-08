import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, Settings, X } from 'lucide-react';

const BACKGROUNDS = {
  nature: [
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1920&auto=format&fit=crop"
  ],
  city: [
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1920&auto=format&fit=crop"
  ],
  architecture: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=1920&auto=format&fit=crop"
  ],
  ocean: [
    "https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1498092651296-641e88c3b057?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1920&auto=format&fit=crop"
  ],
  forest: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920&auto=format&fit=crop"
  ]
};

const DEFAULT_LINKS = [
  { name: 'Google', url: 'https://google.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'Reddit', url: 'https://reddit.com' },
  { name: 'Twitter', url: 'https://twitter.com' },
  { name: 'Gmail', url: 'https://mail.google.com' }
];

const SEARCH_ENGINES = {
  Google: 'https://www.google.com/search?q=',
  DuckDuckGo: 'https://duckduckgo.com/?q=',
  Brave: 'https://search.brave.com/search?q='
};

export default function App() {
  const [time, setTime] = useState(new Date());
  const [bgIndex, setBgIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('newTabSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      category: 'nature',
      tempUnit: 'C',
      searchEngine: 'Google',
      links: DEFAULT_LINKS
    };
  });

  useEffect(() => {
    localStorage.setItem('newTabSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS[settings.category].length);
    }, 30000);
    return () => clearInterval(timer);
  }, [settings.category]);

  useEffect(() => {
    setBgIndex(0);
  }, [settings.category]);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const query = (lat !== undefined && lon !== undefined) ? `${lat},${lon}` : 'London';
        // Add a cache-buster to bypass BunnyCDN caching issues that strip CORS headers
        const cb = new Date().getTime();
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=42712cd7a2ad47ed98131312260803&q=${query}&aqi=no&_cb=${cb}`);
        const data = await res.json();
        
        // Ensure icon URL uses https instead of protocol-relative
        if (data?.current?.condition?.icon && data.current.condition.icon.startsWith('//')) {
          data.current.condition.icon = 'https:' + data.current.condition.icon;
        }
        
        setWeather(data);
      } catch (error) {
        console.error("Weather fetch failed:", error);
      }
    };

    const getLocationAndWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          () => fetchWeather()
        );
      } else {
        fetchWeather();
      }
    };

    getLocationAndWeather();
    const timer = setInterval(getLocationAndWeather, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `${SEARCH_ENGINES[settings.searchEngine]}${encodeURIComponent(searchQuery)}`;
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...settings.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateSetting('links', newLinks);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const currentBg = BACKGROUNDS[settings.category][bgIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-['DM_Sans'] text-white selection:bg-white/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,400;9..40,500;9..40,700&display=swap');
        body { margin: 0; background: #000; }
      `}} />

      <AnimatePresence mode="wait">
        <motion.img
          key={currentBg}
          src={currentBg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
          alt="Background"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex h-full min-h-screen flex-col p-6">
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="flex items-start justify-between"
        >
          <div className="flex items-center gap-2 text-xl font-medium tracking-tight text-white/90 drop-shadow-md">
            <span className="text-2xl">🦊</span> Firefox
          </div>

          <div className="flex items-start gap-4">
            <AnimatePresence>
              {weather && (
                <motion.div 
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
                  className="flex w-48 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md shadow-lg"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium text-white/90 truncate pr-2">{weather.location.name}</span>
                    <span className="text-lg font-semibold">
                      {settings.tempUnit === 'C' ? Math.round(weather.current.temp_c) : Math.round(weather.current.temp_f)}°
                    </span>
                  </div>
                  <div className="mt-1 flex w-full items-center justify-between text-xs text-white/70">
                    <span className="truncate">{weather.current.condition.text}</span>
                    <img src={weather.current.condition.icon} alt="weather" className="h-6 w-6" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full border border-white/20 bg-white/10 p-3 text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white shadow-lg"
            >
              <Settings size={20} />
            </button>
          </div>
        </motion.header>

        <div className="flex flex-1 flex-col items-center justify-center gap-12">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col items-center text-center drop-shadow-xl"
          >
            <h1 className="text-8xl font-extralight tracking-tight text-white sm:text-9xl">
              {formatTime(time)}
            </h1>
            <p className="mt-4 text-lg font-medium text-white/80 tracking-wide">
              {formatDate(time)}
            </p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            onSubmit={handleSearch}
            className="group relative w-full max-w-xl"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-white/50 transition-colors group-focus-within:text-white/80">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the web..."
              className="w-full rounded-full border border-white/20 bg-white/10 py-4 pl-14 pr-14 text-lg text-white placeholder-white/50 backdrop-blur-md outline-none transition-all focus:border-white/40 focus:bg-white/20 shadow-lg"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="submit"
                  className="absolute inset-y-0 right-2 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                >
                  <ArrowRight size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.form>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.4 } }
            }}
            className="flex flex-wrap justify-center gap-6"
          >
            {settings.links.map((link, i) => (
              <motion.a
                key={i}
                href={link.url}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex w-24 flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur-md transition-colors hover:bg-white/10 shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 shadow-inner">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=32`} 
                    alt={link.name}
                    className="h-6 w-6"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <span className="text-xs font-medium text-white/80 truncate w-full text-center">{link.name}</span>
              </motion.a>
            ))}
          </motion.div>

        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 z-50 w-full max-w-md border-l border-white/20 bg-black/40 p-6 backdrop-blur-xl overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-medium text-white">Settings</h2>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Background</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(BACKGROUNDS).map(cat => (
                      <button
                        key={cat}
                        onClick={() => updateSetting('category', cat)}
                        className={`rounded-xl border py-2 px-4 text-sm font-medium capitalize transition-all ${
                          settings.category === cat 
                            ? 'border-white/50 bg-white/20 text-white' 
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Temperature</label>
                  <div className="flex gap-2">
                    {['C', 'F'].map(unit => (
                      <button
                        key={unit}
                        onClick={() => updateSetting('tempUnit', unit)}
                        className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-all ${
                          settings.tempUnit === unit 
                            ? 'border-white/50 bg-white/20 text-white' 
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        °{unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Search Engine</label>
                  <div className="flex flex-col gap-2">
                    {Object.keys(SEARCH_ENGINES).map(engine => (
                      <button
                        key={engine}
                        onClick={() => updateSetting('searchEngine', engine)}
                        className={`rounded-xl border py-3 px-4 text-left text-sm font-medium transition-all ${
                          settings.searchEngine === engine 
                            ? 'border-white/50 bg-white/20 text-white' 
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {engine}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Quick Links</label>
                  <div className="space-y-2">
                    {settings.links.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <input 
                          type="text" 
                          value={link.name}
                          onChange={(e) => updateLink(i, 'name', e.target.value)}
                          placeholder="Name"
                          className="w-1/3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                        />
                        <input 
                          type="url" 
                          value={link.url}
                          onChange={(e) => updateLink(i, 'url', e.target.value)}
                          placeholder="URL"
                          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
