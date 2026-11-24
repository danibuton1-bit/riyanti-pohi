import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Music, Pause, Play, SkipForward, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useBirthday } from "@/lib/birthday-store";

const NAV_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/galeri", label: "Galeri" },
  { to: "/ucapan", label: "Ucapan" },
  { to: "/admin", label: "Admin" },
] as const;

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function BirthdayShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    settings,
    songs,
    confetti,
    currentSongIndex,
    isPlaying,
    progress,
    currentTimeSec,
    durationSec,
    volume,
    triggerConfetti,
    togglePlay,
    nextSong,
    seekTo,
    setVolume,
  } = useBirthday();
  const [balloons, setBalloons] = useState([true, true]);

  const currentSong = songs[currentSongIndex];

  const popBalloon = (idx: number) => {
    setBalloons((prev) => prev.map((v, i) => (i === idx ? false : v)));
    triggerConfetti(28);
  };

  const handleTogglePlay = () => {
    if (!togglePlay()) {
      toast.info("Belum ada lagu. Upload dulu di halaman Admin.");
    }
  };

  return (
    <div className="relative min-h-screen pb-28">
      {/* Confetti overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="animate-confetti fixed top-0 select-none"
            style={{
              left: `${piece.left}%`,
              fontSize: `${piece.size}px`,
              animationDelay: `${piece.delay}s`,
            }}
          >
            {piece.symbol}
          </span>
        ))}
      </div>

      {/* Floating interactive balloons */}
      {balloons[0] && (
        <button
          type="button"
          onClick={() => popBalloon(0)}
          aria-label="Pecahkan balon kiri"
          className="animate-balloon fixed left-3 top-28 z-20 hidden cursor-pointer text-4xl drop-shadow-sm transition-transform hover:scale-110 md:block"
        >
          🎈
        </button>
      )}
      {balloons[1] && (
        <button
          type="button"
          onClick={() => popBalloon(1)}
          aria-label="Pecahkan balon kanan"
          className="animate-balloon fixed right-3 top-44 z-20 hidden cursor-pointer text-4xl drop-shadow-sm transition-transform hover:scale-110 md:block"
          style={{ animationDelay: "0.9s" }}
        >
          🎈
        </button>
      )}

      {/* Sticky luxury rose-gold header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 py-3 sm:flex-nowrap sm:px-6 sm:py-3.5">
          <Link to="/" className="flex shrink-0 items-center gap-1.5 text-rose-gold-deep">
            <Sparkles className="h-4 w-4 text-rose-gold sm:h-5 sm:w-5" />
            <span className="font-serif text-lg font-bold tracking-wide sm:text-2xl">
              {settings.name}
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-2" aria-label="Navigasi utama">
            {NAV_LINKS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    active
                      ? "btn-rose-gold rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-4 sm:py-1.5 sm:text-sm"
                      : "rounded-full px-2 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-blush-soft hover:text-rose-gold-deep sm:px-4 sm:py-1.5 sm:text-sm"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">{children}</main>

      <footer className="mt-14 border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Website pribadi untuk {settings.name} • Dibuat dengan cinta
      </footer>

      {/* Persistent bottom rose-gold music bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? "Jeda musik" : "Putar musik"}
            className="btn-rose-gold flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>

          <div className="min-w-0 flex-1 sm:max-w-52">
            <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-foreground sm:text-sm">
              <Music className="h-3.5 w-3.5 shrink-0 text-rose-gold" />
              <span className="truncate">
                {currentSong ? currentSong.title : "Happy Birthday - Soft Piano"}
              </span>
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {currentSong ? currentSong.artist || "Now Playing" : "Now Playing"}
            </p>
          </div>

          <div className="hidden flex-1 items-center gap-2 sm:flex">
            <span className="w-9 text-right text-[11px] text-muted-foreground">
              {formatSec(currentTimeSec)}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Progres lagu"
              className="h-1.5 flex-1 cursor-pointer accent-primary"
            />
            <span className="w-9 text-[11px] text-muted-foreground">
              {formatSec(durationSec)}
            </span>
          </div>

          <div className="hidden items-center gap-1.5 md:flex">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              aria-label="Volume musik"
              className="h-1.5 w-20 cursor-pointer accent-primary"
            />
          </div>

          <button
            type="button"
            onClick={nextSong}
            aria-label="Lagu berikutnya"
            className="btn-blush-outline flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}