import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";
import { useBirthday, type WishDesign } from "@/lib/birthday-store";

export const Route = createFileRoute("/ucapan")({
  head: () => ({
    meta: [
      { title: "Ucapan — Selamat Ulang Tahun Riyanti Pohi" },
      {
        name: "description",
        content: "Kumpulan ucapan manis dan doa terbaik yang dipilih khusus untuk Riyanti Pohi.",
      },
      { property: "og:title", content: "Ucapan Untuk Riyanti Pohi" },
      {
        property: "og:description",
        content: "Kumpulan ucapan manis dan doa terbaik yang dipilih khusus untuk Riyanti Pohi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UcapanPage,
});

function designClass(design: WishDesign): string {
  if (design === "Rose Gold Elegan") return "wish-rosegold";
  if (design === "Pastel Floral") return "wish-floral";
  return "wish-pink";
}

function UcapanPage() {
  const { settings, wishes, likedIds, likeWish, triggerConfetti } = useBirthday();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-rose-gold-deep sm:text-5xl">
          Ucapan Untuk {settings.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Ucapan dan doa terbaik ini dipilih khusus untukmu di hari istimewamu
        </p>
      </div>

      {wishes.length === 0 ? (
        <div className="luxury-card p-10 text-center text-sm text-muted-foreground">
          Belum ada ucapan. Tambahkan ucapan spesial melalui halaman Admin.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {wishes.map((wish) => {
            const isLiked = likedIds.includes(wish.id);
            return (
              <article
                key={wish.id}
                className={`${designClass(wish.design)} flex flex-col justify-between rounded-3xl p-6 shadow-md transition-transform duration-300 hover:-translate-y-0.5`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <h2 className="font-serif text-2xl font-bold text-rose-gold-deep">
                      {wish.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-card/85 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-rose-gold" />
                      {wish.design}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
                    “{wish.message}”
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Untuk {settings.name}, di hari istimewamu
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      likeWish(wish.id);
                      triggerConfetti(10);
                    }}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isLiked
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-border bg-card text-foreground hover:bg-blush-soft"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                    {wish.likes}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}