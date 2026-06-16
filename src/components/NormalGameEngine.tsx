import React, { useState, useEffect } from "react";
import { NormalLevel, Idiom, LevelRecord } from "../types";
import { GameStorage } from "../lib/storage";
import { IDIOM_BANK } from "../idioms";
import { ArrowLeft, Play, RotateCcw, AlertCircle, HelpCircle, Trophy, FastForward, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NormalGameEngineProps {
  level: NormalLevel;
  onBackToSelection: () => void;
  onRecordUpdated: (newRecords: LevelRecord[]) => void;
  onNextLevel?: () => void;
}

interface SolvedState {
  [idiomIndex: number]: string | null;  // stores the filled correct character
}

// Typing for falling character animation
interface FallingItem {
  id: number;
  char: string;
  startX: number;
  startY: number;
}

export default function NormalGameEngine({
  level,
  onBackToSelection,
  onRecordUpdated,
  onNextLevel,
}: NormalGameEngineProps) {
  const [selectedIdiomIdx, setSelectedIdiomIdx] = useState<number>(0);
  const [solved, setSolved] = useState<SolvedState>({});
  const [usedCandidates, setUsedCandidates] = useState<number[]>([]); // indexes in shufflingPool that have been successfully used
  const [shufflingPool, setShufflingPool] = useState<string[]>([]);
  const [dynamicIdioms, setDynamicIdioms] = useState<Idiom[]>([]);
  
  // Scoring / Timing
  const [seconds, setSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newRecordData, setNewRecordData] = useState<LevelRecord | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);

  // FX States
  const [shakeIdiomIdx, setShakeIdiomIdx] = useState<number | null>(null);
  const [fallingChars, setFallingChars] = useState<FallingItem[]>([]);
  const [fallCounter, setFallCounter] = useState(0);

  const currentIdioms = dynamicIdioms.length > 0 ? dynamicIdioms : level.idioms;

  // 1. Build candidates pool on mounted
  useEffect(() => {
    // Shuffle the centralized idiom bank
    const shuffledIdioms = [...IDIOM_BANK].sort(() => Math.random() - 0.5);
    // Pick required number of unique idioms for this level
    const count = level.idioms.length;
    const selectedIdioms = shuffledIdioms.slice(0, count);
    setDynamicIdioms(selectedIdioms);

    const correctAnswers = selectedIdioms.map((id) => id.missingChar);
    // Combine correct ones and distractors
    const totalPool = [...correctAnswers, ...level.distractors];
    
    // Shuffle the pool
    const shuffled = [...totalPool].sort(() => Math.random() - 0.5);
    setShufflingPool(shuffled);

    // Initialize level states
    setSelectedIdiomIdx(0);
    setSolved({});
    setUsedCandidates([]);
    setSeconds(0);
    setIsCompleted(false);
    setNewRecordData(null);
    setShowHint(null);
  }, [level]);

  // 2. Ticking Timer
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted]);

  // 3. User clicks an idiom bar
  const handleSelectIdiom = (idx: number) => {
    if (solved[idx] !== undefined && solved[idx] !== null) return; // already solved
    setSelectedIdiomIdx(idx);
    setShowHint(null);
  };

  // 4. User clicks a candidate character
  const handleSelectCandidate = (char: string, index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isCompleted) return;
    if (selectedIdiomIdx === null) return;
    if (usedCandidates.includes(index)) return;

    const targetIdiom = currentIdioms[selectedIdiomIdx];
    const isCorrect = targetIdiom.missingChar === char;

    if (isCorrect) {
      // SUCCESS Fill!
      const newSolved = { ...solved, [selectedIdiomIdx]: char };
      setSolved(newSolved);
      setUsedCandidates((prev) => [...prev, index]);

      // Check if level is completely cleared!
      const allCleared = currentIdioms.every((_, idx) => {
        return newSolved[idx] !== undefined && newSolved[idx] !== null;
      });

      if (allCleared) {
        handleLevelCompleted();
      } else {
        // Auto-select the next unsolved idiom
        const unsolvedIdx = currentIdioms.findIndex((_, idx) => {
          return newSolved[idx] === undefined || newSolved[idx] === null;
        });
        if (unsolvedIdx !== -1) {
          setSelectedIdiomIdx(unsolvedIdx);
        }
      }
    } else {
      // WRONG answer: trigger local text fall animation
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const parentContainer = document.getElementById("game-layout-root")?.getBoundingClientRect();
      
      // Calculate coordinates relative to parent viewport container
      const startX = buttonRect.left - (parentContainer?.left || 0) + buttonRect.width / 2;
      const startY = buttonRect.top - (parentContainer?.top || 0) + buttonRect.height / 2;

      setFallCounter((prev) => prev + 1);
      const newFalling: FallingItem = {
        id: fallCounter,
        char,
        startX,
        startY,
      };

      setFallingChars((prev) => [...prev, newFalling]);

      // Shake animation on target idiom row
      setShakeIdiomIdx(selectedIdiomIdx);
      setTimeout(() => {
        setShakeIdiomIdx(null);
      }, 500);

      // Clean up falling items after animation
      setTimeout(() => {
        setFallingChars((prev) => prev.filter((item) => item.id !== newFalling.id));
      }, 1200);
    }
  };

  const handleLevelCompleted = async () => {
    setIsCompleted(true);
    try {
      // Check and update fastest record
      const isRecord = await GameStorage.saveLevelRecord(`level_${level.id}`, seconds);
      if (isRecord) {
        setNewRecordData(isRecord);
      }
      
      // Notify parent to fetch new records list
      const latestRecords = await GameStorage.getLevelRecords();
      onRecordUpdated(latestRecords);
    } catch (err) {
      console.error("Failed to process records update upon level completion", err);
    }
  };

  const resetLevel = () => {
    // Re-shuffle a brand new clean set of random idioms for continuous fun!
    const shuffledIdioms = [...IDIOM_BANK].sort(() => Math.random() - 0.5);
    const count = level.idioms.length;
    const selectedIdioms = shuffledIdioms.slice(0, count);
    setDynamicIdioms(selectedIdioms);

    const correctAnswers = selectedIdioms.map((id) => id.missingChar);
    const totalPool = [...correctAnswers, ...level.distractors];
    const shuffled = [...totalPool].sort(() => Math.random() - 0.5);
    setShufflingPool(shuffled);

    setSelectedIdiomIdx(0);
    setSolved({});
    setUsedCandidates([]);
    setSeconds(0);
    setIsCompleted(false);
    setNewRecordData(null);
    setShowHint(null);
  };

  return (
    <div className="flex flex-col gap-6 relative" id="game-layout-root">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl border-2 border-natural-border shadow-natural" id="game-nav-bar">
        <button
          onClick={onBackToSelection}
          className="flex items-center gap-2 px-4 py-2.5 bg-natural-border text-lg font-bold text-natural-text border-none rounded-xl cursor-pointer hover:bg-accent-tan/20 transition-all active:scale-95 shadow-sm"
          id="btn-back-to-selection"
        >
          <ArrowLeft className="w-5 h-5 text-natural-text" />
          <span>返回選關</span>
        </button>

        <div className="text-center" id="game-score-clock">
          <span className="text-md bg-[#FAF7F2] border border-accent-tan text-primary-earth font-black px-3 py-1 rounded-lg">
            {level.name.split(" - ")[0]}
          </span>
          <h2 className="text-2xl font-black text-natural-text mt-1">
            {level.name.split(" - ")[1]}
          </h2>
        </div>

        <div className="text-right" id="game-timer-card">
          <div className="text-sm font-bold text-natural-muted">已用時間</div>
          <div className="text-3xl font-black text-primary-earth font-mono tracking-wider">
            {seconds} 秒
          </div>
        </div>
      </div>

      {/* 核心填字操作區：精簡放大專專注版面 */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 md:p-6 rounded-3xl border-2 border-natural-border shadow-natural animate-fadeIn" id="main-focused-panel">
        
        {/* 控制與進度導覽 header */}
        <div className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b border-dashed border-natural-border/70 gap-3" id="focused-panel-header">
          <div className="flex flex-col gap-0.5 text-center sm:text-left" id="focused-panel-progress-title">
            <span className="text-xl md:text-2xl font-black text-primary-earth flex items-center justify-center sm:justify-start gap-2">
              <Trophy className="w-6 h-6 text-accent-tan fill-accent-tan/20" />
              <span>一般關卡填字</span>
            </span>
            <div className="text-base font-extrabold text-natural-muted" id="play-progress-badge">
              關卡進度：第 <span className="text-xl font-black text-primary-earth font-mono">{selectedIdiomIdx + 1}</span> 題 / 共 <span className="font-mono text-lg">{currentIdioms.length}</span> 題
            </div>
          </div>

          <div className="flex items-center gap-3" id="panel-quick-actions">
            {/* 重新開始按鈕 */}
            <button
              onClick={resetLevel}
              className="flex items-center gap-1.5 text-md font-extrabold text-natural-muted hover:text-primary-earth transition-colors cursor-pointer bg-natural-border/40 hover:bg-natural-border/80 px-4 py-2 rounded-xl border border-natural-border shadow-sm active:scale-95"
              id="btn-focused-reset-level"
            >
              <RotateCcw className="w-5 h-5" />
              <span>重新開始</span>
            </button>
          </div>
        </div>

        {/* 雙欄響應式排版：防止上下拉動，讓視覺最優化 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch" id="mid-interactive-zone">
          
          {/* 左欄：切換題目 + 當前大題目 */}
          <div className="md:col-span-7 flex flex-col justify-between bg-[#FAF7F2]/40 p-4 rounded-2xl border border-accent-tan/10 gap-4" id="left-interactive-col">
            
            {/* 題號切換導覽 */}
            <div className="flex flex-col items-center gap-2" id="navigator-outer">
              <span className="text-base sm:text-lg font-black text-[#8B5E3C] uppercase tracking-wide">
                🎯 請點選切換題目：
              </span>
              <div className="flex flex-wrap justify-center gap-3" id="question-navigator">
                {currentIdioms.map((_, idx) => {
                  const isSelected = selectedIdiomIdx === idx;
                  const isSolved = solved[idx] !== undefined && solved[idx] !== null;
                  const isShaking = shakeIdiomIdx === idx;

                  return (
                    <motion.button
                      key={idx}
                      animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      onClick={() => handleSelectIdiom(idx)}
                      className={`w-14 h-14 rounded-full font-black text-xl md:text-2xl transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                        isSelected
                          ? "bg-primary-earth text-white border-2 border-primary-earth scale-110 shadow-md"
                          : isSolved
                            ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-500"
                            : "bg-white text-natural-muted border-2 border-natural-border hover:bg-[#FAF7F2] hover:border-accent-tan"
                      }`}
                      id={`nav-btn-q-${idx}`}
                    >
                      {idx + 1}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 放大目前選取題目與成語框 */}
            <div className="flex flex-col items-center justify-center py-2" id="giant-question-card">
              <div className="flex items-center gap-2 sm:gap-3 justify-center" id="giant-character-row">
                {currentIdioms[selectedIdiomIdx]?.text.split("").map((c, charIdx) => {
                  const isMissing = currentIdioms[selectedIdiomIdx]?.missingIndex === charIdx;
                  const isSolved = solved[selectedIdiomIdx] !== undefined && solved[selectedIdiomIdx] !== null;

                  if (isMissing) {
                    return (
                      <motion.div
                        key={charIdx}
                        animate={shakeIdiomIdx === selectedIdiomIdx ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-4 text-3xl sm:text-4xl md:text-5xl font-black shadow-md transition-all ${
                          isSolved
                            ? "bg-emerald-600 text-white border-emerald-700"
                            : "bg-white border-[#8B5E3C] text-accent-tan border-dashed animate-pulse"
                        }`}
                        id={`giant-missing-card-${charIdx}`}
                      >
                        {isSolved ? solved[selectedIdiomIdx] : "？"}
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

          {/* 右欄：成語意思提示 */}
          <div className="md:col-span-5 flex flex-col justify-center items-center bg-[#FAF7F2] border-2 border-accent-tan/20 p-5 rounded-2xl text-center shadow-inner" id="giant-hint-bubble">
            <span className="text-base sm:text-lg font-black text-accent-tan uppercase tracking-wider block mb-2">
              💡 當前成語意思提示 💡
            </span>
            <p className="text-[#8B5E3C] font-black leading-relaxed font-sans max-h-[140px] overflow-y-auto w-full px-2 text-xl sm:text-2xl">
              {currentIdioms[selectedIdiomIdx]?.hint}
            </p>
          </div>

        </div>

        {/* 下方字卡候選按鍵欄 */}
        <div className="border-t border-dashed border-natural-border/75 pt-4" id="focused-candidates-section">
          <h3 className="text-primary-earth text-lg sm:text-xl font-black mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5" id="candidates-grid-title">
            <span>🎯 請點選下方字卡填入：</span>
          </h3>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 md:gap-2.5 justify-center text-center mx-auto" id="candidate-grid-root">
            {shufflingPool.map((char, index) => {
              const isUsed = usedCandidates.includes(index);
              return (
                <button
                  key={index}
                  disabled={isUsed}
                  onClick={(e) => handleSelectCandidate(char, index, e)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black border-2 shadow-sm transition-all cursor-pointer ${
                    isUsed
                      ? "bg-natural-border border-natural-border text-natural-muted/30 scale-90 cursor-not-allowed"
                      : "bg-[#FAF7F2] hover:bg-white border-accent-tan text-natural-text hover:border-primary-earth hover:translate-y-[-1px] active:scale-95"
                  }`}
                  id={`candidate-btn-${index}`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 貼心設計：底部橫條標語 */}
      <div className="bg-accent-tan/5 border-2 border-dashed border-accent-tan/20 p-4 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-natural-text text-sm md:text-md text-center sm:text-left justify-center shadow-sm" id="play-spec-footer">
        <span className="font-extrabold text-[#784A24] shrink-0">✨ 貼心設計：</span>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-natural-muted font-medium">
          <span>• 字體加大設計，清晰流暢閱覽</span>
          <span>• 適中按鍵大小，方便手機與電腦輕快點選</span>
          <span>• 隨時重新挑戰，無任何扣分心理負擔</span>
        </div>
      </div>

      {/* RENDER FALLING WRONG CHARACTERS */}
      <AnimatePresence>
        {fallingChars.map((item) => (
          <motion.div
            key={item.id}
            initial={{ 
              position: "absolute", 
              left: item.startX - 40, 
              top: item.startY - 40,
              scale: 1.1,
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: 600,
              rotate: [0, 45, -90, 180],
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeIn" }}
            className="w-20 h-20 bg-red-500 text-white rounded-2xl border-2 border-red-800 flex items-center justify-center text-4xl font-black shadow-lg pointer-events-none z-50"
            id={`falling-effect-${item.id}`}
          >
            {item.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completion Modal Window */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm" id="achievement-modal">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-white border-2 border-accent-tan rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
            id="modal-card"
          >
            {/* Background sparkle confetti (conceptual styling) */}
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-accent-tan via-primary-earth to-forest-green" />
            
            <div className="flex justify-center mb-4 mt-2" id="trophy-wrapper">
              <div className="p-5 bg-[#FAF7F2] border-2 border-accent-tan rounded-full animate-bounce">
                <Trophy className="w-16 h-16 text-accent-tan fill-accent-tan/20" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-primary-earth mb-2" id="modal-title">
              🎉 挑戰成功，大獲全勝！
            </h1>
            <p className="text-xl text-natural-muted font-bold mb-6" id="modal-subtitle">
              太厲害了！已完成此關卡的所有成語填空。
            </p>

            <div className="bg-[#FAF7F2] border border-accent-tan/30 p-6 rounded-2xl mb-8 flex flex-col gap-3 justify-center items-center" id="modal-score-board">
              <div className="text-2xl font-black text-natural-text" id="user-score-row">
                您花費了：<span className="text-4xl text-primary-earth font-mono">{seconds}</span> 秒
              </div>

              {newRecordData ? (
                <div className="bg-accent-tan/15 border border-accent-tan rounded-xl px-4 py-2 animate-pulse mt-1" id="new-record-crown">
                  <span className="text-xl font-black text-primary-earth flex items-center gap-1.5">
                    👑 恭喜！您達成了新的個人最高紀錄！
                  </span>
                </div>
              ) : (
                <p className="text-lg font-bold text-natural-muted mt-1" id="try-harder-crown">
                  （加油！努力挑戰更短的秒數來打破您的個人最佳紀錄吧！）
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center" id="modal-actions">
              <button
                onClick={onBackToSelection}
                className="w-full py-4 text-2xl font-bold bg-natural-border text-natural-text border-none rounded-2xl transition-colors cursor-pointer hover:bg-natural-border/80 shadow-sm"
                id="btn-modal-back"
              >
                返回關卡選單
              </button>

              {onNextLevel ? (
                <button
                  onClick={onNextLevel}
                  className="w-full flex items-center justify-center gap-2 py-4 text-2xl font-extrabold bg-[#8B5E3C] hover:bg-[#6B4423] text-white border-none rounded-2xl shadow-sm cursor-pointer transition-all active:scale-98"
                  id="btn-modal-next"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>下一關挑戰</span>
                </button>
              ) : (
                <button
                  onClick={resetLevel}
                  className="w-full py-4 text-2xl font-bold bg-[#D4A373] hover:bg-[#C29262] text-white border-none rounded-2xl shadow-sm transition-all cursor-pointer active:scale-98"
                  id="btn-modal-retry"
                >
                  再挑戰一次
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
