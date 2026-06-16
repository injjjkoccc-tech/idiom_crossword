import React, { useState } from "react";
import { ChallengeRecord, UserProfile } from "../types";
import { Trophy, Medal, Search, Home, Play, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import { GameStorage } from "../lib/storage";

interface ChallengeLeaderboardViewProps {
  currentUser: UserProfile | null;
  leaderboard: ChallengeRecord[];
  onBackToLobby: () => void;
  onRestartChallenge: () => void;
  onRefresh?: () => Promise<void>;
}

export default function ChallengeLeaderboardView({
  currentUser,
  leaderboard,
  onBackToLobby,
  onRestartChallenge,
  onRefresh
}: ChallengeLeaderboardViewProps) {

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Retrieve current user ranking index
  const currentUserRankIndex = currentUser 
    ? leaderboard.findIndex(item => item.userId === currentUser.id) 
    : -1;

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (err) {
        console.error("Failed to refresh leaderboard scores", err);
      } finally {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  const formatCompletedAt = (ts?: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${date}日 ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col gap-6" id="leaderboard-view-container">
      
      {/* Title & Navigation */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-white p-6 rounded-3xl border-2 border-natural-border shadow-natural gap-4" id="leaderboard-header">
        <div id="leaderboard-heading-info" className="flex-1">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-earth flex items-center gap-3">
            <Trophy className="w-10 h-10 text-accent-tan fill-accent-tan/30 animate-pulse" />
            挑戰關卡排行榜（前100名）
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2" id="leaderboard-status-strip">
            <p className="text-lg text-natural-muted font-medium">
              90秒無限答題挑戰榜：答對題數越多名次越前，看看您目前排行第幾名？
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0 items-center" id="leaderboard-actions">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 px-5 py-3 text-lg font-bold bg-[#FAF7F2] hover:bg-[#EBE5D8] text-stone-700 border-2 border-dashed border-accent-tan/50 rounded-2xl cursor-pointer transition-all active:scale-95 shadow-sm ${isRefreshing ? "opacity-75" : ""}`}
              id="btn-refresh-leaderboard"
            >
              <RotateCw className={`w-5 h-5 text-accent-tan ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "更新中..." : "重新整理"}</span>
            </button>
          )}

          <button
            onClick={onRestartChallenge}
            className="flex items-center gap-1.5 px-5 py-3 text-lg font-bold bg-[#8B5E3C] hover:bg-[#6B4423] text-white border-none rounded-2xl cursor-pointer transition-all active:scale-95 shadow-sm"
            id="btn-goto-challenge"
          >
            <Play className="w-5 h-5 fill-white text-white" />
            <span>開始挑戰</span>
          </button>
          
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-5 py-3 text-lg font-bold bg-natural-border text-natural-text hover:bg-accent-tan/20 rounded-2xl cursor-pointer transition-all active:scale-95 border-none shadow-sm"
            id="btn-back-lobby-from-leaderboard"
          >
            <Home className="w-5 h-5 text-natural-text" />
            <span>回大廳</span>
          </button>
        </div>
      </div>

      {/* User's Current Standings Card */}
      {currentUser && (
        <div className="bg-[#FAF7F2] p-5 rounded-3xl border-2 border-dashed border-accent-tan/45 shadow-sm" id="user-status-strip">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4" id="strip-sub">
            <span className="text-xl font-extrabold text-natural-text flex items-center gap-2">
              👤 目前登入身分：
              <span className="bg-primary-earth text-white px-3 py-1 rounded-lg text-lg font-black">
                {currentUser.name}
              </span>
            </span>

            {currentUserRankIndex !== -1 ? (
              <span className="text-2xl font-black text-primary-earth">
                ⭐ 您目前位列：第 <span className="text-3xl text-accent-tan font-mono font-black">{currentUserRankIndex + 1}</span> 名（答對 {leaderboard[currentUserRankIndex].score} 題）
              </span>
            ) : (
              <span className="text-xl font-bold text-natural-muted font-mono">
                您的名字尚未進入前100名，快去挑戰高分吧！
              </span>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table Grid list */}
      <div className="bg-white border-2 border-natural-border rounded-3xl shadow-natural p-4 md:p-6 overflow-hidden" id="leaderboard-pane">
        
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 text-center border-b-2 border-natural-border pb-3 mb-4 text-lg font-bold text-natural-muted" id="table-head">
          <div className="col-span-3 text-left pl-4">名次梯度</div>
          <div className="col-span-6 text-left">挑戰勇士大名</div>
          <div className="col-span-3 text-right pr-4">答對題數</div>
        </div>

        {/* List content (Top 100 limit scroll room) */}
        <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-2" id="leaderboard-itemsscroll">
          {leaderboard.length === 0 ? (
            <div className="text-center text-xl text-gray-400 py-12" id="list-empty">
              挑戰關卡排行榜空空如也，等待您的佳績加入！
            </div>
          ) : (
            leaderboard.map((record, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const isCurrentUser = currentUser && record.userId === currentUser.id;

              // Border formatting for top-3
              let cardStyle = "bg-[#FAF7F2] border border-natural-border";
              
              if (isFirst) {
                cardStyle = "bg-white border-2 border-gold-med shadow-sm";
              } else if (isSecond) {
                cardStyle = "bg-white border-2 border-silver-med shadow-sm";
              } else if (isThird) {
                cardStyle = "bg-white border-2 border-bronze-med shadow-sm";
              }

              // Highlight matching local user
              if (isCurrentUser) {
                cardStyle += " border-2 border-dashed border-primary-earth font-extrabold py-5";
              }

              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 items-center gap-3 p-4 rounded-2xl ${cardStyle} transition-all`}
                  id={`rank-row-${rank}`}
                >
                  {/* Medal/Rank block */}
                  <div className="col-span-3 flex items-center pr-2" id={`rank-badge-col-${rank}`}>
                    {isFirst && (
                      <div className="flex items-center gap-2" id="gold-medal">
                        <span className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gold-med bg-yellow-50 text-primary-earth text-lg font-black">
                          👑 1
                        </span>
                      </div>
                    )}
                    {isSecond && (
                      <div className="flex items-center gap-2" id="silver-medal">
                        <span className="flex items-center justify-center w-11 h-11 rounded-full border-2 border-silver-med bg-slate-50 text-natural-text text-md font-black">
                          🥈 2
                        </span>
                      </div>
                    )}
                    {isThird && (
                      <div className="flex items-center gap-2" id="bronze-medal">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-bronze-med bg-[#FFF8F4] text-primary-earth text-md font-black">
                          🥉 3
                        </span>
                      </div>
                    )}
                    {!isFirst && !isSecond && !isThird && (
                      <span className="pl-4 text-xl font-bold text-natural-muted font-mono" id={`rank-number-${rank}`}>
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Player Name */}
                  <div className="col-span-6 flex flex-col justify-center text-left" id={`rank-name-col-${rank}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-natural-text truncate" id={`rank-username-${rank}`}>
                        {record.userName}
                      </span>
                      {isCurrentUser && (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-black bg-primary-earth text-white rounded-md animate-bounce" id={`user-self-flag-${rank}`}>
                          （您自己）
                        </span>
                      )}
                    </div>
                    {record.completedAt && (
                      <span className="text-xs text-stone-500 font-bold mt-1 font-mono">
                        挑戰時間：{formatCompletedAt(record.completedAt)}
                      </span>
                    )}
                  </div>

                  {/* Solved Count */}
                  <div className="col-span-3 text-right pr-4 font-mono font-black text-2xl text-primary-earth" id={`rank-seconds-col-${rank}`}>
                    {record.score} 題
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
