import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDocFromServer
} from "firebase/firestore";
import { UserProfile, LevelRecord, ChallengeRecord } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

// Local storage key constants
const KEY_USER = "idiom_puzzle_user";
const KEY_LOCAL_LEVELS = "idiom_puzzle_local_level_records_release_v1";
const KEY_LOCAL_CHALLENGE = "idiom_puzzle_local_challenge_leaderboard_release_v1";

// Pre-seeded records for general levels, creating realistic peer entries
const DEFAULT_LEVEL_RECORDS: LevelRecord[] = [];

// Pre-seeded scores for Challenge Mode crossword (completed target grid within 90s)
const DEFAULT_CHALLENGE_RECORDS: ChallengeRecord[] = [];

// Determine if Firebase is provisioned
let isFirebaseActive = false;
let db: any = null;

const config = (firebaseConfig as any)?.default || firebaseConfig;

if (config && config.apiKey && config.projectId) {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app, config.firestoreDatabaseId);
    isFirebaseActive = true;
    console.log("Firebase is initialized and active for game synchronization! DatabaseId:", config.firestoreDatabaseId);
  } catch (e) {
    console.error("Firebase config detected but connection failed. Using local storage fallback.", e);
  }
} else {
  console.warn("Firebase configuration is missing or incomplete in imports.", config);
}

// Generate unique local ID
function generateLocalId(): string {
  return "user_" + Math.random().toString(36).substring(2, 11);
}

export const GameStorage = {
  // Check if real Firebase database is active
  isFirebase(): boolean {
    return isFirebaseActive;
  },

  // 1. Get or create current user profile
  async getCurrentUser(): Promise<UserProfile | null> {
    const localUserRaw = localStorage.getItem(KEY_USER);
    if (!localUserRaw) return null;
    
    const localUser = JSON.parse(localUserRaw) as UserProfile;
    
    if (isFirebaseActive && db) {
      try {
        const uDoc = await getDoc(doc(db, "users", localUser.id));
        if (uDoc.exists()) {
          const remoteData = uDoc.data();
          localUser.name = remoteData.name || localUser.name;
          localStorage.setItem(KEY_USER, JSON.stringify(localUser));
        } else {
          // Sync existing local user to remote
          await setDoc(doc(db, "users", localUser.id), {
            id: localUser.id,
            name: localUser.name,
            createdAt: localUser.createdAt
          });
        }
      } catch (err) {
        console.warn("Failed to sync user to Firestore, utilizing local cached card", err);
      }
    }
    return localUser;
  },

  // 2. Set or edit current user profile
  async saveUserProfile(name: string): Promise<UserProfile> {
    let currentUser = await this.getCurrentUser();
    
    if (!currentUser) {
      currentUser = {
        id: generateLocalId(),
        name: name.trim() || "匿名玩家",
        createdAt: Date.now()
      };
    } else {
      currentUser.name = name.trim() || "匿名玩家";
    }

    // Save to local storage
    localStorage.setItem(KEY_USER, JSON.stringify(currentUser));

    // Propagate username updates to local normal level records
    try {
      const localLevelsRaw = localStorage.getItem(KEY_LOCAL_LEVELS);
      if (localLevelsRaw) {
        const records = JSON.parse(localLevelsRaw) as LevelRecord[];
        let altered = false;
        const updated = records.map(r => {
          if (r.userId === currentUser!.id) {
            altered = true;
            return { ...r, userName: currentUser!.name };
          }
          return r;
        });
        if (altered) {
          localStorage.setItem(KEY_LOCAL_LEVELS, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn("Error updating local levels username", e);
    }

    // Propagate username updates to local challenge records
    try {
      const localChallengeRaw = localStorage.getItem(KEY_LOCAL_CHALLENGE);
      if (localChallengeRaw) {
        const records = JSON.parse(localChallengeRaw) as ChallengeRecord[];
        let altered = false;
        const updated = records.map(r => {
          if (r.userId === currentUser!.id) {
            altered = true;
            return { ...r, userName: currentUser!.name };
          }
          return r;
        });
        if (altered) {
          localStorage.setItem(KEY_LOCAL_CHALLENGE, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn("Error updating local challenge username", e);
    }

    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser)
      });
    } catch (e) {
      console.warn("Failed to sync profile to Express API");
    }

    // Save to Firestore if active
    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "users", currentUser.id), {
          id: currentUser.id,
          name: currentUser.name,
          createdAt: currentUser.createdAt
        });

        // Update username in all Firestore challenge leaderboard records for this user
        try {
          const challengeQuery = query(collection(db, "challenge_leaderboard"), where("userId", "==", currentUser.id));
          const challengeSnapshot = await getDocs(challengeQuery);
          for (const docSnap of challengeSnapshot.docs) {
            await setDoc(docSnap.ref, { userName: currentUser.name }, { merge: true });
          }
        } catch (err) {
          console.warn("Failed to propagate name to firestore challenge_leaderboard", err);
        }
      } catch (err) {
        console.warn("Failed to write profile or propagate name to Firestore Collections", err);
      }
    }

    return currentUser;
  },

  // 3. Retrieve Normal level records for the current user (personal bests)
  async getLevelRecords(): Promise<LevelRecord[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    // Local Storage - Personal records are kept locally on the player's device
    const localRecordsRaw = localStorage.getItem(KEY_LOCAL_LEVELS);
    if (!localRecordsRaw) {
      localStorage.setItem(KEY_LOCAL_LEVELS, JSON.stringify([]));
      return [];
    }
    try {
      const parsed = JSON.parse(localRecordsRaw) as LevelRecord[];
      // Filter strictly by current user
      return parsed.filter(r => r.userId === user.id);
    } catch (e) {
      return [];
    }
  },

  // 4. Save a normal level completion time
  async saveLevelRecord(levelId: string, seconds: number): Promise<LevelRecord | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const allRecords = await this.getLevelRecords(); // already filtered for current user
    const existingIdx = allRecords.findIndex(r => r.levelId === levelId);
    
    let isNewRecord = false;
    let newRecordObject: LevelRecord = {
      levelId,
      userId: user.id,
      userName: user.name,
      seconds,
      achievedAt: Date.now()
    };

    if (existingIdx === -1) {
      isNewRecord = true;
    } else {
      const currentBest = allRecords[existingIdx];
      // Faster time saves as new personal record
      if (seconds < currentBest.seconds) {
        isNewRecord = true;
      }
    }

    if (!isNewRecord) {
      return null; // Did not beat personal best
    }

    // Save locally
    const localRecordsRaw = localStorage.getItem(KEY_LOCAL_LEVELS);
    let localRecords: LevelRecord[] = [];
    if (localRecordsRaw) {
      try {
        localRecords = JSON.parse(localRecordsRaw);
      } catch (e) {}
    }
    // Filter out old records for this level and this user
    localRecords = localRecords.filter(r => !(r.levelId === levelId && r.userId === user.id));
    localRecords.push(newRecordObject);
    localStorage.setItem(KEY_LOCAL_LEVELS, JSON.stringify(localRecords));

    return newRecordObject;
  },

  // 5. Get top 100 in challenge leaderboard
  async getChallengeLeaderboard(): Promise<ChallengeRecord[]> {
    let remoteRecords: ChallengeRecord[] = [];
    let hasRemoteFetched = false;

    // Fetch from our local Express API
    try {
      const response = await fetch("/api/challenge");
      if (response.ok) {
        const data = await response.json();
        remoteRecords = data.records;
        hasRemoteFetched = true;
      }
    } catch (err) {
      console.warn("Failed to pull remote challenge records, using local storage list", err);
    }
    
    // In case there is an old Firebase active check, skip it for this new API:
    if (isFirebaseActive && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "challenge_leaderboard"));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.limitSeconds !== 90) return;
          remoteRecords.push({
            userId: data.userId || "",
            userName: data.userName || "未知挑戰者",
            score: data.score !== undefined ? data.score : Math.max(1, 60 - (data.secondsSpent || 60)),
            completedAt: data.completedAt || Date.now(),
            limitSeconds: 90,
            secondsSpent: 90
          });
        });
        hasRemoteFetched = true;
      } catch (err) {
        console.warn("Failed to pull Firebase challenge records", err);
      }
    }

    if (hasRemoteFetched) {
      // Deduplicate by userId and completedAt so that duplicate entries from Express and Firestore are merged
      const uniqueMap = new Map<string, ChallengeRecord>();
      remoteRecords.forEach(r => {
        const key = `${r.userId}_${r.completedAt}`;
        const existing = uniqueMap.get(key);
        if (!existing || r.score > existing.score) {
          uniqueMap.set(key, r);
        }
      });
      const deduplicated = Array.from(uniqueMap.values());

      return deduplicated.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completedAt - b.completedAt;
      }).slice(0, 100);
    }

    // Local Storage fallback
    const localChallengeRaw = localStorage.getItem(KEY_LOCAL_CHALLENGE);
    if (!localChallengeRaw) {
      localStorage.setItem(KEY_LOCAL_CHALLENGE, JSON.stringify([]));
      return [];
    }

    try {
      const parsed = JSON.parse(localChallengeRaw) as ChallengeRecord[];
      const filtered = parsed.filter(item => item.limitSeconds === 90);
      return filtered.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completedAt - b.completedAt;
      }).slice(0, 100);
    } catch (e) {
      return [];
    }
  },

  // 6. Submit a challenge record (highest score within 90s)
  async saveChallengeRecord(score: number): Promise<ChallengeRecord | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const newRecord: ChallengeRecord = {
      userId: user.id,
      userName: user.name,
      score,
      completedAt: Date.now(),
      limitSeconds: 90,
      secondsSpent: 90
    };

    // Save locally
    const currentList = await this.getChallengeLeaderboard();
    currentList.push(newRecord);
    
    // Deduplicate currentList local copy before storing
    const localUniqueMap = new Map<string, ChallengeRecord>();
    currentList.forEach(r => {
      const key = `${r.userId}_${r.completedAt}`;
      const existing = localUniqueMap.get(key);
      if (!existing || r.score > existing.score) {
        localUniqueMap.set(key, r);
      }
    });

    const sorted = Array.from(localUniqueMap.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.completedAt - b.completedAt;
    }).slice(0, 100);
    localStorage.setItem(KEY_LOCAL_CHALLENGE, JSON.stringify(sorted));

    // Express App Sync
    try {
      await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      });
    } catch(e) {
      console.warn("Failed to submit score to Express server");
    }

    // Firebase sync
    if (isFirebaseActive && db) {
      try {
        const uniqueRecordId = `${user.id}_${newRecord.completedAt}`;
        await setDoc(doc(db, "challenge_leaderboard", uniqueRecordId), newRecord);
      } catch (err) {
        console.warn("Failed to submit score to Firestore", err);
      }
    }
    return newRecord;
  }
};
