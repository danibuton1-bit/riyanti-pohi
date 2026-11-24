import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Calendar, Clock, Flame, Gift, Image, MapPin, Music, Sparkles, X } from "lucide-react";
import heroCakeImg from "@/assets/hero-cake.jpg";
import { formatIndonesianDate, useBirthday } from "@/lib/birthday-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selamat Ulang Tahun Riyanti Pohi" },
      {
        name: "description",
        content:
          "Untuk perempuan paling istimewa, hari ini dan selamanya. Rayakan hari ulang tahun Riyanti Pohi bersama kado, galeri, musik, dan ucapan.",
      },
      { property: "og:title", content: "Selamat Ulang Tahun Riyanti Pohi" },
      {
        property: "og:description",
        content:
          "Rayakan hari istimewa Riyanti Pohi dengan kebahagiaan, cinta, dan momen yang tak terlupakan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BerandaPage,
});

function computeCountdown(dateStr: string, timeStr: string): string {
  const cleanTime = /^\d{2}:\d{2}/.test(timeStr) ? timeStr.slice(0, 5) : "19:00";
  const target = new Date(`${dateStr}T${cleanTime}:00`).getTime();
  if (Number.isNaN(target)) return "Hari Istimewa Menanti!";
  const diff = target - Date.now();
  if (diff <= 0) return "Hari Ini Adalah Hari Istimewamu! 🎉";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff / 3_600_000) % 24);
  const mins = Math.floor((diff / 60_000) % 60);
  const secs = Math.floor((diff / 1_000) % 60);
  return `${days} Hari • ${hours} Jam • ${mins} Menit • ${secs} Detik`;
}

function BerandaPage() {
  const { settings, triggerConfetti } = useBirthday();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState("Menghitung mundur...");
  const [giftShaking, setGiftShaking] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [smallGiftIdx, setSmallGiftIdx] = useState<number | null>(null);
  const [candlesLit, setCandlesLit] = useState(true);

  useEffect(() => {
    const update = () => setCountdown(computeCountdown(settings.date, settings.time));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [settings.date, settings.time]);

  const fullTitle = `Selamat Ulang Tahun ${settings.name}!`;

  const handleOpenGift = () => {
    setGiftShaking(true);
    window.setTimeout(() => {
      setGiftShaking(false);
      setGiftOpened(true);
      triggerConfetti(36);
    }, 480);
  };

  const smallGifts = [
    { title: "Foto Kenangan", label: "Kado 1", text: settings.g1 },
    { title: "Video Ucapan", label: "Kado 2", text: settings.g2 },
    { title: "Pesan Rahasia", label: "Kado 3", text: settings.g3 },
  ];
  const activeSmallGift = smallGiftIdx !== null ? smallGifts[smallGiftIdx] : undefined;

  return (
    <div className="space-y-8">
      {/* Luxury Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 p-6 sm:p-10 lg:pr-4">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-deep">
              <Sparkles className="h-3.5 w-3.5 text-rose-gold" />
              Perayaan Istimewa
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-[1.12] text-rose-gold-deep sm:text-6xl">
              {fullTitle.split(" ").map((word, wordIdx, words) => {
                const offset = words.slice(0, wordIdx).join(" ").length + (wordIdx > 0 ? 1 : 0);
                return (
                  <span key={`${word}-${wordIdx}`} className="mr-[0.25em] inline-block whitespace-nowrap">
                    {Array.from(word).map((char, charIdx) => (
                      <span
                        key={`${char}-${charIdx}`}
                        className="animate-letter-fall"
                        style={{ animationDelay: `${(offset + charIdx) * 0.03}s` }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                );
              })}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/85 sm:text-base">
              Untuk perempuan paling istimewa, hari ini dan selamanya. Rayakan hari istimewa
              dengan kebahagiaan, cinta, dan momen yang tak terlupakan.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/galeri"
                className="btn-rose-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                <Image className="h-4 w-4" />
                Lihat Galeri
              </Link>
              <button
                type="button"
                onClick={() => void navigate({ to: "/galeri", hash: "musicCard" })}
                className="btn-blush-outline inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                <Music className="h-4 w-4" />
                Dengarkan Musik
              </button>
            </div>

            {/* Countdown pill */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-rose-gold-light bg-blush-mist px-4 py-2 text-xs font-semibold text-rose-gold-deep shadow-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-rose-gold" />
              <span>{countdown}</span>
            </div>

            {/* Event info badges */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/80 bg-blush-mist px-4 py-3">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-rose-gold" /> Tanggal
                </span>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatIndonesianDate(settings.date)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-blush-mist px-4 py-3">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-rose-gold" /> Jam
                </span>
                <p className="mt-1 text-sm font-semibold text-foreground">{settings.time}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-blush-mist px-4 py-3">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-rose-gold" /> Lokasi
                </span>
                <p className="mt-1 text-sm font-semibold text-foreground">{settings.loc}</p>
              </div>
            </div>
          </div>

          <div className="relative h-72 w-full sm:h-96 lg:h-full lg:min-h-[460px]">
            <img
              src={heroCakeImg}
              alt={`Kue ulang tahun mewah untuk ${settings.name}`}
              width={1280}
              height={960}
              className="h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-card lg:via-card/15 lg:to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Interactive Gift & Birthday Cake Band */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Buka Kado Spesial */}
        <section className="luxury-card p-6 text-center sm:p-8">
          <h2 className="text-3xl font-bold text-rose-gold-deep">Buka Kado Spesial</h2>
          <p className="mt-1 text-sm text-muted-foreground">Klik kadonya ya, Sayang!</p>

          <div className="my-5 flex flex-col items-center">
            <button
              type="button"
              onClick={handleOpenGift}
              aria-label="Buka kado utama"
              className={`cursor-pointer text-8xl leading-none transition-transform hover:scale-105 ${
                giftShaking ? "animate-gift-shake" : ""
              }`}
            >
              {giftOpened ? "💝" : "🎁"}
            </button>
            <button
              type="button"
              onClick={handleOpenGift}
              className="btn-rose-gold mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              <Gift className="h-4 w-4" />
              Klik Untuk Buka Kado
            </button>
          </div>

          {giftOpened && (
            <div className="animate-gift-pop mt-5 rounded-2xl border-2 border-dashed border-rose-gold bg-blush-soft/70 p-5">
              <h3 className="text-2xl font-bold text-rose-gold-deep">
                Selamat Ulang Tahun Sayang!
              </h3>
              <p className="mt-1.5 text-sm text-foreground">{settings.gift}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {smallGifts.map((item, idx) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSmallGiftIdx(idx);
                  triggerConfetti(16);
                }}
                className="flex cursor-pointer flex-col items-center rounded-2xl border border-border bg-blush-mist p-3.5 transition-all hover:-translate-y-0.5 hover:border-rose-gold hover:bg-blush-soft"
              >
                <span className="text-4xl">🎁</span>
                <span className="mt-2 text-xs font-semibold text-rose-gold-deep">{item.label}</span>
                <span className="text-[11px] text-muted-foreground">{item.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Kue Ulang Tahun */}
        <section className="luxury-card flex flex-col justify-between p-6 text-center sm:p-8">
          <div>
            <h2 className="text-3xl font-bold text-rose-gold-deep">Kue Ulang Tahun</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Buat permohonan terbaikmu lalu tiup lilinnya
            </p>
          </div>

          <div className="my-6 flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center px-6 pt-8">
              {candlesLit && (
                <div
                  className="pointer-events-none absolute top-0 flex items-center gap-3 text-2xl"
                  aria-hidden="true"
                >
                  <span className="animate-flame">🔥</span>
                  <span className="animate-flame" style={{ animationDelay: "0.12s" }}>
                    🔥
                  </span>
                  <span className="animate-flame" style={{ animationDelay: "0.24s" }}>
                    🔥
                  </span>
                </div>
              )}
              <span className="select-none text-8xl leading-none">🎂</span>
            </div>

            {!candlesLit && (
              <p className="animate-gift-pop mt-4 rounded-full bg-blush-soft px-5 py-2 text-sm font-semibold text-rose-gold-deep">
                Yeay! Semoga Doamu Terkabul! 🎉
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCandlesLit(false);
                triggerConfetti(26);
              }}
              className="btn-rose-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              <Flame className="h-4 w-4" />
              Tiup Lilin
            </button>
            <button
              type="button"
              onClick={() => setCandlesLit(true)}
              className="btn-blush-outline cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Nyalakan Lagi
            </button>
          </div>
        </section>
      </div>

      {/* Small Gift Modal */}
      {activeSmallGift && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-xs"
          onClick={() => setSmallGiftIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeSmallGift.title}
        >
          <div
            className="luxury-card animate-gift-pop relative w-full max-w-md p-7 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSmallGiftIdx(null)}
              aria-label="Tutup kado"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blush-soft text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-5xl">🎁</span>
            <h3 className="mt-3 text-3xl font-bold text-rose-gold-deep">
              {activeSmallGift.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">
              {activeSmallGift.text}
            </p>
            <button
              type="button"
              onClick={() => setSmallGiftIdx(null)}
              className="btn-rose-gold mt-6 cursor-pointer rounded-full px-7 py-2.5 text-sm font-semibold"
            >
              Tutup 💖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
