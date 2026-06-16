import React, { useState, useEffect, useRef } from "react";
import { ChallengeRecord, UserProfile, Idiom } from "../types";
import { IDIOM_BANK } from "../idioms";
import { GameStorage } from "../lib/storage";
import { RotateCcw, ArrowLeft, Trophy, Clock, Brain, Check, ShieldAlert, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChallengeGameEngineProps {
  user: UserProfile;
  onBackToLobby: () => void;
  onLeaderboardUpdated: () => void;
  onShowLeaderboard: () => void;
}

interface FallingWrongItem {
  id: number;
  char: string;
  startX: number;
  startY: number;
}

export default function ChallengeGameEngine({
  user,
  onBackToLobby,
  onLeaderboardUpdated,
  onShowLeaderboard,
}: ChallengeGameEngineProps) {
  // Master idiom bank reference for distractors & challenges
  const flatIdioms = useRef<Idiom[]>(IDIOM_BANK);
  const challengeIdioms = useRef<Idiom[]>([]);
  const currentIdiomIndexRef = useRef<number>(0);

  // Game active states
  const [currentIdiom, setCurrentIdiom] = useState<Idiom | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const scoreRef = useRef<number>(0);
  
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);

  // Candidate pool of 16 cards
  const [candidatePool, setCandidatePoolState] = useState<string[]>([]);
  const candidatePoolRef = useRef<string[]>([]);
  const setCandidatePool = (val: string[] | ((prev: string[]) => string[])) => {
    if (typeof val === "function") {
      setCandidatePoolState(prev => {
        const next = val(prev);
        candidatePoolRef.current = next;
        return next;
      });
    } else {
      candidatePoolRef.current = val;
      setCandidatePoolState(val);
    }
  };

  const [usedCandidates, setUsedCandidatesState] = useState<number[]>([]); // indexes in candidatePool (0 to 15) that have been used
  const usedCandidatesRef = useRef<number[]>([]);
  const setUsedCandidates = (val: number[] | ((prev: number[]) => number[])) => {
    if (typeof val === "function") {
      setUsedCandidatesState(prev => {
        const next = val(prev);
        usedCandidatesRef.current = next;
        return next;
      });
    } else {
      usedCandidatesRef.current = val;
      setUsedCandidatesState(val);
    }
  };

  // FX animations state
  const [shakeIdiom, setShakeIdiom] = useState<boolean>(false);
  const [fallingItems, setFallingItems] = useState<FallingWrongItem[]>([]);
  const [fallCount, setFallCount] = useState<number>(0);

  // Sequential progression: fetch next question from pre-selected 90 questions
  const getNextIdiom = (): Idiom | null => {
    const nextIdx = currentIdiomIndexRef.current + 1;
    if (nextIdx >= challengeIdioms.current.length) {
      // Game over, completed all 90 items!
      setIsGameOver(true);
      submitFinalScore();
      return null;
    }
    currentIdiomIndexRef.current = nextIdx;
    setCurrentQuestionNumber(nextIdx + 1);
    return challengeIdioms.current[nextIdx];
  };

  // Helper to generate a new 16-character candidate pool
  const generateNewCandidatePool = (missingChar: string) => {
    // Collect all characters from all idioms to use as distractors
    const allChars = Array.from<string>(
      new Set<string>(flatIdioms.current.flatMap(idiom => idiom.text.split("")))
    ).filter(c => c !== missingChar);

    // Shuffle and pick 15 distractors
    const chosenDistractors = allChars.sort(() => Math.random() - 0.5).slice(0, 15);
    const combined = [missingChar, ...chosenDistractors];
    const shuffled = combined.sort(() => Math.random() - 0.5);

    setCandidatePool(shuffled);
    setUsedCandidates([]);
  };

  // Safe question loading state manager
  const loadQuestion = (nextIdiom: Idiom, isFirstRun = false, overrideUsed?: number[]) => {
    setCurrentIdiom(nextIdiom);
    setSolved(false);

    const activeUsed = overrideUsed !== undefined ? overrideUsed : usedCandidatesRef.current;
    const activePool = candidatePoolRef.current;

    if (isFirstRun) {
      generateNewCandidatePool(nextIdiom.missingChar);
    } else {
      // Calculate active (unused) candidate card count
      const unusedCount = 16 - activeUsed.length;

      if (unusedCount <= 6) {
        // "剩下 6 個沒用過的字之後換一組字卡"
        generateNewCandidatePool(nextIdiom.missingChar);
      } else {
        // Reuse the pool, but MUST guarantee the missingChar is in the remaining active candidates!
        const missingChar = nextIdiom.missingChar;
        const activeIndexes = Array.from({ length: 16 }, (_, i) => i).filter(
          i => !activeUsed.includes(i)
        );

        const isMissingCharInUnused = activeIndexes.some(idx => activePool[idx] === missingChar);

        if (!isMissingCharInUnused) {
          // Choose a random range for count of characters to replace: 6 to 10
          const replaceCount = Math.max(1, Math.min(activeIndexes.length, Math.floor(Math.random() * 5) + 6));
          
          // Shuffle the active input indexes to choose which slots to update
          const shuffledActiveIndexes = [...activeIndexes].sort(() => Math.random() - 0.5);
          const targetSlotIndexes = shuffledActiveIndexes.slice(0, replaceCount);
          
          // Gather global characters that are not currently present in our candidate pool as fresh distractors
          const allGlobalChars = Array.from<string>(
            new Set<string>(flatIdioms.current.flatMap(idiom => idiom.text.split("")))
          ).filter(c => c !== missingChar && !activePool.includes(c));
          
          // Shuffle distractors
          const freshDistractors = allGlobalChars.sort(() => Math.random() - 0.5);
          
          const updatedPool = [...activePool];
          // Replace slots: first slot is the required missingChar, the rest are filled with fresh distractors
          targetSlotIndexes.forEach((slotIdx, i) => {
            if (i === 0) {
              updatedPool[slotIdx] = missingChar;
            } else {
              // Fallback in case we run out of unique global characters (unlikely but safe)
              const fallbackChar = freshDistractors[i - 1] || "好";
              updatedPool[slotIdx] = fallbackChar;
            }
          });
          
          setCandidatePool(updatedPool);
        }
      }
    }
  };

  // 1. Initial Launch
  useEffect(() => {
    // Shuffle and pick exactly 90 idioms from the centralized idiom bank
    const shuffled = [...IDIOM_BANK].sort(() => Math.random() - 0.5);
    challengeIdioms.current = shuffled.slice(0, 90);
    currentIdiomIndexRef.current = 0;

    const firstIdiom = challengeIdioms.current[0];
    setCurrentQuestionNumber(1);
    setScore(0);
    setTimeLeft(90);
    setIsGameOver(false);
    if (firstIdiom) {
      loadQuestion(firstIdiom, true);
    }
  }, []);

  // 2. 90-Second Countdown Timer
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver]);

  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver) {
      setIsGameOver(true);
      submitFinalScore();
    }
  }, [timeLeft, isGameOver]);

  const submitFinalScore = async () => {
    // Save record to database with current final score count
    await GameStorage.saveChallengeRecord(scoreRef.current);
    onLeaderboardUpdated();
  };

  // 3. Skip Button logic (-5 seconds penalty)
  const handleSkipQuestion = () => {
    if (isGameOver || !currentIdiom) return;

    // Penalty check: deduct 5 seconds
    setTimeLeft(prev => {
      const remaining = prev - 5;
      return remaining > 0 ? remaining : 0;
    });

    // Load next idiom
    const nextIdiom = getNextIdiom();
    if (nextIdiom) {
      loadQuestion(nextIdiom, false);
    }
  };

  // 4. Candidate selection tap
  const handleSelectCandidate = (char: string, indexInPool: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isGameOver || solved || !currentIdiom) return;
    if (usedCandidates.includes(indexInPool)) return;

    const isCorrect = currentIdiom.missingChar === char;

    if (isCorrect) {
      // Score correct answer!
      setSolved(true);
      setScore(prev => prev + 1);
      
      // Temporarily register index as used so it remains greyed out
      const updatedUsed = [...usedCandidates, indexInPool];
      setUsedCandidates(updatedUsed);

      // Auto load next random question after a short delay to let them see success
      setTimeout(() => {
        const nextIdiom = getNextIdiom();
        if (nextIdiom) {
          // Pass the updatedUsed list explicitly to avoid state update delay
          loadQuestion(nextIdiom, false, updatedUsed);
        }
      }, 800);

    } else {
      // Wrong character: trigger drop visual effect
      const btnRect = event.currentTarget.getBoundingClientRect();
      const parentContainer = document.getElementById("challenge-playground-root")?.getBoundingClientRect();
      const startX = btnRect.left - (parentContainer?.left || 0) + btnRect.width / 2;
      const startY = btnRect.top - (parentContainer?.top || 0) + btnRect.height / 2;

      setFallCount(p => p + 1);
      const newItem: FallingWrongItem = {
        id: fallCount,
        char,
        startX,
        startY,
      };

      setFallingItems(prev => [...prev, newItem]);

      // Shake the targeted idiom characters line
      setShakeIdiom(true);
      setTimeout(() => {
        setShakeIdiom(false);
      }, 500);

      // Clean up item from layout
      setTimeout(() => {
        setFallingItems(prev => prev.filter(i => i.id !== newItem.id));
      }, 1200);
    }
  };

  const startNewGame = () => {
    // Shuffle and pick exactly 90 idioms from the centralized idiom bank
    const shuffled = [...IDIOM_BANK].sort(() => Math.random() - 0.5);
    challengeIdioms.current = shuffled.slice(0, 90);
    currentIdiomIndexRef.current = 0;

    const firstIdiom = challengeIdioms.current[0];
    setCurrentQuestionNumber(1);
    setScore(0);
    setTimeLeft(90);
    setIsGameOver(false);
    setUsedCandidates([]);
    if (firstIdiom) {
      loadQuestion(firstIdiom, true);
    }
  };

  if (!currentIdiom) return null;

  return (
    <div className="flex flex-col gap-5 relative" id="challenge-playground-root">
      
      {/* Top Banner stats */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-3xl border-2 border-natural-border shadow-natural gap-4" id="challenge-title-bar">
        <div className="flex items-center gap-4" id="challenge-desc">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-natural-border text-lg font-bold text-natural-text border-none rounded-2xl cursor-pointer hover:bg-accent-tan/20 transition-all active:scale-95 shadow-sm"
            id="challenge-back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-natural-text" />
            <span>返回大廳</span>
          </button>
          
          <div>
            <h2 className="text-2xl font-black text-primary-earth flex items-center gap-2">
              <Brain className="w-8 h-8 text-accent-tan" />
              挑戰關卡：90秒極限答題
            </h2>
            <p className="text-sm text-natural-muted font-bold">
              看看您在 90 秒時限內，能答對多少道成語題目？
            </p>
          </div>
        </div>

        {/* Timers & Counters */}
        <div className="flex gap-4 items-center" id="challenge-status-widgets">
          <div className={`flex items-center gap-2 px-5 py-2.5 border rounded-2xl ${
            timeLeft <= 15 
              ? "bg-red-600 border-red-400 text-white animate-pulse" 
              : timeLeft <= 40 
                ? "bg-accent-tan text-primary-earth border-none"
                : "bg-primary-earth text-white border-none shadow-sm"
          }`} id="countdown-card">
            <Clock className="w-6 h-6 animate-spin-slow" />
            <span className="text-2xl font-black font-mono tracking-wider">
              {timeLeft} 秒
            </span>
          </div>

          <div className="bg-[#FAF7F2] border border-accent-tan/40 text-natural-text px-5 py-2 rounded-2xl text-center shadow-sm" id="solved-status-badge">
            <div className="text-xs font-bold text-natural-muted">累計答對</div>
            <div className="text-xl font-black font-mono text-primary-earth">
              {score} 題
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Progress Slider */}
      <div className="w-full bg-natural-border/35 h-5 rounded-full overflow-hidden border border-natural-border" id="progress-bar-container">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 15 
              ? "bg-gradient-to-r from-red-600 to-red-500 animate-pulse" 
              : timeLeft <= 40
                ? "bg-gradient-to-r from-[#D4A373] to-yellow-600"
                : "bg-gradient-to-r from-forest-green to-emerald-500"
          }`}
          style={{ width: `${(timeLeft / 90) * 100}%` }}
          id="progress-bar"
        />
      </div>

      {/* Main Focus Panel (Adopting the layout from General Levels but optimized for sequential flow) */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 md:p-6 rounded-3xl border-2 border-natural-border shadow-natural animate-fadeIn" id="main-focused-panel">
        
        {/* Controls & Progress header */}
        <div className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b border-dashed border-natural-border/70 gap-3" id="challenge-panel-header">
          <div className="flex flex-col gap-0.5 text-center sm:text-left" id="play-status-badge">
            <span className="text-xl font-black text-primary-earth flex items-center gap-1">
              <span>🎯 當前答題進度</span>
            </span>
            <div className="text-base font-extrabold text-natural-muted">
              目前正在作答：第 <span className="text-xl font-black text-primary-earth font-mono">{currentQuestionNumber}</span> 題
            </div>
          </div>

          <div className="flex items-center gap-3" id="panel-quick-actions">
            {/* Skip Button */}
            <button
              onClick={handleSkipQuestion}
              className="flex items-center gap-1.5 text-md font-extrabold text-red-700 hover:text-white hover:bg-red-600 border border-red-300 bg-red-50 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              title="跳過本題扣除5秒"
              id="btn-challenge-skip"
            >
              <SkipForward className="w-5 h-5" />
              <span>跳過本題 (扣5秒)</span>
            </button>

            {/* Restart Challenge Button */}
            <button
              onClick={startNewGame}
              className="flex items-center gap-1.5 text-md font-extrabold text-natural-muted hover:text-primary-earth bg-natural-border/40 hover:bg-natural-border/80 px-4 py-2 rounded-xl border border-natural-border transition-colors cursor-pointer active:scale-95 shadow-sm"
              id="btn-challenge-retry"
            >
              <RotateCcw className="w-5 h-5" />
              <span>重新開始</span>
            </button>
          </div>
        </div>

        {/* Dual Column responsive panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch" id="mid-interactive-zone">
          
          {/* Left Column: Giant idiopathic characters list */}
          <div className="md:col-span-7 flex flex-col justify-center items-center bg-[#FAF7F2]/40 p-5 rounded-2xl border border-accent-tan/10 gap-4" id="left-interactive-col">
            
            <div className="w-full text-center py-2" id="giant-question-card">
              <div className="flex items-center gap-2 sm:gap-3 justify-center" id="giant-character-row">
                {currentIdiom.text.split("").map((c, charIdx) => {
                  const isMissing = currentIdiom.missingIndex === charIdx;

                  if (isMissing) {
                    return (
                      <motion.div
                        key={charIdx}
                        animate={shakeIdiom ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-4 text-3xl sm:text-4xl md:text-5xl font-black shadow-md transition-all ${
                          solved
                            ? "bg-emerald-600 text-white border-emerald-700"
                            : "bg-white border-[#8B5E3C] text-accent-tan border-dashed animate-pulse"
                        }`}
                        id={`giant-missing-card-${charIdx}`}
                      >
                        {solved ? currentIdiom.missingChar : "？"}
                      </motion.div>
                    );
                  }

                  return (
                    <div
                      key={charIdx}
                      className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-3 border-accent-tan/30 bg-[#FAF7F2] text-3xl sm:text-4xl md:text-5xl font-black text-natural-text shadow-sm"
                      id={`giant-static-card-${charIdx}`}
                    >
                      {c}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Custom hints display */}
          <div className="md:col-span-5 flex flex-col justify-center items-center bg-[#FAF7F2] border-2 border-accent-tan/20 p-5 rounded-2xl text-center shadow-inner" id="giant-hint-bubble">
            <span className="text-base sm:text-lg font-black text-accent-tan uppercase tracking-wider block mb-2">
              💡 當前成語意思提示 💡
            </span>
            <p className="text-[#8B5E3C] font-black leading-relaxed font-sans max-h-[140px] overflow-y-auto w-full px-2 text-xl sm:text-2xl">
              {currentIdiom.hint}
            </p>
          </div>

        </div>

        {/* Bottom candidate keys grid */}
        <div className="border-t border-dashed border-natural-border/75 pt-4" id="focused-candidates-section">
          <h3 className="text-primary-earth text-lg sm:text-xl font-black mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5" id="candidates-grid-title">
            <span>🎯 請點選下方字卡填入：</span>
          </h3>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-2.5 justify-center text-center mx-auto" id="candidate-grid-root">
            {candidatePool.map((char, index) => {
              const isUsed = usedCandidates.includes(index);
              return (
                <button
                  key={index}
                  disabled={isUsed || solved}
                  onClick={(e) => handleSelectCandidate(char, index, e)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black border-2 shadow-sm transition-all cursor-pointer ${
                    isUsed
                      ? "bg-natural-border border-natural-border text-natural-muted/30 scale-90 cursor-not-allowed"
                      : "bg-[#FAF7F2] hover:bg-white border-accent-tan text-natural-text hover:border-primary-earth hover:translate-y-[-1px] active:scale-95"
                  }`}
                  id={`challenge-candidate-key-${index}`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-accent-tan/10 border-2 border-dashed border-accent-tan/40 p-5 rounded-2xl text-xs sm:text-sm text-natural-text leading-relaxed font-bold" id="challenge-time-note-box">
        <h5 className="font-extrabold text-primary-earth mb-2 text-base flex items-center gap-1">
          <span>⏱️ 90 秒極限無限答題挑戰規則說明</span>
        </h5>
        <ul className="list-disc pl-4 space-y-1 md:space-y-2">
          <li>時限為 <span className="text-red-700 font-black">90 秒</span>，關卡會隨機連續出現成語供您作答。</li>
          <li>字卡由 <span className="text-primary-earth font-black">16 個字</span>組成。累積作答到只剩 <span className="text-accent-tan font-black">6 個未使用</span>字卡時，會自動換一組全新16字卡。</li>
          <li>如果您遇到不會的字，可以點擊 <span className="text-red-650">「跳過本題」</span>，但每次跳過會<span className="text-red-700 font-extrabold">扣除 5 秒</span>時間，請謹慎使用！</li>
        </ul>
      </div>

      {/* Falling wrong entries FX */}
      <AnimatePresence>
        {fallingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              position: "absolute",
              left: item.startX - 36,
              top: item.startY - 36,
              scale: 1.1,
              rotate: 0,
              opacity: 1
            }}
            animate={{
              y: 650,
              rotate: [0, -35, 120, -180],
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeIn" }}
            className="w-16 h-16 bg-red-500 text-white rounded-2xl border-2 border-red-800 flex items-center justify-center text-3xl font-black shadow-lg pointer-events-none z-50 animate-bounce"
            id={`challenge-wrong-falling-${item.id}`}
          >
            {item.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game Over modal displaying results */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 backdrop-blur-sm" id="challenge-outcome-modal">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-white border-2 border-accent-tan rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
            id="challenge-modal-interior"
          >
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-accent-tan via-primary-earth to-forest-green" />
            
            <div className="flex justify-center mb-4 mt-2" id="medal-avatar-holder">
              <div className="p-5 rounded-full border-2 border-accent-tan bg-[#FAF7F2] animate-bounce">
                <Trophy className="w-16 h-16 text-accent-tan fill-accent-tan/20" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-primary-earth mb-2" id="outcome-headline">
              ⏱️ 挑戰時間結束！
            </h1>
            
            <p className="text-xl text-natural-muted font-bold mb-6" id="outcome-subcontent">
              做得好！您在 90 秒內成功答對了：
            </p>

            <div className="bg-[#FAF7F2] border border-accent-tan/30 p-6 rounded-2xl mb-8 flex flex-col gap-2 justify-center items-center" id="score-block">
              <div className="text-2xl font-black text-natural-text" id="final-results-text">
                答對題數：<span className="text-5xl text-[#8B5E3C] font-mono font-black">{score}</span> 題
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center" id="outcome-action-btns">
              <button
                onClick={onBackToLobby}
                className="w-full py-4 text-xl font-bold bg-natural-border text-natural-text border-none rounded-2xl transition-colors cursor-pointer hover:bg-natural-border/80 shadow-sm"
                id="btn-quit-challenge"
              >
                回到大廳
              </button>

              <button
                onClick={onShowLeaderboard}
                className="w-full flex items-center justify-center gap-2 py-4 text-xl font-extrabold bg-[#8B5E3C] hover:bg-[#6B4423] text-white border-none rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer active:scale-98"
                id="btn-goto-leaderboards"
              >
                <Trophy className="w-5 h-5 text-white fill-white" />
                <span>查看排行榜</span>
              </button>

              <button
                onClick={startNewGame}
                className="w-full py-4 text-xl font-bold bg-[#D4A373] hover:bg-[#C29262] text-white border-none rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer active:scale-98"
                id="btn-retry-grid"
              >
                再挑戰一次
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
