import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import galleryCakeImg from "@/assets/gallery-cake.jpg";
import galleryGiftsImg from "@/assets/gallery-gifts.jpg";
import galleryToastImg from "@/assets/gallery-toast.jpg";

export type WishDesign = "Pink Mewah" | "Rose Gold Elegan" | "Pastel Floral";

export interface PhotoItem {
  id: string;
  title: string;
  url: string;
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export interface WishItem {
  id: string;
  name: string;
  message: string;
  design: WishDesign;
  likes: number;
}

export interface BirthdaySettings {
  name: string;
  date: string;
  time: string;
  loc: string;
  gift: string;
  g1: string;
  g2: string;
  g3: string;
  creatorText: string;
  creatorInstagram: string;
}

export interface ConfettiPiece {
  id: number;
  symbol: string;
  left: number;
  size: number;
  delay: number;
}

export const ADMIN_PIN = "153842";

export const DEFAULT_SETTINGS: BirthdaySettings = {
  name: "Riyanti Pohi",
  date: "2026-12-01",
  time: "19:00",
  loc: "Rumah Kita",
  gift: "Selamat Ulang Tahun Sayang! Semoga semua impianmu jadi nyata",
  g1: "Foto Kenangan: Kamu cantik banget hari ini!",
  g2: "Video Ucapan: Happy Birthday Riyanti!",
  g3: "Pesan Rahasia: Ada yang sayang banget sama kamu!",
  creatorText: "",
  creatorInstagram: "",
};

export const DEFAULT_PHOTOS: PhotoItem[] = [
  { id: "p-1", title: "Kue Ulang Tahun & Mawar", url: galleryCakeImg },
  { id: "p-2", title: "Kado & Buket Spesial", url: galleryGiftsImg },
  { id: "p-3", title: "Momen Perayaan Indah", url: galleryToastImg },
];

export const DEFAULT_WISHES: WishItem[] = [
  {
    id: "w-1",
    name: "Untuk Riyanti",
    message:
      "Selamat ulang tahun sayang! Semoga semua impianmu jadi nyata, sehat selalu, dan bahagia terus bersamaku.",
    design: "Pink Mewah",
    likes: 24,
  },
  {
    id: "w-2",
    name: "Dari Seseorang Yang Sayang Kamu",
    message:
      "Terima kasih sudah hadir di hidupku. Kamu adalah hadiah terindah yang pernah aku punya.",
    design: "Rose Gold Elegan",
    likes: 18,
  },
];

const STORAGE_KEYS = {
  photos: "riyanti_photos_v2",
  songs: "riyanti_songs_v2",
  wishes: "riyanti_wishes_v2",
  settings: "riyanti_settings_v2",
  isAdmin: "riyanti_isAdmin_v2",
};

function safeRead<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function formatIndonesianDate(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const monthName = months[monthIdx];
  if (!monthName || Number.isNaN(day) || Number.isNaN(year)) return isoDate;
  return `${String(day).padStart(2, "0")} ${monthName} ${year}`;
}

export function normalizeInstagramUrl(
  raw: string,
): { href: string; label: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const seg = url.pathname.split("/").filter(Boolean)[0];
      return {
        href: url.toString(),
        label: seg ? `@${seg.replace(/^@/, "")}` : url.hostname,
      };
    } catch {
      return null;
    }
  }

  const handle = trimmed.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  if (!handle || /\s/.test(handle)) return null;
  return {
    href: `https://instagram.com/${encodeURIComponent(handle)}`,
    label: `@${handle}`,
  };
}

interface BirthdayContextValue {
  settings: BirthdaySettings;
  photos: PhotoItem[];
  songs: SongItem[];
  wishes: WishItem[];
  likedIds: string[];
  isAdmin: boolean;
  confetti: ConfettiPiece[];
  currentSongIndex: number;
  isPlaying: boolean;
  progress: number;
  currentTimeSec: number;
  durationSec: number;
  volume: number;
  triggerConfetti: (count?: number) => void;
  saveSettings: (next: BirthdaySettings) => void;
  addPhotos: (items: Omit<PhotoItem, "id">[]) => boolean;
  deletePhoto: (id: string) => void;
  addSong: (item: Omit<SongItem, "id">) => boolean;
  deleteSong: (id: string) => void;
  addWish: (item: Omit<WishItem, "id" | "likes">) => void;
  deleteWish: (id: string) => void;
  likeWish: (id: string) => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  playSong: (index: number) => void;
  togglePlay: () => boolean;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (percent: number) => void;
  setVolume: (vol: number) => void;
}

const BirthdayContext = createContext<BirthdayContextValue | null>(null);

export function BirthdayProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BirthdaySettings>(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>(DEFAULT_WISHES);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const confettiSeq = useRef(0);

  useEffect(() => {
    const savedSettings = safeRead<BirthdaySettings>(STORAGE_KEYS.settings);
    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
    const savedPhotos = safeRead<PhotoItem[]>(STORAGE_KEYS.photos);
    if (savedPhotos !== null) setPhotos(savedPhotos);
    const savedSongs = safeRead<SongItem[]>(STORAGE_KEYS.songs);
    if (savedSongs !== null) setSongs(savedSongs);
    const savedWishes = safeRead<WishItem[]>(STORAGE_KEYS.wishes);
    if (savedWishes !== null) setWishes(savedWishes);
    if (window.localStorage.getItem(STORAGE_KEYS.isAdmin) === "1") {
      setIsAdmin(true);
    }
  }, []);

  const triggerConfetti = useCallback((count = 24) => {
    const symbols = ["💖", "✨", "🎉", "⭐", "🌸", "💗"];
    const batch: ConfettiPiece[] = Array.from({ length: count }, (_, idx) => ({
      id: ++confettiSeq.current,
      symbol: symbols[idx % symbols.length] ?? "✨",
      left: Math.random() * 96 + 2,
      size: 16 + Math.random() * 16,
      delay: Math.random() * 0.45,
    }));
    setConfetti((prev) => [...prev, ...batch]);
    window.setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      setConfetti((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 3500);
  }, []);

  const saveSettings = useCallback((next: BirthdaySettings) => {
    setSettings(next);
    safeWrite(STORAGE_KEYS.settings, next);
  }, []);

  const addPhotos = useCallback((items: Omit<PhotoItem, "id">[]) => {
    const stamped = items.map((item, idx) => ({
      ...item,
      id: `p-${Date.now()}-${idx}`,
    }));
    let ok = true;
    setPhotos((prev) => {
      const next = [...prev, ...stamped];
      ok = safeWrite(STORAGE_KEYS.photos, next);
      return next;
    });
    return ok;
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeWrite(STORAGE_KEYS.photos, next);
      return next;
    });
  }, []);

  const addSong = useCallback((item: Omit<SongItem, "id">) => {
    const stamped: SongItem = { ...item, id: `s-${Date.now()}` };
    let ok = true;
    setSongs((prev) => {
      const next = [...prev, stamped];
      ok = safeWrite(STORAGE_KEYS.songs, next);
      return next;
    });
    return ok;
  }, []);

  const deleteSong = useCallback((id: string) => {
    setSongs((prev) => {
      const next = prev.filter((s) => s.id !== id);
      safeWrite(STORAGE_KEYS.songs, next);
      return next;
    });
  }, []);

  const addWish = useCallback((item: Omit<WishItem, "id" | "likes">) => {
    const stamped: WishItem = { ...item, id: `w-${Date.now()}`, likes: 0 };
    setWishes((prev) => {
      const next = [stamped, ...prev];
      safeWrite(STORAGE_KEYS.wishes, next);
      return next;
    });
  }, []);

  const deleteWish = useCallback((id: string) => {
    setWishes((prev) => {
      const next = prev.filter((w) => w.id !== id);
      safeWrite(STORAGE_KEYS.wishes, next);
      return next;
    });
  }, []);

  const likeWish = useCallback((id: string) => {
    setLikedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setWishes((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w));
      safeWrite(STORAGE_KEYS.wishes, next);
      return next;
    });
  }, []);

  const loginAdmin = useCallback((pin: string) => {
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
      window.localStorage.setItem(STORAGE_KEYS.isAdmin, "1");
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    window.localStorage.removeItem(STORAGE_KEYS.isAdmin);
  }, []);

  const playSong = useCallback(
    (index: number) => {
      const song = songs[index];
      const audio = audioRef.current;
      if (!song || !audio) return;
      setCurrentSongIndex(index);
      audio.src = song.url;
      audio.volume = volume;
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    },
    [songs, volume],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!songs.length || !audio) return false;
    if (audio.paused) {
      if (!audio.src) {
        playSong(0);
      } else {
        void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
    return true;
  }, [playSong, songs.length]);

  const nextSong = useCallback(() => {
    if (!songs.length) return;
    playSong((currentSongIndex + 1) % songs.length);
  }, [currentSongIndex, playSong, songs.length]);

  const prevSong = useCallback(() => {
    if (!songs.length) return;
    playSong((currentSongIndex - 1 + songs.length) % songs.length);
  }, [currentSongIndex, playSong, songs.length]);

  const seekTo = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (percent / 100) * audio.duration;
    setProgress(percent);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  return (
    <BirthdayContext.Provider
      value={{
        settings,
        photos,
        songs,
        wishes,
        likedIds,
        isAdmin,
        confetti,
        currentSongIndex,
        isPlaying,
        progress,
        currentTimeSec,
        durationSec,
        volume,
        triggerConfetti,
        saveSettings,
        addPhotos,
        deletePhoto,
        addSong,
        deleteSong,
        addWish,
        deleteWish,
        likeWish,
        loginAdmin,
        logoutAdmin,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolume,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setCurrentTimeSec(el.currentTime);
          if (el.duration) {
            setDurationSec(el.duration);
            setProgress((el.currentTime / el.duration) * 100);
          }
        }}
        onEnded={nextSong}
      />
    </BirthdayContext.Provider>
  );
}

export function useBirthday() {
  const ctx = useContext(BirthdayContext);
  if (!ctx) throw new Error("useBirthday must be used within BirthdayProvider");
  return ctx;
}