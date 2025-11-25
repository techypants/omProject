'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, RotateCcw, Award, Brain, Calculator, ArrowRight, 
  CheckCircle, XCircle, Activity, Zap, Star, Trophy, 
  BookOpen, Lightbulb, Settings, ChevronRight, Hash, Wind 
} from 'lucide-react';

// --- DESIGN SYSTEM (Shadcn-like) ---

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, variant = "default", size = "default", className, ...props }) => {
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "bg-red-500 text-white hover:bg-red-600",
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
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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

// FIX: Added ...props to Card to allow onClick events
const Card = ({ children, className, ...props }) => (
  <div className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    outline: "text-slate-950 border-slate-200",
    success: "border-transparent bg-green-500 text-white",
    gold: "border-transparent bg-yellow-500 text-white",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2", variants[variant])}>
      {children}
    </div>
  );
};

// --- CONFIGURATION & LOGIC ---

const OPERATIONS = {
  ADD: 'addition',
  SUB: 'subtraction',
  MULT: 'multiplication',
  DIV: 'division',
  BODMAS: 'bodmas'
};

const BADGES = [
  { id: 'first_steps', name: 'First Steps', icon: '🦶', desc: 'Complete your first session', condition: (stats) => stats.totalGames >= 1 },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Answer in under 2 seconds', condition: (stats) => stats.fastestAnswer <= 2 && stats.fastestAnswer > 0 },
  { id: 'perfect_streak', name: 'Perfectionist', icon: '🎯', desc: 'Get 100% accuracy in a session', condition: (stats) => stats.perfectSessions >= 1 },
  { id: 'scholar', name: 'Scholar', icon: '🎓', desc: 'Reach Level 5', condition: (stats) => stats.level >= 5 },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', desc: 'Practice after 10 PM', condition: (stats) => stats.lateNightGames >= 1 },
];

const LEVELS = [
  { id: 1, name: "Novice", description: "Addition & Subtraction (1-10)", ops: [OPERATIONS.ADD, OPERATIONS.SUB], range: [1, 10], terms: 2, timeLimit: 15, xpMultiplier: 1 },
  { id: 2, name: "Apprentice", description: "Intro to Mult & Div (2-12)", ops: [OPERATIONS.MULT, OPERATIONS.DIV], range: [2, 12], terms: 2, timeLimit: 20, xpMultiplier: 1.5 },
  { id: 3, name: "Adept", description: "Mixed Ops & Larger Numbers (10-50)", ops: [OPERATIONS.ADD, OPERATIONS.SUB, OPERATIONS.MULT, OPERATIONS.DIV], range: [10, 50], terms: 2, timeLimit: 25, xpMultiplier: 2 },
  { id: 4, name: "Master", description: "Complex Mixed Operations (20-100)", ops: [OPERATIONS.ADD, OPERATIONS.SUB, OPERATIONS.MULT, OPERATIONS.DIV], range: [20, 100], terms: 2, timeLimit: 30, xpMultiplier: 3 },
  { id: 5, name: "Grandmaster", description: "BODMAS & Logic Chains", ops: [OPERATIONS.BODMAS], range: [5, 20], terms: 3, timeLimit: 45, xpMultiplier: 5 }
];

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
  const inputRef = useRef(null); // For keyboard focus

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('mathMasterProfile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('mathMasterProfile', JSON.stringify(profile));
  }, [profile]);

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
  }, [gameState, input, questions, currentIndex]);

  // --- GAME LOGIC ---

  const startGame = (level, mode = 'challenge', specificOps = null) => {
    setCurrentLevel(level);
    setIsRemediation(!!specificOps);
    setGameMode(mode);
    
    // Generate questions
    // For Zen mode, we start with 1 and keep adding
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
    
    // Record history
    const historyEntry = {
      ...currentQ,
      userAnswer: isTimeout ? 'Timeout' : numVal,
      isCorrect: isCorrect,
      timeSpent: currentLevel.timeLimit - timeLeft
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
    
    const gameFastest = Math.min(...finalHistory.filter(h => h.isCorrect).map(h => h.timeSpent));
    if (gameFastest < newStats.fastestAnswer) newStats.fastestAnswer = gameFastest;
    
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Profile Section */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200">
                {profile.level}
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">Math Wizard <Badge variant="gold">{profile.xp} XP</Badge></h2>
                <div className="w-48 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.max(5, Math.min(100, levelProgress))}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">Next Level: {nextLevelXp - profile.xp} XP needed</p>
              </div>
            </div>
            
            {/* Badges Mini View */}
            <div className="flex gap-2">
              {profile.badges.length === 0 && <span className="text-sm text-slate-400 italic">Play to earn badges!</span>}
              {profile.badges.map(bid => {
                const b = BADGES.find(x => x.id === bid);
                return (
                  <div key={bid} className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-yellow-200" title={b.name}>
                    {b.icon}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Challenge Mode */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-yellow-500" />
                <h3 className="text-lg font-bold">Challenge Mode</h3>
              </div>
              <div className="grid gap-4">
                {LEVELS.map((level) => (
                  <Card key={level.id} className="p-4 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden" onClick={() => startGame(level)}>
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <h4 className="font-bold text-slate-800">{level.name}</h4>
                        <p className="text-sm text-slate-500">{level.description}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                        <ChevronRight />
                      </Button>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 rotate-12 group-hover:scale-110 transition-transform">
                      <Hash size={80} />
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Other Modes */}
            <section className="space-y-6">
              {/* Learning Mode */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="text-blue-500" />
                  <h3 className="text-lg font-bold">Learning Mode</h3>
                </div>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                  <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                    Practice without the pressure of a timer. Get hints, explanations, and visual aids.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {LEVELS.slice(0, 4).map(l => (
                      <Button key={l.id} onClick={() => startGame(l, 'learning')} variant="outline" className="bg-white/50 hover:bg-white text-blue-700 border-blue-200">
                        {l.name}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Zen Mode */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="text-teal-500" />
                  <h3 className="text-lg font-bold">Zen Mode</h3>
                </div>
                <Card className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
                  <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                    Infinite practice with no timer and no score. Just you and the math. Relax and focus.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {LEVELS.map(l => (
                      <Button key={l.id} onClick={() => startGame(l, 'zen')} variant="outline" className="bg-white/50 hover:bg-white text-teal-700 border-teal-200">
                        {l.name}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            </section>
          </div>

        </div>
      </div>
    );
  }

  // --- PLAYING & LEARNING & ZEN VIEW ---
  
  if (gameState === 'playing' || gameState === 'learning' || gameState === 'zen') {
    const currentQ = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;
    const isLearning = gameState === 'learning';
    const isZen = gameState === 'zen';

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={() => setGameState('menu')} className="text-slate-500">
              <RotateCcw className="mr-2 h-4 w-4" /> Quit
            </Button>
            <div className="font-mono text-sm font-medium bg-white px-3 py-1 rounded-full border">
              {isZen ? (
                <span className="flex items-center gap-2"><Wind className="w-3 h-3" /> ∞</span>
              ) : (
                `${currentIndex + 1} / ${questions.length}`
              )}
            </div>
          </div>

          {/* Game Card */}
          <Card className="p-8 text-center relative overflow-hidden shadow-xl border-slate-200/60">
            {/* Timer (only for playing) */}
            {!isLearning && !isZen && (
              <div 
                className={`absolute top-0 left-0 h-1.5 transition-all duration-1000 linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${(timeLeft / currentLevel.timeLimit) * 100}%` }}
              />
            )}

            <div className="mb-8 mt-2">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">{currentLevel.name}</span>
              <div className="text-6xl font-black text-slate-900 mt-4 tracking-tight flex justify-center items-baseline gap-4">
                {currentQ.text}
              </div>
            </div>

            {/* Hint Area for Learning Mode */}
            {isLearning && (
              <div className="min-h-[60px] mb-4 flex items-center justify-center">
                {showHint ? (
                  <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <Lightbulb className="inline w-4 h-4 mr-1" /> {currentQ.hint}
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="text-slate-400 hover:text-blue-500">
                    Need a hint?
                  </Button>
                )}
              </div>
            )}

            {/* Input Display */}
            <div className={cn(
              "h-20 mb-8 rounded-2xl bg-slate-100 flex items-center justify-center border-2 transition-colors",
              input ? "border-slate-300" : "border-transparent"
            )}>
              <span className={cn("text-5xl font-bold", input ? "text-slate-900" : "text-slate-300")}>
                {input || '?'}
              </span>
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeypad(num)}
                  className="h-14 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:translate-y-0.5 text-xl font-bold text-slate-700 transition-all"
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => setInput(prev => prev.slice(0, -1))}
                className="h-14 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 flex items-center justify-center transition-colors"
              >
                ⌫
              </button>
              <button
                onClick={() => handleKeypad(0)}
                className="h-14 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:translate-y-0.5 text-xl font-bold text-slate-700 transition-all"
              >
                0
              </button>
              <button
                onClick={() => isLearning ? checkLearningAnswer(input) : submitAnswer(input)}
                disabled={!input}
                className="h-14 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-lg shadow-slate-300"
              >
                {isLearning ? <ArrowRight /> : <CheckCircle />}
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mt-6 hidden md:block">
              Tip: You can use your keyboard number pad
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // --- REPORT VIEW ---

  if (gameState === 'report') {
    const stats = analyzePerformance(history);
    const xpEarned = Math.round(stats.correct * 10 * currentLevel.xpMultiplier);

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <Card className="overflow-hidden">
            <div className="bg-slate-900 text-white p-8 text-center">
              <h2 className="text-2xl font-bold mb-2 opacity-90">Session Complete</h2>
              <div className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                {stats.accuracy}%
              </div>
              <div className="flex justify-center gap-2 mt-4">
                 <Badge variant="gold">+{xpEarned} XP</Badge>
                 {stats.accuracy === 100 && <Badge variant="success">Perfect!</Badge>}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-green-700 text-sm font-medium">Correct</div>
                  <div className="text-2xl font-bold text-green-800">{stats.correct}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="text-red-700 text-sm font-medium">Mistakes</div>
                  <div className="text-2xl font-bold text-red-800">{stats.total - stats.correct}</div>
                </div>
              </div>

              {/* Weakness Analysis */}
              {stats.weaknesses.length > 0 ? (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Focus Areas
                  </h4>
                  <p className="text-sm text-amber-800 mb-4">
                    You struggled with <strong>{stats.weaknesses.join(', ')}</strong>. 
                  </p>
                  <Button 
                    onClick={() => startGame(currentLevel, 'challenge', stats.weaknesses)}
                    className="w-full bg-amber-500 hover:bg-amber-600 border-transparent text-white"
                  >
                    Practice These Items
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                  <p>Great job! You've mastered this set.</p>
                </div>
              )}

              <Button onClick={() => setGameState('menu')} variant="outline" className="w-full">
                Return to Menu
              </Button>
            </div>
          </Card>
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