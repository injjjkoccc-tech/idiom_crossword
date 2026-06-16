import React, { useState } from "react";
import { UserProfile } from "../types";
import { GameStorage } from "../lib/storage";
import { Sparkles, User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface UserSettingScreenProps {
  onSave: (user: UserProfile) => void;
  initialUser?: UserProfile | null;
  onCancel?: () => void;
}

export default function UserSettingScreen({ onSave, initialUser, onCancel }: UserSettingScreenProps) {
  const [name, setName] = useState(initialUser ? initialUser.name : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("請輸入您的名字或暱稱喔！");
      return;
    }
    if (name.trim().length > 12) {
      setError("名字不要超過 12 個字喔，好記最重要！");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const profile = await GameStorage.saveUserProfile(name.trim());
      onSave(profile);
    } catch (err) {
      setError("儲存失敗，請再試一次。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-[#FAF7F2] rounded-3xl" id="setting-screen-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl p-8 bg-white border-2 border-natural-border rounded-3xl shadow-natural-lg text-center"
        id="setting-panel"
      >
        <div className="flex justify-center mb-6" id="setting-avatar-wrapper">
          <div className="p-6 bg-accent-tan/20 rounded-full border-2 border-accent-tan text-primary-earth">
            <User className="w-16 h-16" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-primary-earth mb-3 tracking-wide" id="setting-title">
          {initialUser ? "修改您的稱呼" : "歡迎來到成語拼圖！"}
        </h1>
        
        <p className="text-xl text-natural-muted mb-8 leading-relaxed font-medium" id="setting-subtitle">
          {initialUser 
            ? "請於下方輸入新的大名，讓其他玩家看到您的新稱呼喔！"
            : "在開始挑戰之前，請告訴我們大家該怎麼稱呼您呢？所有玩家都可以看到您的輝煌記錄喔！"
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" id="setting-form">
          <div className="relative" id="input-container">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              placeholder="例如：小明、小華、小美..."
              className="w-full px-6 py-5 text-2xl font-bold text-natural-text bg-[#FAF7F2] border-2 border-accent-tan rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-earth focus:border-primary-earth placeholder:text-natural-muted/50 text-center"
              maxLength={12}
              autoFocus
              id="player-name-input"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-lg font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200"
              id="setting-error"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4" id="setting-action-buttons">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-5 text-2xl font-bold bg-natural-border text-natural-text border-none rounded-2xl cursor-pointer hover:bg-natural-border/85 transition-colors shadow-sm"
                id="btn-cancel"
              >
                返回遊戲
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 text-2xl font-bold bg-[#8B5E3C] hover:bg-[#6B4423] text-white border-none rounded-2xl shadow-natural cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              id="btn-submit-name"
            >
              <span>{loading ? "設定中..." : "確認名稱，出發！"}</span>
              <ArrowRight className="w-8 h-8" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        <p className="mt-8 text-md font-medium text-natural-muted font-mono" id="setting-warning">
          👵🏼 貼心提醒：文字都可以放大顯示，不卡關、最合手！
        </p>
      </motion.div>
    </div>
  );
}
