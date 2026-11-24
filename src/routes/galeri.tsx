import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Disc3,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useBirthday } from "@/lib/birthday-store";

export const Route = createFileRoute("/galeri")({
  head: () => ({
    meta: [
      { title: "Galeri & Musik — Selamat Ulang Tahun Riyanti Pohi" },
      {
        name: "description",
        content: "Galeri foto kenangan indah dan playlist lagu spesial untuk Riyanti Pohi.",
      },
      { property: "og:title", content: "Galeri & Musik — Riyanti Pohi" },
      {
        property: "og:description",
        content: "Galeri foto kenangan indah dan playlist lagu spesial untuk Riyanti Pohi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GaleriPage,
});

function GaleriPage() {
  const {
    settings,
    photos,
    songs,
    currentSongIndex,
    isPlaying,
    progress,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
  } = useBirthday();
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  useEffect(() => {
    if (window.location.hash === "#musicCard") {
      const el = document.getElementById("musicCard");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const activePhoto = activePhotoIdx !== null ? photos[activePhotoIdx] : undefined;
  const currentSong = songs[currentSongIndex];

  const showPrevPhoto = () => {
    if (activePhotoIdx === null || !photos.length) return;
    setActivePhotoIdx((activePhotoIdx - 1 + photos.length) % photos.length);
  };

  const showNextPhoto = () => {
    if (activePhotoIdx === null || !photos.length) return;
    setActivePhotoIdx((activePhotoIdx + 1) % photos.length);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-start">
      {/* Gallery section */}
      <section className="luxury-card p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-rose-gold-deep sm:text-4xl">Galeri</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kenangan indah {settings.name} • {photos.length} foto kenangan
          </p>
        </div>

        {photos.length === 0 ? (
          <p className="rounded-2xl bg-blush-soft/70 p-8 text-center text-sm text-muted-foreground">
            Belum ada foto kenangan. Tambahkan foto melalui halaman Admin.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className="ornate-frame group cursor-pointer text-left transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="overflow-hidden rounded-[0.7rem] bg-card">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Music playlist section */}
      <section id="musicCard" className="luxury-card border-rose-gold/50 p-6 sm:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-rose-gold-deep">Musik</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Playlist Untuk {settings.name} • {songs.length} Lagu
          </p>
        </div>

        {/* Now playing showcase */}
        <div className="mt-6 rounded-2xl border border-border bg-blush-mist p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blush-soft text-rose-gold-deep shadow-inner">
              <Disc3 className={`h-9 w-9 ${isPlaying ? "animate-spin" : ""}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {currentSong ? currentSong.title : "Happy Birthday - Soft Piano"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {currentSong ? currentSong.artist : "Upload lagu di halaman Admin"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevSong}
              aria-label="Lagu sebelumnya"
              className="btn-blush-outline flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!togglePlay()) toast.info("Belum ada lagu, upload dulu di Admin.");
              }}
              aria-label={isPlaying ? "Jeda" : "Putar"}
              className="btn-rose-gold flex h-12 w-12 cursor-pointer items-center justify-center rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={nextSong}
              aria-label="Lagu berikutnya"
              className="btn-blush-outline flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Progres pemutaran"
            className="mt-4 h-1.5 w-full cursor-pointer accent-primary"
          />
        </div>

        <h3 className="mt-6 text-center text-xl font-semibold text-rose-gold-deep">
          Daftar Putar
        </h3>

        {songs.length === 0 ? (
          <p className="mt-3 rounded-xl bg-blush-soft/70 p-4 text-center text-sm text-muted-foreground">
            Belum ada lagu. Upload dari Admin.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {songs.map((song, idx) => {
              const active = idx === currentSongIndex && isPlaying;
              return (
                <li
                  key={song.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-blush-mist px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{song.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {song.artist || "Untuk Riyanti"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playSong(idx)}
                    className="btn-rose-gold shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold"
                  >
                    {active ? "Diputar" : "Play"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Lightbox modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/65 p-4 backdrop-blur-xs"
          onClick={() => setActivePhotoIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
        >
          <div
            className="luxury-card relative w-full max-w-lg p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhotoIdx(null)}
              aria-label="Tutup foto"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blush-soft text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={activePhoto.url}
              alt={activePhoto.title}
              className="max-h-[65vh] w-full rounded-2xl object-cover"
            />
            <p className="mt-3 font-serif text-xl font-semibold text-rose-gold-deep">
              {activePhoto.title}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={showPrevPhoto}
                className="btn-blush-outline inline-flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" /> Sebelumnya
              </button>
              <button
                type="button"
                onClick={showNextPhoto}
                className="btn-rose-gold inline-flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold"
              >
                Berikutnya <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}