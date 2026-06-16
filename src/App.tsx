import React, { useState, useEffect } from "react";
import { UserProfile, LevelRecord, ChallengeRecord, NormalLevel } from "./types";
import { GameStorage } from "./lib/storage";
import { NORMAL_LEVELS } from "./data";
import UserSettingScreen from "./components/UserSettingScreen";
import NormalLevelSelection from "./components/NormalLevelSelection";
import NormalGameEngine from "./components/NormalGameEngine";
import ChallengeGameEngine from "./components/ChallengeGameEngine";
import ChallengeLeaderboardView from "./components/ChallengeLeaderboardView";
import { Trophy, Compass, Star, Settings, ShieldQuestion, VolumeX, Sparkles, BookOpen, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Global State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [levelRecords, setLevelRecords] = useState<LevelRecord[]>([]);
  const [challengeLeaderboard, setChallengeLeaderboard] = useState<ChallengeRecord[]>([]);
  
  // Game Routing states: 
  // 'register' (new user name input), 'lobby' (main lobby), 
  // 'normal_selection', 'normal_play', 'challenge_play', 'leaderboard', 'settings' (edit name path)
  const [view, setView] = useState<"register" | "lobby" | "normal_selection" | "normal_play" | "challenge_play" | "leaderboard" | "settings">("lobby");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load User and Records on boot
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await GameStorage.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setView("lobby");
        } else {
          setView("register");
        }

        // Fetch level records & challenge leaderboard
        const records = await GameStorage.getLevelRecords();
        const leaderboard = await GameStorage.getChallengeLeaderboard();
        setLevelRecords(records);
        setChallengeLeaderboard(leaderboard);
      } catch (err) {
        console.error("Failed to load initial storage datasets", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync records helper
  const refreshRecords = async () => {
    try {
      const records = await GameStorage.getLevelRecords();
      const leaderboard = await GameStorage.getChallengeLeaderboard();
      setLevelRecords(records);
      setChallengeLeaderboard(leaderboard);
    } catch (err) {
      console.error("Error refreshing records lists in real-time", err);
    }
  };

  // Callback when registration finishes
  const handleUserSaved = (profile: UserProfile) => {
    setUser(profile);
    setView("lobby");
    refreshRecords();
  };

  // Next level sequence trigger for normal levels
  const handleNextLevel = () => {
    if (selectedLevelId === null) return;
    const nextId = selectedLevelId + 1;
    const hasNext = NORMAL_LEVELS.some((l) => l.id === nextId);
    if (hasNext) {
      setSelectedLevelId(nextId);
    } else {
      setSelectedLevelId(null);
      setView("normal_selection");
    }
  };

  // Reset name option from system settings
  const handleNameModificationSuccess = (profile: UserProfile) => {
    setUser(profile);
    setView("lobby");
    refreshRecords();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-natural-bg" id="global-loading">
        <div className="p-8 bg-white border-3 border-primary-earth rounded-3xl text-center shadow-natural-lg" id="loading-card">
          <div className="w-16 h-16 border-t-4 border-b-4 border-primary-earth rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-black text-natural-text font-sans">成語拼圖與字謎庫載入中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural-bg p-3 md:p-6 text-natural-text font-sans" id="application-container">
      <div className="max-w-6xl mx-auto flex flex-col gap-6" id="app-viewport">
        
        {/* Top universal toolbar (Saves settings button & profile name info) */}
        {view !== "register" && user && (
          <header className="flex justify-between items-center bg-white p-5 py-4 rounded-3xl border-2 border-natural-border shadow-natural" id="global-header">
            <div className="flex items-center gap-3" id="top-title-brand">
              <span className="text-3xl md:text-4xl animate-bounce">🧩</span>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-primary-earth tracking-wide">成語拼圖大挑戰</h1>
                <p className="text-sm text-natural-muted font-bold hidden sm:block">精選常用成語，輕鬆學、快樂玩！</p>
              </div>
            </div>

            <div className="flex items-center gap-4" id="top-profile-hub">
              <div className="flex items-center gap-2 bg-natural-card px-4 py-2 rounded-xl border-2 border-natural-border" id="user-badge">
                <span className="text-lg font-bold text-natural-muted">歡迎，玩家：</span>
                <span className="text-xl font-black text-primary-earth underline decoration-accent-tan decoration-4">
                  {user.name}
                </span>
              </div>

              <button
                onClick={() => setView("settings")}
                className="flex items-center gap-1.5 bg-natural-border hover:bg-accent-tan/20 text-natural-text px-4 py-2.5 rounded-xl text-lg font-bold transition-all cursor-pointer shadow-sm"
                id="btn-trigger-settings"
              >
                <Settings className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">系統設定/改名</span>
              </button>
            </div>
          </header>
        )}

        <main id="app-main-content">
          <AnimatePresence mode="wait">
            {/* 1. Register Name View */}
            {view === "register" && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <UserSettingScreen onSave={handleUserSaved} />
              </motion.div>
            )}

            {/* 2. System Settings View */}
            {view === "settings" && user && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <UserSettingScreen
                  initialUser={user}
                  onSave={handleNameModificationSuccess}
                  onCancel={() => setView("lobby")}
                />
              </motion.div>
            )}

            {/* 3. Main Entrance Lobby */}
            {view === "lobby" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
                key="lobby"
                id="lobby-container"
              >
                {/* Hero Greeting Panel */}
                <div className="bg-white border-2 border-primary-earth rounded-3xl p-8 text-center relative overflow-hidden shadow-natural-lg" id="hero-panel">
                  <div className="absolute top-0 right-0 p-8 transform rotate-12 scale-150 opacity-10 pointer-events-none">
                    <Trophy className="w-48 h-48 text-primary-earth" />
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-primary-earth mb-3 tracking-wide" id="hero-greeting-title">
                    🧩 益智趣味成語拼圖
                  </h2>
                  <p className="text-base md:text-lg font-bold text-natural-muted leading-relaxed max-w-xl mx-auto" id="hero-greeting-text">
                    成語拼圖是一款輕鬆有趣的填字遊戲，只需點選下方字卡即可補齊漏字。
                    <span className="block md:inline md:ml-1">老少咸宜、輕鬆上手，讓您學習無壓力、樂學又動腦！</span>
                  </p>

                  <div className="mt-8 flex justify-center gap-2 flex-wrap" id="achievements-micro-banner">
                    <span className="bg-natural-card border-2 border-accent-tan px-4 py-2 rounded-xl text-lg font-black text-primary-earth flex items-center gap-1.5 shadow-sm">
                      📖 嚴選10個大關卡
                    </span>
                    <span className="bg-natural-card border-2 border-primary-earth px-4 py-2 rounded-xl text-lg font-black text-primary-earth flex items-center gap-1.5 shadow-sm">
                      🕒 90秒極限挑戰賽
                    </span>
                    <span className="bg-natural-card border-2 border-forest-green px-4 py-2 rounded-xl text-lg font-black text-forest-green flex items-center gap-1.5 shadow-sm">
                      🏆 同步挑戰排行榜
                    </span>
                  </div>
                </div>

                {/* TWO GATE ENTRANCES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="entrances-row">
                  
                  {/* Gate 1: Normal Levels */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border-3 border-primary-earth rounded-3xl p-8 flex flex-col justify-between shadow-natural-lg text-center relative"
                    id="gate-normal"
                  >
                    <div id="gate-normal-top">
                      <div className="mx-auto w-20 h-20 bg-accent-tan/10 rounded-full border-3 border-accent-tan flex items-center justify-center text-primary-earth mb-4" id="normal-gate-icon">
                        <BookOpen className="w-12 h-12 text-primary-earth" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-3xl font-extrabold text-primary-earth mb-3">一般關卡</h3>
                      <p className="text-lg text-natural-muted font-medium leading-relaxed mb-6">
                        從簡單的 3 組成語一路上升到 12 組成語！不限時間，沒有扣分挫折，成語意思有提示，適合慢慢推敲鍛鍊腦力！
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setView("normal_selection");
                        refreshRecords();
                      }}
                      className="w-full py-5 text-2xl font-black bg-accent-tan hover:bg-accent-tan/90 text-white rounded-2xl shadow-md border-b-6 border-primary-earth hover:translate-y-[-1px] active:translate-y-1 active:border-b-2 transition-all cursor-pointer"
                      id="btn-enter-normal-mode"
                    >
                      開始挑戰一般關卡 ➔
                    </button>
                  </motion.div>

                  {/* Gate 2: Challenge Level */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border-3 border-primary-earth rounded-3xl p-8 flex flex-col justify-between shadow-natural-lg text-center relative"
                    id="gate-challenge"
                  >
                    <div id="gate-challenge-top">
                      <div className="mx-auto w-20 h-20 bg-forest-green/10 rounded-full border-3 border-forest-green flex items-center justify-center text-forest-green mb-4" id="challenge-gate-icon">
                        <Clock className="w-12 h-12 text-forest-green" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-3xl font-extrabold text-primary-earth mb-3">挑戰關卡</h3>
                      <p className="text-lg text-natural-muted font-medium leading-relaxed mb-6">
                        90秒極限無限答題！遇到不會的字可以按跳過（扣5秒），累積題數衝刺高分，看您在 90 秒時限內能連對幾題！
                      </p>
                    </div>
 
                    <div className="flex flex-col gap-3" id="challenge-actions">
                      <button
                        onClick={() => {
                          setView("challenge_play");
                        }}
                        className="w-full py-5 text-2xl font-black bg-gradient-to-br from-primary-earth to-primary-dark text-white rounded-2xl shadow-[0_6px_0_0_#4A2F18] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_0_#4A2F18] transition-all cursor-pointer border-none"
                        id="btn-enter-challenge-mode"
                      >
                        進入 90秒無限答題挑戰賽 ➔
                      </button>

                      <button
                        onClick={() => {
                          setView("leaderboard");
                          refreshRecords();
                        }}
                        className="w-full text-lg font-black text-primary-earth hover:text-primary-dark flex items-center justify-center gap-1 py-1"
                        id="btn-view-challenge-leaderboard"
                      >
                        <Trophy className="w-5 h-5 text-accent-tan fill-accent-tan" />
                        <span>查看排行榜</span>
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom Instructions Panel */}
                <div className="bg-natural-card p-6 rounded-2xl border-2 border-natural-border font-medium shadow-natural" id="lobby-tutorial">
                  <h4 className="text-xl font-bold mb-3 text-primary-earth flex items-center gap-1.5">
                    <ShieldQuestion className="w-6 h-6 text-primary-earth" />
                    💡 玩法提示
                  </h4>
                  <p className="text-lg text-natural-muted leading-relaxed">
                    1.選擇關卡。 2.點擊最下方的候選字填入。答對會鎖定在格子中，答錯也可以再次嘗試，學習無壓力！
                  </p>
                </div>
              </motion.div>
            )}

            {/* 4. Normal Mode selection view */}
            {view === "normal_selection" && (
              <motion.div
                key="normal_selection"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <NormalLevelSelection
                  records={levelRecords}
                  onSelectLevel={(id) => {
                    setSelectedLevelId(id);
                    setView("normal_play");
                  }}
                  onBackToLobby={() => setView("lobby")}
                />
              </motion.div>
            )}

            {/* 5. Normal Mode gameplay view */}
            {view === "normal_play" && selectedLevelId !== null && (
              <motion.div
                key={`normal_play_${selectedLevelId}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <NormalGameEngine
                  level={NORMAL_LEVELS.find((l) => l.id === selectedLevelId)!}
                  onBackToSelection={() => setView("normal_selection")}
                  onRecordUpdated={(latest) => setLevelRecords(latest)}
                  onNextLevel={
                    selectedLevelId < NORMAL_LEVELS.length ? handleNextLevel : undefined
                  }
                />
              </motion.div>
            )}

            {/* 6. Challenge Mode gameplay view */}
            {view === "challenge_play" && (
              <motion.div
                key="challenge_play"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <ChallengeGameEngine
                  user={user}
                  onBackToLobby={() => setView("lobby")}
                  onLeaderboardUpdated={refreshRecords}
                  onShowLeaderboard={() => setView("leaderboard")}
                />
              </motion.div>
            )}

            {/* 7. Challenge Leaderboard view */}
            {view === "leaderboard" && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <ChallengeLeaderboardView
                  currentUser={user}
                  leaderboard={challengeLeaderboard}
                  onBackToLobby={() => setView("lobby")}
                  onRestartChallenge={() => setView("challenge_play")}
                  onRefresh={refreshRecords}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Cozy aesthetic footer aligned to Natural Tones style */}
        <footer className="text-center text-sm text-natural-muted py-4 border-t border-natural-border/40 mt-4" id="footer-live-stats">
          🧩 成語拼圖遊戲大挑戰 &copy; {new Date().getFullYear()} - 輕鬆有趣的成語填字挑戰
        </footer>
      </div>
    </div>
  );
}
