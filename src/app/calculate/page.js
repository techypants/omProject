'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, RotateCcw, Award, Brain, Calculator, ArrowRight, 
  CheckCircle, XCircle, Activity, Zap, Star, Trophy, 
  BookOpen, Lightbulb, Settings, ChevronRight, Hash, Wind, Zap as Lightning,
  Moon, Sun, TrendingUp, Clock, Target
} from 'lucide-react';

// --- OPERATION CONSTANTS ---

const OPERATIONS = {
  ADD: 'addition',
  SUB: 'subtraction',
  MULT: 'multiplication',
  DIV: 'division',
  BODMAS: 'bodmas'
};

// --- BADGE CONSTANTS (Shared) ---

const BADGES = [
  { id: 'first_steps', name: 'First Breath', icon: '🍃', desc: 'Complete your first session', condition: (stats) => stats.totalGames >= 1 },
  { id: 'speed_demon', name: 'Thunder Bolt', icon: '⚡', desc: 'Answer in under 2 seconds', condition: (stats) => stats.fastestAnswer <= 2 && stats.fastestAnswer > 0 },
  { id: 'perfect_streak', name: 'Total Concentration', icon: '🔥', desc: 'Get 100% accuracy in a session', condition: (stats) => stats.perfectSessions >= 1 },
  { id: 'scholar', name: 'Wisteria Master', icon: '🌸', desc: 'Reach Hashira (Level 5)', condition: (stats) => stats.level >= 5 },
  { id: 'night_owl', name: 'Night Watch', icon: '🌙', desc: 'Practice after 10 PM', condition: (stats) => stats.lateNightGames >= 1 },
];

// --- THEME & LEVEL CONFIGURATIONS ---

// 1. Demon Slayer Configuration (Dark Mode)
const DEMON_SLAYER_THEME = {
  DARK_BG: 'bg-gray-900',
  DARK_TEXT: 'text-gray-100',
  ACCENT_TEAL: 'text-teal-400',
  ACCENT_RED: 'text-red-500',
  ACCENT_BG_RED: 'bg-red-600',
  ACCENT_BG_TEAL: 'bg-teal-500',
  ACCENT_RING_TEAL: 'focus-visible:ring-teal-400',
  BUTTON_PRIMARY: "bg-gray-800 text-gray-100 hover:bg-red-800 shadow-lg shadow-gray-700/50",
  CARD_DEFAULT: "rounded-xl border border-gray-700 bg-gray-800 text-gray-100 shadow-2xl",
};

const DEMON_SLAYER_LEVELS = [
  { id: 1, name: "Mizunoto", description: "Water Breathing: Addition & Subtraction (1-10)", ops: [OPERATIONS.ADD, OPERATIONS.SUB], range: [1, 10], terms: 2, timeLimit: 15, xpMultiplier: 1, colorClass: "text-blue-400" },
  { id: 2, name: "Hinoto", description: "Thunder Breathing: Intro to Mult & Div (2-12)", ops: [OPERATIONS.MULT, OPERATIONS.DIV], range: [2, 12], terms: 2, timeLimit: 20, xpMultiplier: 1.5, colorClass: "text-yellow-400" },
  { id: 3, name: "Kanoe", description: "Mist Breathing: Mixed Ops & Larger Numbers (10-50)", ops: [OPERATIONS.ADD, OPERATIONS.SUB, OPERATIONS.MULT, OPERATIONS.DIV], range: [10, 50], terms: 2, timeLimit: 25, xpMultiplier: 2, colorClass: "text-gray-400" },
  { id: 4, name: "Tsuchinoto", description: "Flame Breathing: Complex Mixed Operations (20-100)", ops: [OPERATIONS.ADD, OPERATIONS.SUB, OPERATIONS.MULT, OPERATIONS.DIV], range: [20, 100], terms: 2, timeLimit: 30, xpMultiplier: 3, colorClass: "text-red-500" },
  { id: 5, name: "Hashira", description: "Sun Breathing: BODMAS & Logic Chains (Pillar Rank)", ops: [OPERATIONS.BODMAS], range: [5, 20], terms: 3, timeLimit: 45, xpMultiplier: 5, colorClass: "text-amber-300" }
];

// 2. Normal Configuration (Dark Mode)
const NORMAL_THEME = {
  DARK_BG: 'bg-gray-800', // Dark
  DARK_TEXT: 'text-gray-100', // Light
  ACCENT_TEAL: 'text-indigo-400', // Adjusted accent color for better visibility on dark bg
  ACCENT_RED: 'text-red-500',
  ACCENT_BG_RED: 'bg-red-600',
  ACCENT_BG_TEAL: 'bg-indigo-600',
  ACCENT_RING_TEAL: 'focus-visible:ring-indigo-500',
  BUTTON_PRIMARY: "bg-indigo-700 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/50",
  CARD_DEFAULT: "rounded-xl border border-gray-700 bg-gray-900 text-gray-100 shadow-2xl",
};

const NORMAL_LEVELS = [
  { id: 1, name: "Easy", description: "Standard: Addition & Subtraction (1-10)", ops: [OPERATIONS.ADD, OPERATIONS.SUB], range: [1, 10], terms: 2, timeLimit: 15, xpMultiplier: 1, colorClass: "text-green-400" },
  { id: 2, name: "Medium", description: "Standard: Intro to Mult & Div (2-12)", ops: [OPERATIONS.MULT, OPERATIONS.DIV], range: [2, 12], terms: 2, timeLimit: 20, xpMultiplier: 1.5, colorClass: "text-blue-400" },
  { id: 3, name: "Hard", description: "Advanced: Mixed Ops & Larger Numbers (10-50)", ops: [OPERATIONS.ADD, OPERATIONS.SUB, OPERATIONS.MULT, OPERATIONS.DIV], range: [10, 50], terms: 2, timeLimit: 25, xpMultiplier: 2, colorClass: "text-purple-400" },
  { id: 4, name: "Expert", description: "Expert: Complex Mixed Operations (20-100)", ops: [OPERATIONS.ADD, OPERATIONS.SUB, OPERATIONS.MULT, OPERATIONS.DIV], range: [20, 100], terms: 2, timeLimit: 30, xpMultiplier: 3, colorClass: "text-orange-400" },
  { id: 5, name: "Master", description: "Master: BODMAS & Logic Chains", ops: [OPERATIONS.BODMAS], range: [5, 20], terms: 3, timeLimit: 45, xpMultiplier: 5, colorClass: "text-red-400" }
];


// --- DESIGN SYSTEM (Dynamic) ---

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Dynamic components simplified for dark mode only
const DynamicButton = ({ children, variant = "default", size = "default", className, currentTheme, theme, ...props }) => {
  const variants = {
    default: currentTheme.BUTTON_PRIMARY,
    outline: cn("border", theme === 'demonSlayer' ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-100" : "border-indigo-500 bg-gray-900 hover:bg-gray-800 text-indigo-400"),
    ghost: cn("hover:bg-gray-700", theme === 'demonSlayer' ? "text-gray-400" : "text-gray-300 hover:bg-gray-800"),
    secondary: "bg-gray-700 text-gray-100 hover:bg-gray-600",
    destructive: "bg-red-700 text-white hover:bg-red-800",
    themed: cn(currentTheme.ACCENT_BG_TEAL, "text-white hover:opacity-90"),
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-12 rounded-md px-8 text-lg",
    icon: "h-10 w-10",
  };
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-current transition-colors focus-visible:outline-none focus-visible:ring-2",
        currentTheme.ACCENT_RING_TEAL,
        "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const DynamicCard = ({ children, className, currentTheme, ...props }) => (
  <div className={cn(currentTheme.CARD_DEFAULT, className)} {...props}>
    {children}
  </div>
);

const DynamicBadge = ({ children, variant = "default", currentTheme }) => {
  const variants = {
    default: cn(currentTheme.DARK_BG, "border-transparent text-gray-50"),
    secondary: cn("bg-gray-700 text-gray-100"),
    outline: cn(currentTheme.DARK_TEXT, "border-gray-700"),
    success: "border-transparent bg-green-600 text-white",
    gold: "border-transparent bg-amber-500 text-gray-900",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2", variants[variant])}>
      {children}
    </div>
  );
};


// --- MATH UTILITIES ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestion = (levelConfig, forcedOp = null) => {
  const op = forcedOp || levelConfig.ops[getRandomInt(0, levelConfig.ops.length - 1)];
  const { range } = levelConfig;

  let num1, num2, num3, question, answer, hint;

  switch (op) {
    case OPERATIONS.ADD:
      num1 = getRandomInt(range[0], range[1]);
      num2 = getRandomInt(range[0], range[1]);
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
      hint = `Start with ${Math.max(num1, num2)} and count up by ${Math.min(num1, num2)}.`;
      break;

    case OPERATIONS.SUB:
      num1 = getRandomInt(range[0], range[1]);
      num2 = getRandomInt(range[0], num1); 
      question = `${num1} - ${num2}`;
      answer = num1 - num2;
      hint = `Think: What number plus ${num2} equals ${num1}?`;
      break;

    case OPERATIONS.MULT:
      num1 = getRandomInt(Math.max(2, range[0] / 2), Math.min(12, range[1])); 
      num2 = getRandomInt(2, 12);
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
      hint = `This is ${num1} added together ${num2} times.`;
      break;

    case OPERATIONS.DIV:
      num2 = getRandomInt(2, 12);
      answer = getRandomInt(2, 12);
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2}`;
      hint = `Think: How many times does ${num2} fit into ${num1}?`;
      break;

    case OPERATIONS.BODMAS:
      num1 = getRandomInt(2, 10);
      num2 = getRandomInt(2, 10);
      num3 = getRandomInt(2, 5);
      if (Math.random() > 0.5) {
        question = `${num1} + ${num2} × ${num3}`;
        answer = num1 + (num2 * num3);
        hint = `Multiply ${num2} × ${num3} first, then add ${num1}.`;
      } else {
        question = `(${num1} + ${num2}) × ${num3}`;
        answer = (num1 + num2) * num3;
        hint = `Do the brackets (${num1} + ${num2}) first, then multiply by ${num3}.`;
      }
      break;
      
    default:
      return generateQuestion(levelConfig, OPERATIONS.ADD);
  }

  return {
    id: Date.now() + Math.random(),
    text: question,
    answer: answer,
    type: op,
    hint: hint,
    userAnswer: null,
    isCorrect: false,
    timeSpent: 0
  };
};

const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
const calculateNextLevelXp = (level) => Math.pow(level, 2) * 100;

// --- MAIN COMPONENT ---

export default function MathMasterApp() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, learning, report, zen
  const [gameMode, setGameMode] = useState('challenge'); // challenge, learning, zen
  const [theme, setTheme] = useState('demonSlayer');
  
  const [profile, setProfile] = useState({
    xp: 0,
    level: 1,
    badges: [],
    stats: {
      totalGames: 0,
      fastestAnswer: 999,
      perfectSessions: 0,
      lateNightGames: 0
    }
  });

  const [currentLevel, setCurrentLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [isRemediation, setIsRemediation] = useState(false);

  const timerRef = useRef(null);
  
  // Dynamic Configuration Selector
  const { currentTheme, currentLevels } = useMemo(() => {
    if (theme === 'normal') {
      return {
        currentTheme: NORMAL_THEME,
        currentLevels: NORMAL_LEVELS,
      };
    }
    // Default to Demon Slayer
    return {
      currentTheme: DEMON_SLAYER_THEME,
      currentLevels: DEMON_SLAYER_LEVELS,
    };
  }, [theme]);
  
  const themeName = theme === 'demonSlayer' ? 'Demon Slayer Corps' : 'Normal Mode';
  const rankLabel = theme === 'demonSlayer' ? 'Demon Slayer Rank' : 'Skill Level';
  const rankIcon = theme === 'demonSlayer' ? <Trophy className={currentTheme.ACCENT_RED} /> : <Brain className={currentTheme.ACCENT_TEAL} />;
  const rankClass = theme === 'demonSlayer' ? 'Total Concentration: Challenge Mode' : 'Standard Challenge Mode';
  const learningClass = theme === 'demonSlayer' ? 'Breathing Techniques: Learning Mode' : 'Focused Practice';
  const zenClass = theme === 'demonSlayer' ? 'Zen Mode (No Demon Threat)' : 'Endless Training';

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('mathMasterProfile');
    if (saved) setProfile(JSON.parse(saved));
    const savedTheme = localStorage.getItem('mathMasterTheme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('mathMasterProfile', JSON.stringify(profile));
    localStorage.setItem('mathMasterTheme', theme);
  }, [profile, theme]);
  
  // Theme Toggle Function
  const toggleTheme = () => {
    const newTheme = theme === 'demonSlayer' ? 'normal' : 'demonSlayer';
    setTheme(newTheme);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' && gameState !== 'learning' && gameState !== 'zen') return;

      if (e.key >= '0' && e.key <= '9') {
        if (input.length < 5) setInput(prev => prev + e.key);
      } else if (e.key === 'Backspace') {
        setInput(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (input) {
          if (gameState === 'playing' || gameState === 'zen') submitAnswer(input);
          if (gameState === 'learning') checkLearningAnswer(input);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, input, questions, currentIndex, currentLevels]);

  // --- GAME LOGIC ---

  const startGame = (level, mode = 'challenge', specificOps = null) => {
    setCurrentLevel(level);
    setIsRemediation(!!specificOps);
    setGameMode(mode);
    
    // Generate questions
    const qCount = mode === 'learning' ? 5 : (mode === 'zen' ? 1 : 10);
    const newQuestions = Array.from({ length: qCount }).map(() => {
      const opToUse = specificOps ? specificOps[getRandomInt(0, specificOps.length - 1)] : null;
      return generateQuestion(level, opToUse);
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setInput('');
    setHistory([]);
    setShowHint(false);

    if (mode === 'learning') {
      setGameState('learning');
    } else if (mode === 'zen') {
      setGameState('zen');
    } else {
      setGameState('playing');
      startQuestionTimer(level.timeLimit);
    }
  };

  const startQuestionTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => submitAnswer(null, true);

  const submitAnswer = (val, isTimeout = false) => {
    const currentQ = questions[currentIndex];
    const numVal = parseInt(val, 10);
    const isCorrect = !isTimeout && numVal === currentQ.answer;
    
    // Set timeSpent to full time limit on timeout, or calculate spent time if answered
    const timeSpent = isTimeout ? currentLevel.timeLimit : currentLevel.timeLimit - timeLeft;
    
    // Record history
    const historyEntry = {
      ...currentQ,
      userAnswer: isTimeout ? 'Timeout' : numVal,
      isCorrect: isCorrect,
      // TimeSpent is now guaranteed to be a number (full limit for timeout, or actual time)
      timeSpent: timeSpent 
    };

    const newHistory = [...history, historyEntry];
    setHistory(newHistory);

    // Logic for next question
    if (currentIndex < questions.length - 1) {
      // Standard progression
      setCurrentIndex(prev => prev + 1);
      setInput('');
      if (gameMode === 'challenge') startQuestionTimer(currentLevel.timeLimit);
    } else {
      // End of array reached
      if (gameMode === 'zen') {
        // Infinite mode: Add new question and continue
        const nextQ = generateQuestion(currentLevel);
        setQuestions(prev => [...prev, nextQ]);
        setCurrentIndex(prev => prev + 1);
        setInput('');
      } else {
        // Finish Game
        finishGame(newHistory);
      }
    }
  };

  const checkLearningAnswer = (val) => {
    const currentQ = questions[currentIndex];
    const numVal = parseInt(val, 10);
    
    if (numVal === currentQ.answer) {
      // Correct!
      const historyEntry = { ...currentQ, isCorrect: true };
      const newHistory = [...history, historyEntry];
      setHistory(newHistory);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setInput('');
        setShowHint(false);
      } else {
        // Just return to menu for learning mode, minimal stats
        setGameState('menu'); 
      }
    } else {
      // Wrong - shake effect or visual feedback could go here
      // For now, just clear input
      setInput('');
      // Maybe show hint automatically?
    }
  };

  const finishGame = (finalHistory) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate rewards
    const correctCount = finalHistory.filter(h => h.isCorrect).length;
    const accuracy = (correctCount / finalHistory.length) * 100;
    const xpEarned = Math.round(correctCount * 10 * currentLevel.xpMultiplier);
    
    // Update Stats
    const newStats = { ...profile.stats };
    newStats.totalGames += 1;
    if (accuracy === 100) newStats.perfectSessions += 1;
    
    // Find fastest correct, non-timeout answer
    const correctTimes = finalHistory.filter(h => h.isCorrect).map(h => h.timeSpent);
    const gameFastest = correctTimes.length > 0 ? Math.min(...correctTimes) : 0;

    if (gameFastest > 0 && gameFastest < newStats.fastestAnswer) newStats.fastestAnswer = gameFastest;
    
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 4) newStats.lateNightGames += 1;

    // Check Badges
    const newBadges = [...profile.badges];
    BADGES.forEach(badge => {
      if (!newBadges.includes(badge.id) && badge.condition(newStats)) {
        newBadges.push(badge.id);
      }
    });

    // Update Profile
    setProfile(prev => ({
      ...prev,
      xp: prev.xp + xpEarned,
      level: calculateLevel(prev.xp + xpEarned),
      badges: newBadges,
      stats: newStats
    }));

    setHistory(finalHistory);
    setGameState('report');
  };

  // --- RENDER HELPERS ---

  const handleKeypad = (num) => {
    if (input.length < 5) setInput(prev => prev + num);
  };

  // --- VIEWS ---

  if (gameState === 'menu') {
    const nextLevelXp = calculateNextLevelXp(profile.level);
    const prevLevelXp = calculateNextLevelXp(profile.level - 1);
    const levelProgress = ((profile.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

    return (
      <div className={cn("min-h-screen p-4 md:p-8 font-sans pb-20", currentTheme.DARK_BG, currentTheme.DARK_TEXT)}>
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Theme Toggle */}
          <div className="flex justify-end">
            <DynamicButton 
              currentTheme={currentTheme}
              theme={theme}
              variant="outline" 
              size="sm" 
              onClick={toggleTheme} 
              className={cn("border-2", theme === 'demonSlayer' ? "border-red-500 text-red-400" : "border-indigo-500 text-indigo-400")}
            >
              {theme === 'demonSlayer' ? (
                <span className="flex items-center gap-2">
                  <Moon className="w-4 h-4" /> Switch to Normal Mode
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Switch to Demon Slayer
                </span>
              )}
            </DynamicButton>
          </div>
          
          <h1 className="text-3xl font-black mb-6 text-center">{themeName}</h1>

          {/* Header Profile Section */}
          <DynamicCard currentTheme={currentTheme} className={cn("flex flex-col md:flex-row gap-6 items-center justify-between p-6 shadow-xl", theme === 'demonSlayer' ? "border-red-900/50" : "border-indigo-900/50")}>
            <div className="flex items-center gap-4">
              <div className={cn("h-16 w-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg", currentTheme.ACCENT_BG_TEAL, "text-gray-900 shadow-teal-500/30")}>
                {profile.level}
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">{rankLabel} <DynamicBadge currentTheme={currentTheme} variant="gold">{profile.xp} XP</DynamicBadge></h2>
                <div className="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className={cn("h-full transition-all duration-500", currentTheme.ACCENT_BG_RED)} style={{ width: `${Math.max(5, Math.min(100, levelProgress))}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Next Rank: {nextLevelXp - profile.xp} XP needed</p>
              </div>
            </div>
            
            {/* Badges Mini View */}
            <div className="flex gap-2">
              {profile.badges.length === 0 && <span className="text-sm text-gray-500 italic">Complete Missions to earn Badges!</span>}
              {profile.badges.map(bid => {
                const b = BADGES.find(x => x.id === bid);
                return (
                  <div key={bid} className={cn("h-10 w-10 rounded-full flex items-center justify-center text-xl shadow-sm border", "bg-gray-700 border-gray-600")} title={b.name}>
                    {b.icon}
                  </div>
                );
              })}
            </div>
          </DynamicCard>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Challenge Mode */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                {rankIcon}
                <h3 className="text-lg font-bold">{rankClass}</h3>
              </div>
              <div className="grid gap-4">
                {currentLevels.map((level) => (
                  <DynamicCard key={level.id} currentTheme={currentTheme} className={cn("p-4 transition-shadow group cursor-pointer relative overflow-hidden", theme === 'demonSlayer' ? "hover:border-teal-500" : "hover:border-indigo-500")} onClick={() => startGame(level)}>
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <h4 className={cn("font-bold", level.colorClass)}>{level.name}</h4>
                        <p className="text-sm text-gray-400">{level.description}</p>
                      </div>
                      <DynamicButton currentTheme={currentTheme} theme={theme} variant="ghost" size="icon" className={cn("group-hover:translate-x-1 transition-transform", currentTheme.ACCENT_TEAL)}>
                        <ChevronRight />
                      </DynamicButton>
                    </div>
                    {/* Background decoration */}
                    {theme === 'demonSlayer' && (
                      <div className="absolute -right-4 -bottom-4 opacity-5 text-gray-500 rotate-12 group-hover:scale-110 transition-transform">
                        <Lightning size={80} />
                      </div>
                    )}
                  </DynamicCard>
                ))}
              </div>
            </section>

            {/* Other Modes */}
            <section className="space-y-6">
              {/* Learning Mode */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className={currentTheme.ACCENT_TEAL} />
                  <h3 className="text-lg font-bold">{learningClass}</h3>
                </div>
                <DynamicCard currentTheme={currentTheme} className={cn("p-6", theme === 'demonSlayer' ? "bg-gray-800 border-teal-800/50" : "bg-gray-800 border-indigo-800/50")}>
                  <p className={cn("mb-6 text-sm leading-relaxed", "text-gray-300")}>
                    Practice the fundamentals without the pressure of a timer. Master each form step-by-step.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {currentLevels.slice(0, 4).map(l => (
                      <DynamicButton 
                        key={l.id} 
                        currentTheme={currentTheme}
                        theme={theme}
                        onClick={() => startGame(l, 'learning')} 
                        variant="outline" 
                        className={cn(theme === 'demonSlayer' ? "bg-gray-700 hover:bg-gray-600 text-teal-400 border-teal-800" : "bg-gray-700 hover:bg-gray-600 text-indigo-400 border-indigo-800")}
                      >
                        {l.name}
                      </DynamicButton>
                    ))}
                  </div>
                </DynamicCard>
              </div>

              {/* Zen Mode */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="text-green-400" />
                  <h3 className="text-lg font-bold">{zenClass}</h3>
                </div>
                <DynamicCard currentTheme={currentTheme} className={cn("p-6", theme === 'demonSlayer' ? "bg-gray-800 border-green-800/50" : "bg-gray-800 border-green-800/50")}>
                  <p className={cn("mb-6 text-sm leading-relaxed", "text-gray-300")}>
                    Infinite training with no time limit or score. Perfect your technique in a calm, focused environment.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {currentLevels.map(l => (
                      <DynamicButton 
                        key={l.id} 
                        currentTheme={currentTheme}
                        theme={theme}
                        onClick={() => startGame(l, 'zen')} 
                        variant="outline" 
                        className={cn("bg-gray-700 hover:bg-gray-600 text-green-400 border-green-800")}
                      >
                        {l.name}
                      </DynamicButton>
                    ))}
                  </div>
                </DynamicCard>
              </div>
            </section>
          </div>
          
          {/* Project Description Section */}
          <section className="pt-8">
            <DynamicCard currentTheme={currentTheme} className="p-6">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-3">
                <Activity className={currentTheme.ACCENT_TEAL} /> Why Mental Math Matters
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Mental arithmetic is more than just speed—it’s about enhancing core cognitive skills. Regularly challenging yourself to calculate without external tools strengthens pattern recognition, improves concentration, and boosts overall logical reasoning. These skills are invaluable not just in academic math, but in everyday decision-making, finance, and problem-solving.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                  <div className="space-y-1">
                      <TrendingUp className={`${currentTheme.ACCENT_RED} mx-auto`} size={24} />
                      <p className="text-xs font-semibold">Cognitive Boost</p>
                  </div>
                  <div className="space-y-1">
                      <Clock className={`${currentTheme.ACCENT_RED} mx-auto`} size={24} />
                      <p className="text-xs font-semibold">Speed Training</p>
                  </div>
                  <div className="space-y-1">
                      <Target className={`${currentTheme.ACCENT_RED} mx-auto`} size={24} />
                      <p className="text-xs font-semibold">Focused Practice</p>
                  </div>
              </div>
              <p className="text-sm mt-4 italic text-gray-500">
                MathMaster is designed to make this training engaging, using gamification (XP, ranks, themes) to turn practice into a focused, rewarding challenge. Start your training today and master the forms of mental calculation!
              </p>
            </DynamicCard>
          </section>

        </div>
      </div>
    );
  }

  // --- PLAYING & LEARNING & ZEN VIEW ---
  
  if (gameState === 'playing' || gameState === 'learning' || gameState === 'zen') {
    const currentQ = questions[currentIndex];
    const isLearning = gameState === 'learning';
    const isZen = gameState === 'zen';
    const levelConfig = currentLevels.find(l => l.id === currentLevel.id);
    const levelColor = levelConfig?.colorClass || currentTheme.ACCENT_TEAL;
    const levelName = levelConfig?.name || 'Level';
    const headerText = theme === 'demonSlayer' ? `${levelName} Form` : levelName;

    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-4", currentTheme.DARK_BG, currentTheme.DARK_TEXT)}>
        <div className="w-full max-w-md space-y-6">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <DynamicButton 
              currentTheme={currentTheme} 
              theme={theme}
              variant="ghost" 
              size="sm" 
              onClick={() => { if(timerRef.current) clearInterval(timerRef.current); setGameState('menu'); }} 
              className="text-gray-400"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> {theme === 'demonSlayer' ? 'Flee' : 'Exit'}
            </DynamicButton>
            <div className={cn("font-mono text-sm font-medium px-3 py-1 rounded-full border", "bg-gray-800 border-gray-700 text-gray-300")}>
              {isZen ? (
                <span className="flex items-center gap-2 text-green-400"><Wind className="w-3 h-3" /> Infinity</span>
              ) : (
                `${currentIndex + 1} / ${questions.length}`
              )}
            </div>
          </div>

          {/* Game Card */}
          <DynamicCard currentTheme={currentTheme} className={cn("p-8 text-center relative overflow-hidden shadow-2xl", theme === 'demonSlayer' ? "shadow-red-900/20 border-red-800/50" : "shadow-indigo-900/20 border-indigo-400/50")}>
            {/* Timer (only for playing) */}
            {!isLearning && !isZen && (
              <div 
                className={`absolute top-0 left-0 h-1.5 transition-all duration-1000 linear ${timeLeft < 5 ? currentTheme.ACCENT_BG_RED : currentTheme.ACCENT_BG_TEAL}`}
                style={{ width: `${(timeLeft / currentLevel.timeLimit) * 100}%` }}
              />
            )}

            <div className="mb-8 mt-2">
              <span className={cn("text-xs font-bold tracking-wider uppercase", levelColor)}>{headerText}</span>
              <div className="text-6xl font-black mt-4 tracking-tight flex justify-center items-baseline gap-4 text-gray-100">
                {currentQ.text}
              </div>
            </div>

            {/* Hint Area for Learning Mode */}
            {isLearning && (
              <div className="min-h-[60px] mb-4 flex items-center justify-center">
                {showHint ? (
                  <div className={cn("text-sm px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2", theme === 'demonSlayer' ? "text-teal-400 bg-teal-900/30 border border-teal-800" : "text-indigo-400 bg-indigo-900/30 border border-indigo-800")}>
                    <Lightbulb className="inline w-4 h-4 mr-1" /> {currentQ.hint}
                  </div>
                ) : (
                  <DynamicButton currentTheme={currentTheme} theme={theme} variant="ghost" size="sm" onClick={() => setShowHint(true)} className={theme === 'demonSlayer' ? "text-gray-400 hover:text-teal-400" : "text-gray-400 hover:text-indigo-400"}>
                    Need a hint?
                  </DynamicButton>
                )}
              </div>
            )}

            {/* Input Display */}
            <div className={cn(
              "h-20 mb-8 rounded-2xl flex items-center justify-center border-2 transition-colors",
              theme === 'demonSlayer' ? 
                (input ? "border-red-600 bg-gray-700" : "border-gray-700 bg-gray-800") :
                (input ? "border-red-600 bg-gray-700" : "border-gray-700 bg-gray-800")
            )}>
              <span className={cn("text-5xl font-bold", input ? currentTheme.ACCENT_RED : "text-gray-500")}>
                {input || '?'}
              </span>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeypad(num)}
                  className={cn("h-14 rounded-xl shadow-lg active:translate-y-0.5 text-xl font-bold transition-all", "bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-100")}
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => setInput(prev => prev.slice(0, -1))}
                className="h-14 rounded-xl bg-red-800 hover:bg-red-700 border border-red-900 text-white flex items-center justify-center transition-colors shadow-lg"
              >
                ⌫
              </button>
              <button
                onClick={() => handleKeypad(0)}
                className={cn("h-14 rounded-xl shadow-lg active:translate-y-0.5 text-xl font-bold transition-all", "bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-100")}
              >
                0
              </button>
              <DynamicButton
                currentTheme={currentTheme}
                theme={theme}
                onClick={() => isLearning ? checkLearningAnswer(input) : submitAnswer(input)}
                disabled={!input}
                className={cn("h-14 rounded-xl text-white flex items-center justify-center transition-colors shadow-lg", theme === 'demonSlayer' ? "shadow-teal-500/50" : "shadow-indigo-500/50")}
                variant="themed"
              >
                {isLearning ? <ArrowRight /> : <CheckCircle />}
              </DynamicButton>
            </div>
            
            <p className={cn("text-xs mt-6 hidden md:block", "text-gray-500")}>
              {theme === 'demonSlayer' ? 'Total Concentration... use your keyboard number pad!' : 'Use your keyboard number pad!'}
            </p>
          </DynamicCard>
        </div>
      </div>
    );
  }

  // --- REPORT VIEW ---

  if (gameState === 'report') {
    const stats = analyzePerformance(history);
    const xpEarned = Math.round(stats.correct * 10 * currentLevel.xpMultiplier);

    return (
      <div className={cn("min-h-screen flex items-center justify-center p-4", currentTheme.DARK_BG, currentTheme.DARK_TEXT)}>
        <div className="max-w-xl w-full">
          <DynamicCard currentTheme={currentTheme} className={cn("overflow-hidden", theme === 'demonSlayer' ? "border-teal-800/50" : "border-indigo-400/50")}>
            <div className={cn("p-8 text-center", currentTheme.ACCENT_BG_RED)}>
              <h2 className="text-2xl font-bold mb-2 opacity-90 text-white">{theme === 'demonSlayer' ? 'Mission Report' : 'Session Summary'}</h2>
              <div className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-red-300">
                {stats.accuracy}%
              </div>
              <div className="flex justify-center gap-2 mt-4">
                 <DynamicBadge currentTheme={currentTheme} variant="gold">+{xpEarned} XP</DynamicBadge>
                 {stats.accuracy === 100 && <DynamicBadge currentTheme={currentTheme} variant="success">{theme === 'demonSlayer' ? 'Demon Slain!' : 'Perfect Score!'}</DynamicBadge>}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className={cn("p-4 rounded-xl border", "bg-gray-700 border-green-700")}>
                  <div className={cn("text-sm font-medium", "text-green-400")}>{theme === 'demonSlayer' ? 'Successful Strikes' : 'Correct Answers'}</div>
                  <div className={cn("text-2xl font-bold", "text-green-400")}>{stats.correct}</div>
                </div>
                <div className={cn("p-4 rounded-xl border", "bg-gray-700 border-red-700")}>
                  <div className={cn("text-sm font-medium", "text-red-400")}>{theme === 'demonSlayer' ? 'Missed Strikes' : 'Incorrect Answers'}</div>
                  <div className={cn("text-2xl font-bold", "text-red-400")}>{stats.total - stats.correct}</div>
                </div>
              </div>

              {/* Weakness Analysis */}
              {stats.weaknesses.length > 0 ? (
                <div className={cn("p-4 rounded-xl border", "bg-gray-800 border-red-700")}>
                  <h4 className={cn("font-bold mb-2 flex items-center gap-2", currentTheme.ACCENT_RED)}>
                    <Zap className="h-4 w-4" /> {theme === 'demonSlayer' ? 'Weak Points Identified' : 'Areas for Improvement'}
                  </h4>
                  <p className={cn("text-sm mb-4", "text-gray-300")}>
                    {theme === 'demonSlayer' ? 'You need to train harder on' : 'Focus practice on'} <strong>{stats.weaknesses.join(', ')}</strong>. 
                  </p>
                  <DynamicButton 
                    currentTheme={currentTheme}
                    theme={theme}
                    onClick={() => startGame(currentLevel, 'challenge', stats.weaknesses)}
                    className="w-full bg-red-700 hover:bg-red-800 border-transparent text-white"
                  >
                    {theme === 'demonSlayer' ? 'Rethink Strategy' : 'Try Again'}
                  </DynamicButton>
                </div>
              ) : (
                <div className={cn("text-center py-4", "text-gray-500")}>
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-300" />
                  <p>{theme === 'demonSlayer' ? 'Masterful! No weak points found on this mission.' : 'Excellent performance! Everything looks sharp.'}</p>
                </div>
              )}

              <DynamicButton currentTheme={currentTheme} theme={theme} onClick={() => setGameState('menu')} variant="outline" className="w-full">
                {theme === 'demonSlayer' ? 'Return to Headquarters' : 'Back to Main Menu'}
              </DynamicButton>
            </div>
          </DynamicCard>
        </div>
      </div>
    );
  }

  return null;
}

// --- Helper for Report ---
const analyzePerformance = (history) => {
  const analysis = {
    total: history.length,
    correct: history.filter(h => h.isCorrect).length,
    accuracy: 0,
    weaknesses: [],
    byType: {}
  };

  analysis.accuracy = Math.round((analysis.correct / analysis.total) * 100);

  history.forEach(q => {
    if (!analysis.byType[q.type]) analysis.byType[q.type] = { total: 0, correct: 0 };
    analysis.byType[q.type].total += 1;
    if (q.isCorrect) analysis.byType[q.type].correct += 1;
  });

  Object.keys(analysis.byType).forEach(type => {
    const stats = analysis.byType[type];
    if ((stats.correct / stats.total) < 0.7) analysis.weaknesses.push(type);
  });

  return analysis;
};