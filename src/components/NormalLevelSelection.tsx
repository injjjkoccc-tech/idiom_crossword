import React from "react";
import { NormalLevel, LevelRecord } from "../types";
import { NORMAL_LEVELS } from "../data";
import { Award, Trophy, Play, Home } from "lucide-react";
import { motion } from "motion/react";

interface NormalLevelSelectionProps {
  records: LevelRecord[];
  onSelectLevel: (levelId: number) => void;
  onBackToLobby: () => void;
}

export default function NormalLevelSelection({
  records,
  onSelectLevel,
  onBackToLobby
}: NormalLevelSelectionProps) {

  // Retrieve record holder for a level
  const getRecordForLevel = (levelId: number) => {
    return records.find((r) => r.levelId === `level_${levelId}`);
  };

  return (
    <div className="flex flex-col gap-6" id="level-selection-container">
      {/* Header with Title and Back Home Button */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl border-2 border-natural-border shadow-natural gap-4" id="level-selection-header">
        <div id="selection-heading-block">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary-earth flex items-center gap-3">
            <Trophy className="w-10 h-10 text-accent-tan fill-accent-tan/30" />
            一般關卡選擇
          </h2>
          <p className="text-lg text-natural-muted font-medium mt-1">
            從簡單到困難（共有10關），挑戰大師級成語敏捷度！
          </p>
        </div>
        
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-6 py-3.5 text-xl font-bold bg-natural-border text-natural-text hover:bg-accent-tan/20 rounded-2xl cursor-pointer transition-all active:scale-95 border-none shadow-sm"
          id="btn-back-to-lobby-from-selection"
        >
          <Home className="w-6 h-6 text-natural-text" />
          <span>返回大廳</span>
        </button>
      </div>

      {/* Grid List of 10 Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="level-selection-grid">
        {NORMAL_LEVELS.map((level, idx) => {
          const record = getRecordForLevel(level.id);
          
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="group relative flex flex-col justify-between bg-[#FAF7F2] border-2 border-accent-tan rounded-3xl p-6 shadow-natural hover:shadow-natural-lg hover:border-primary-earth transition-all"
              id={`level-card-${level.id}`}
            >
              <div className="flex justify-between items-start mb-4" id={`level-card-top-${level.id}`}>
                <div id={`level-card-meta-${level.id}`}>
                  <span className="inline-block px-3 py-1 bg-white border border-accent-tan rounded-lg text-primary-earth text-sm font-extrabold mb-2" id={`level-num-badge-${level.id}`}>
                    等級 {level.id}
                  </span>
                  <h3 className="text-3xl font-black text-natural-text mb-1 leading-tight group-hover:text-primary-earth transition-colors" id={`level-title-${level.id}`}>
                    {level.name.split(" - ")[1]}
                  </h3>
                  <p className="text-md text-natural-muted font-bold" id={`level-group-count-${level.id}`}>
                     包含 {level.idioms.length} 組成語需要填空
                  </p>
                </div>

                <div 
                  className="p-3 bg-accent-tan/10 text-primary-earth rounded-full border border-accent-tan/30"
                  id={`level-star-ico-${level.id}`}
                >
                  <Award className="w-7 h-7" />
                </div>
              </div>

              {/* Record Holder Section */}
              <div 
                className="bg-white p-4 rounded-2xl border border-natural-border flex items-center justify-between gap-3 mb-6 shadow-sm"
                id={`level-record-section-${level.id}`}
              >
                <div className="flex items-center gap-2" id={`record-holder-info-${level.id}`}>
                  <Trophy className="w-6 h-6 text-accent-tan shrink-0" />
                  <span className="text-lg font-extrabold text-natural-text">
                    個人最高紀錄
                  </span>
                </div>
                {record ? (
                  <div className="text-right" id={`record-holder-score-${level.id}`}>
                    <span className="text-xl font-black text-primary-earth">
                      {record.seconds} 秒
                    </span>
                  </div>
                ) : (
                  <span className="text-lg text-gray-400 font-medium font-mono">
                    尚無挑戰紀錄
                  </span>
                )}
              </div>

              {/* Play Button */}
              <button
                onClick={() => onSelectLevel(level.id)}
                className="w-full flex items-center justify-center gap-2 py-4 text-2xl font-extrabold bg-[#8B5E3C] hover:bg-[#6B4423] text-white rounded-2xl cursor-pointer transition-all active:scale-98 border-none shadow-sm"
                id={`btn-play-level-${level.id}`}
              >
                <Play className="w-6 h-6 fill-white text-white" />
                <span>立即挑戰關卡</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
