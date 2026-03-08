import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, Settings, X, Sun, Moon, Cloud, CloudFog, CloudLightning, CloudSnow, CloudRain, Shuffle, StickyNote, Check } from 'lucide-react';

// SECTION: Constants
const VERSION = "26.3.1";
const REACT_VERSION = React.version;

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

const ALL_BGS = Object.values(BACKGROUNDS).flat();

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

const CYCLE_INTERVALS = {
  '15s': 15000,
  '30s': 30000,
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  'Never': null
};

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Stay hungry, stay foolish.",
  "Simplicity is the ultimate sophistication.",
  "Every moment is a fresh beginning.",
  "Focus on the journey, not the destination.",
  "Make each day your masterpiece.",
  "Wherever you go, go with all your heart.",
  "Turn your wounds into wisdom.",
  "Do what you can, with what you have, where you are.",
  "Action is the foundational key to all success.",
  "It always seems impossible until it's done.",
  "Dream big and dare to fail.",
  "What we think, we become.",
  "Tough times never last, but tough people do.",
  "The best way out is always through.",
  "Don't wait. The time will never be just right.",
  "Everything you can imagine is real.",
  "Creativity takes courage.",
  "If you want to lift yourself up, lift up someone else.",
  "Be the change that you wish to see in the world."
];

// SECTION: Helpers
const getWeatherIcon = (shortForecast, isDay) => {
  if (!shortForecast) return <Cloud size={24} />;
  const forecast = shortForecast.toLowerCase();
  if (forecast.includes('snow') || forecast.includes('ice')) return <CloudSnow size={24} />;
  if (forecast.includes('thunder') || forecast.includes('storm')) return <CloudLightning size={24} />;
  if (forecast.includes('rain') || forecast.includes('shower') || forecast.includes('drizzle')) return <CloudRain size={24} />;
  if (forecast.includes('fog')) return <CloudFog size={24} />;
  if (forecast.includes('cloud') || forecast.includes('overcast')) return <Cloud size={24} />;
  if (forecast.includes('sun') || forecast.includes('clear')) return isDay ? <Sun size={24} /> : <Moon size={24} />;
  return isDay ? <Sun size={24} /> : <Moon size={24} />;
};

const getQuoteForToday = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return QUOTES[seed % QUOTES.length];
};

// SECTION: Main App
export default function App() {
  const [time, setTime] = useState(new Date());
  const [bgIndex, setBgIndex] = useState(0);
  const [weather, setWeather] = useState({ loading: true, data: null, error: null });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [easterEggMessage, setEasterEggMessage] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const versionClickCount = useRef(0);
  const versionClickTimer = useRef(null);
  const searchInputRef = useRef(null);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('newTabSettings');
    let parsed = {};
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) {}
    }
    return {
      category: 'nature',
      tempUnit: 'F',
      timeFormat: '12',
      searchEngine: 'Google',
      links: DEFAULT_LINKS,
      cycleInterval: '30s',
      pinnedBg: null,
      userName: '',
      showNotes: true,
      showQuote: false,
      notes: ['', '', '', '', ''],
      ...parsed
    };
  });

  useEffect(() => {
    localStorage.setItem('newTabSettings', JSON.stringify(settings));
  }, [settings]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Cycling
  useEffect(() => {
    if (settings.pinnedBg) return;
    const intervalTime = CYCLE_INTERVALS[settings.cycleInterval];
    if (!intervalTime) return;

    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS[settings.category].length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [settings.category, settings.cycleInterval, settings.pinnedBg]);

  useEffect(() => {
    if (!settings.pinnedBg) {
      setBgIndex(0);
    }
  }, [settings.category, settings.pinnedBg]);

  // Weather (NWS)
  useEffect(() => {
    const fetchNWSWeather = async (lat, lon) => {
      try {
        // 1. Get grid endpoint
        const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        if (!pointsRes.ok) {
          if (pointsRes.status === 404) throw new Error("Weather available for US locations only");
          throw new Error("Failed to fetch location data");
        }
        const pointsData = await pointsRes.json();
        const locationName = `${pointsData.properties.relativeLocation.properties.city}, ${pointsData.properties.relativeLocation.properties.state}`;
        const forecastHourlyUrl = pointsData.properties.forecastHourly;

        // 2. Get hourly forecast
        const forecastRes = await fetch(forecastHourlyUrl);
        if (!forecastRes.ok) throw new Error("Failed to fetch forecast");
        const forecastData = await forecastRes.json();
        
        const currentPeriod = forecastData.properties.periods[0];
        
        setWeather({
          loading: false,
          data: {
            location: locationName,
            tempF: currentPeriod.temperature,
            tempC: Math.round((currentPeriod.temperature - 32) * 5 / 9),
            condition: currentPeriod.shortForecast,
            isDay: currentPeriod.isDaytime
          },
          error: null
        });
      } catch (error) {
        setWeather({ loading: false, data: null, error: error.message });
      }
    };

    const getLocationAndWeather = () => {
      setWeather(prev => ({ ...prev, loading: true }));
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchNWSWeather(pos.coords.latitude, pos.coords.longitude),
          () => setWeather({ loading: false, data: null, error: "Enable location for weather" })
        );
      } else {
        setWeather({ loading: false, data: null, error: "Geolocation not supported" });
      }
    };

    getLocationAndWeather();
    const timer = setInterval(getLocationAndWeather, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setShowShortcuts(false);
      }
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === '?' && document.activeElement.tagName !== 'INPUT') {
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
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

  const updateNote = (index, value) => {
    const newNotes = [...settings.notes];
    newNotes[index] = value;
    updateSetting('notes', newNotes);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: settings.timeFormat === '12' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getGreeting = () => {
    const hour = time.getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    
    return settings.userName ? `${greeting}, ${settings.userName}` : greeting;
  };

  const handleVersionClick = () => {
    versionClickCount.current += 1;
    if (versionClickTimer.current) clearTimeout(versionClickTimer.current);
    
    if (versionClickCount.current >= 2) {
      triggerEasterEgg();
      versionClickCount.current = 0;
    } else {
      versionClickTimer.current = setTimeout(() => {
        versionClickCount.current = 0;
      }, 2000);
    }
  };

  const triggerEasterEgg = () => {
    if (easterEggActive) return;
    setEasterEggActive(true);
    setEasterEggMessage(true);
    
    // Generate confetti
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + 'vw',
      color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
      animationDuration: Math.random() * 2 + 1 + 's',
      animationDelay: Math.random() * 0.5 + 's'
    }));
    setConfetti(newConfetti);

    setTimeout(() => setEasterEggMessage(false), 3000);
    setTimeout(() => {
      setEasterEggActive(false);
      setConfetti([]);
    }, 4000);
  };

  const currentBg = settings.pinnedBg || BACKGROUNDS[settings.category][bgIndex];

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-['DM_Sans'] text-white selection:bg-white/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,400;9..40,500;9..40,700&display=swap');
        body { margin: 0; background: #000; }
        
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .easter-egg-bg {
          animation: pulse-bg 4s ease-in-out;
        }
        @keyframes pulse-bg {
          0% { transform: scale(1); filter: hue-rotate(0deg); }
          50% { transform: scale(1.1); filter: hue-rotate(90deg); }
          100% { transform: scale(1); filter: hue-rotate(0deg); }
        }
      `}} />

      {/* SECTION: Background */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentBg}
          src={currentBg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className={`absolute inset-0 h-full w-full object-cover ${easterEggActive ? 'easter-egg-bg' : ''}`}
          alt="Background"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/30" />

      {/* SECTION: Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute top-0 z-50 h-3 w-3 rounded-sm"
          style={{
            left: c.left,
            backgroundColor: c.color,
            animation: `confetti-fall ${c.animationDuration} linear ${c.animationDelay} forwards`
          }}
        />
      ))}

      <div className="relative z-10 flex h-full min-h-screen flex-col p-6">
        
        {/* SECTION: Header */}
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
              {!weather.loading && (
                <motion.div 
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
                  className="flex w-56 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md shadow-lg"
                >
                  {weather.error ? (
                    <span className="text-xs text-white/80 text-center">{weather.error}</span>
                  ) : weather.data ? (
                    <>
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-medium text-white/90 truncate pr-2">{weather.data.location}</span>
                        <span className="text-lg font-semibold">
                          {settings.tempUnit === 'C' ? weather.data.tempC : weather.data.tempF}°
                        </span>
                      </div>
                      <div className="mt-1 flex w-full items-center justify-between text-xs text-white/70">
                        <span className="truncate">{weather.data.condition}</span>
                        <div className="text-white/80">
                          {getWeatherIcon(weather.data.condition, weather.data.isDay)}
                        </div>
                      </div>
                    </>
                  ) : null}
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

        {/* SECTION: Main Content (Clock, Search, Links) */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col items-center text-center drop-shadow-xl"
          >
            <h1 className="text-8xl font-extralight tracking-tight text-white sm:text-9xl">
              {easterEggMessage ? "👾 You found it" : formatTime(time)}
            </h1>
            <p className="mt-4 text-lg font-medium text-white/80 tracking-wide">
              {formatDate(time)}
            </p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-2 text-xl font-light text-white/90"
            >
              {getGreeting()}
            </motion.p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            onSubmit={handleSearch}
            className="group relative w-full max-w-xl mt-4"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 text-white/50 transition-colors group-focus-within:text-white/80">
              <Search size={20} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the web... (Press / to focus)"
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
            className="flex flex-wrap justify-center gap-6 mt-4"
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

        {/* SECTION: Footer Elements */}
        
        {/* Manual Next Background Button */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300">
          {settings.cycleInterval === 'Never' && !settings.pinnedBg && (
            <button 
              onClick={() => setBgIndex(prev => (prev + 1) % BACKGROUNDS[settings.category].length)}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-md hover:bg-white/20 hover:text-white"
            >
              <Shuffle size={16} /> Next Background
            </button>
          )}
        </div>

        {/* Daily Quote */}
        {settings.showQuote && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full max-w-2xl px-4">
            <p className="text-xs text-white/40 italic tracking-wide">"{getQuoteForToday()}"</p>
          </div>
        )}

        {/* Version Label */}
        <div 
          className="absolute bottom-4 right-4 text-[10px] text-white/30 cursor-default select-none hover:text-white/50 transition-colors"
          onClick={handleVersionClick}
        >
          v{VERSION}
        </div>

        {/* Notes Widget */}
        {settings.showNotes && (
          <div className="absolute bottom-6 left-6 flex flex-col items-start">
            <AnimatePresence>
              {settings.notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl w-64"
                >
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-white/80 mb-3">Quick Notes</h3>
                    {settings.notes.map((note, i) => (
                      <input
                        key={i}
                        type="text"
                        value={note}
                        onChange={(e) => updateNote(i, e.target.value)}
                        placeholder={`Note ${i + 1}...`}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => updateSetting('notesOpen', !settings.notesOpen)}
              className={`rounded-full border border-white/20 p-3 backdrop-blur-md transition-all shadow-lg ${settings.notesOpen ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'}`}
            >
              <StickyNote size={20} />
            </button>
          </div>
        )}

      </div>

      {/* SECTION: Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl border border-white/20 bg-black/60 p-6 backdrop-blur-xl shadow-2xl w-full max-w-sm"
            >
              <h3 className="text-lg font-medium text-white mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Focus Search</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-white/10 px-2 py-1 text-white/90">/</kbd>
                    <span className="text-white/50">or</span>
                    <kbd className="rounded bg-white/10 px-2 py-1 text-white/90">Ctrl+K</kbd>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Close Panels</span>
                  <kbd className="rounded bg-white/10 px-2 py-1 text-white/90">Esc</kbd>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Show Shortcuts</span>
                  <kbd className="rounded bg-white/10 px-2 py-1 text-white/90">?</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION: Settings Panel */}
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
                
                {/* User Name */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    value={settings.userName}
                    onChange={(e) => updateSetting('userName', e.target.value)}
                    placeholder="For daily greeting..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                  />
                </div>

                {/* Background Category */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Background Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(BACKGROUNDS).map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          updateSetting('category', cat);
                          updateSetting('pinnedBg', null);
                        }}
                        className={`rounded-xl border py-2 px-4 text-sm font-medium capitalize transition-all ${
                          settings.category === cat && !settings.pinnedBg
                            ? 'border-white/50 bg-white/20 text-white' 
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Cycle Interval */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Cycle Interval</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(CYCLE_INTERVALS).map(interval => (
                      <button
                        key={interval}
                        onClick={() => updateSetting('cycleInterval', interval)}
                        className={`rounded-xl border py-2 text-sm font-medium transition-all ${
                          settings.cycleInterval === interval 
                            ? 'border-white/50 bg-white/20 text-white' 
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Choose Image Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Choose Image</label>
                    {settings.pinnedBg && (
                      <button 
                        onClick={() => updateSetting('pinnedBg', null)}
                        className="text-xs text-white/60 hover:text-white underline"
                      >
                        Resume cycling
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {ALL_BGS.map((bg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => updateSetting('pinnedBg', bg)}
                        className={`relative aspect-video cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                          settings.pinnedBg === bg ? 'border-white' : 'border-transparent hover:border-white/50'
                        }`}
                      >
                        <img src={bg} alt="thumbnail" loading="lazy" className="h-full w-full object-cover" />
                        {settings.pinnedBg === bg && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Check size={20} className="text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Preferences</label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-sm text-white/80">Show Notes Widget</span>
                      <input 
                        type="checkbox" 
                        checked={settings.showNotes}
                        onChange={(e) => updateSetting('showNotes', e.target.checked)}
                        className="accent-white/50"
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition-colors">
                      <span className="text-sm text-white/80">Show Daily Quote</span>
                      <input 
                        type="checkbox" 
                        checked={settings.showQuote}
                        onChange={(e) => updateSetting('showQuote', e.target.checked)}
                        className="accent-white/50"
                      />
                    </label>
                  </div>
                </div>

                {/* Time Format */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Time Format</label>
                  <div className="flex gap-2">
                    {['12', '24'].map(format => (
                      <button
                        key={format}
                        onClick={() => updateSetting('timeFormat', format)}
                        className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-all ${
                          settings.timeFormat === format 
                            ? 'border-white/50 bg-white/20 text-white' 
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {format}-hour
                      </button>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
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

                {/* Search Engine */}
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

                {/* Quick Links */}
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

                {/* Changelog */}
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Changelog</label>
                    <span className="text-xs text-white/40">React v{REACT_VERSION}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                    <div className="font-semibold text-white mb-2">Version {VERSION}</div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Added NWS Weather integration</li>
                      <li>Added custom background cycle intervals</li>
                      <li>Added pinned image gallery</li>
                      <li>Added daily greeting & quote</li>
                      <li>Added sticky notes widget</li>
                      <li>Added keyboard shortcuts</li>
                    </ul>
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
