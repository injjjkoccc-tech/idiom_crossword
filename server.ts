import express from "express";
import path from "path";
import fs from "fs";

interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
}

interface ChallengeRecord {
  userId: string;
  userName: string;
  score: number;
  completedAt: number;
  limitSeconds: number;
  secondsSpent: number;
}

interface LevelRecord {
  levelId: string;
  userId: string;
  userName: string;
  seconds: number;
}

interface GameData {
  users: UserProfile[];
  challengeRecords: ChallengeRecord[];
  levelRecords: LevelRecord[];
}

const DB_PATH = path.join(process.cwd(), "game_data.json");

function loadDb(): GameData {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content) as GameData;
    } catch (e) {
      console.error("Error parsing DB", e);
    }
  }
  return { users: [], challengeRecords: [], levelRecords: [] };
}

function saveDb(data: GameData) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing DB", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // API Routes
  
  // 1. Submit Challenge Record
  app.post("/api/challenge", (req, res) => {
    const record = req.body as ChallengeRecord;
    const db = loadDb();
    
    // Add the record
    db.challengeRecords.push(record);
    
    // Maintain top 100 max globally
    const sorted = db.challengeRecords.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.completedAt - b.completedAt;
    }).slice(0, 500); // keeping top 500 in db
    
    db.challengeRecords = sorted;
    saveDb(db);
    res.json({ success: true });
  });

  // 2. Get Challenge Leaderboard
  app.get("/api/challenge", (req, res) => {
    const db = loadDb();
    const sorted = db.challengeRecords.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.completedAt - b.completedAt;
    }).slice(0, 100);
    res.json({ records: sorted });
  });

  // 3. User Profile Update (to sync name changes everywhere)
  app.post("/api/user", (req, res) => {
    const user = req.body as UserProfile;
    const db = loadDb();
    
    // Add or update user
    const existingIndex = db.users.findIndex(u => u.id === user.id);
    if (existingIndex !== -1) {
      db.users[existingIndex] = user;
    } else {
      db.users.push(user);
    }

    // Update names in all records
    db.challengeRecords = db.challengeRecords.map(r => {
      if (r.userId === user.id) {
        return { ...r, userName: user.name };
      }
      return r;
    });

    db.levelRecords = db.levelRecords.map(r => {
      if (r.userId === user.id) {
        return { ...r, userName: user.name };
      }
      return r;
    });

    saveDb(db);
    res.json({ success: true });
  });

  // 4. Update/Submit Level Record
  app.post("/api/levels", (req, res) => {
    const record = req.body as LevelRecord;
    const db = loadDb();
    
    // Find if user already has a record for this level
    const existing = db.levelRecords.findIndex(r => r.userId === record.userId && r.levelId === record.levelId);
    if (existing !== -1) {
      // Only keep the best (lowest) time
      if (record.seconds < db.levelRecords[existing].seconds) {
        db.levelRecords[existing] = record;
      }
    } else {
      db.levelRecords.push(record);
    }
    
    saveDb(db);
    res.json({ success: true });
  });

  // 5. Get Level Record for a user
  app.get("/api/levels", (req, res) => {
    const userId = req.query.userId as string;
    const db = loadDb();
    if (userId) {
      const userRecords = db.levelRecords.filter(r => r.userId === userId);
      res.json({ records: userRecords });
    } else {
      res.json({ records: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React Router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
