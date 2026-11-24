import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Delete,
  Heart,
  ImagePlus,
  Lock,
  LogOut,
  Music,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBirthday,
  type BirthdaySettings,
  type WishDesign,
} from "@/lib/birthday-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Selamat Ulang Tahun Riyanti Pohi" },
      {
        name: "description",
        content: "Dashboard Admin untuk mengelola pengaturan, foto, musik, dan ucapan Riyanti Pohi.",
      },
      { property: "og:title", content: "Dashboard Admin — Riyanti Pohi" },
      {
        property: "og:description",
        content: "Kelola pengaturan acara, galeri foto, playlist musik, dan ucapan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const {
    settings,
    photos,
    songs,
    wishes,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    saveSettings,
    addPhotos,
    deletePhoto,
    addSong,
    deleteSong,
    addWish,
    deleteWish,
  } = useBirthday();

  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [form, setForm] = useState<BirthdaySettings>(settings);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [wishName, setWishName] = useState("");
  const [wishMsg, setWishMsg] = useState("");
  const [wishDesign, setWishDesign] = useState<WishDesign>("Pink Mewah");

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const songInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const pressKey = (digit: string) => {
    setPinErr("");
    setPin((prev) => (prev.length < 6 ? prev + digit : prev));
  };

  const handleLogin = () => {
    if (loginAdmin(pin)) {
      setPin("");
      setPinErr("");
      toast.success("Berhasil masuk Dashboard Admin.");
    } else {
      setPinErr("PIN Admin salah. Coba lagi.");
      setPin("");
    }
  };

  const handleSaveSettings = () => {
    if (!form.name.trim()) {
      toast.error("Nama tidak boleh kosong.");
      return;
    }
    saveSettings(form);
    toast.success("Pengaturan berhasil disimpan.");
  };

  const handleUploadPhotos = () => {
    const files = photoInputRef.current?.files;
    if (!files || files.length === 0) {
      toast.error("Pilih foto dulu.");
      return;
    }
    const list = Array.from(files);
    Promise.all(
      list.map(
        (file) =>
          new Promise<{ title: string; url: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({ title: file.name.replace(/\.[^.]+$/, ""), url: String(reader.result) });
            reader.onerror = () => reject(new Error("read failed"));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((loaded) => {
        const saved = addPhotos(loaded);
        if (photoInputRef.current) photoInputRef.current.value = "";
        if (saved) toast.success(`${loaded.length} foto berhasil diupload.`);
        else toast.warning("Foto ditambahkan, namun kapasitas penyimpanan browser hampir penuh.");
      })
      .catch(() => toast.error("Gagal membaca file foto."));
  };

  const handleUploadSong = () => {
    const file = songInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Pilih file audio dulu.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const saved = addSong({
        title: songTitle.trim() || file.name.replace(/\.[^.]+$/, "") || "Lagu Baru",
        artist: songArtist.trim() || `Untuk ${settings.name}`,
        url: String(reader.result),
      });
      setSongTitle("");
      setSongArtist("");
      if (songInputRef.current) songInputRef.current.value = "";
      if (saved) toast.success("Lagu berhasil diupload.");
      else toast.warning("Lagu ditambahkan ke sesi ini, namun ukuran file melebihi batas penyimpanan browser.");
    };
    reader.readAsDataURL(file);
  };

  const handleAddWish = () => {
    if (!wishMsg.trim()) {
      toast.error("Isi ucapan tidak boleh kosong.");
      return;
    }
    addWish({
      name: wishName.trim() || `Untuk ${settings.name}`,
      message: wishMsg.trim(),
      design: wishDesign,
    });
    setWishName("");
    setWishMsg("");
    toast.success("Ucapan berhasil ditambahkan.");
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-sm">
        <section className="luxury-card p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush-soft text-rose-gold-deep">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-3xl font-bold text-rose-gold-deep">Masuk Admin</h1>
          <p className="mt-1 text-xs text-muted-foreground">Masukkan 6 digit PIN Admin</p>

          <div className="my-5 flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-12 w-10 items-center justify-center rounded-xl border border-border bg-blush-mist text-xl font-bold text-rose-gold-deep"
              >
                {pin[idx] ? "•" : ""}
              </div>
            ))}
          </div>

          {pinErr && <p className="mb-3 text-xs font-medium text-destructive">{pinErr}</p>}

          <div className="grid grid-cols-3 gap-2.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pressKey(d)}
                className="cursor-pointer rounded-xl border border-border bg-blush-mist py-3 text-lg font-semibold text-foreground transition-colors hover:bg-blush-soft"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPin("");
                setPinErr("");
              }}
              className="cursor-pointer rounded-xl border border-border bg-blush-mist py-3 text-xs font-semibold text-muted-foreground hover:bg-blush-soft"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pressKey("0")}
              className="cursor-pointer rounded-xl border border-border bg-blush-mist py-3 text-lg font-semibold text-foreground hover:bg-blush-soft"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin((prev) => prev.slice(0, -1))}
              aria-label="Hapus digit"
              className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-blush-mist py-3 text-muted-foreground hover:bg-blush-soft"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="btn-rose-gold flex-1 cursor-pointer rounded-full py-2.5 text-sm font-semibold"
            >
              Masuk
            </button>
            <Link
              to="/"
              className="btn-blush-outline flex-1 rounded-full py-2.5 text-sm font-semibold"
            >
              Kembali
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-input bg-blush-mist px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-rose-gold";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header & stats */}
      <section className="luxury-card p-6 text-center sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-rose-gold-deep">
              Dashboard Admin — {settings.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              Hanya admin yang bisa upload & ubah isi. Pengunjung hanya melihat.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logoutAdmin();
              toast.info("Keluar dari mode Admin.");
            }}
            className="btn-blush-outline inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-blush-soft p-4">
            <p className="font-serif text-3xl font-bold text-rose-gold-deep">{photos.length}</p>
            <p className="text-xs text-muted-foreground">Total Foto</p>
          </div>
          <div className="rounded-2xl bg-blush-soft p-4">
            <p className="font-serif text-3xl font-bold text-rose-gold-deep">{songs.length}</p>
            <p className="text-xs text-muted-foreground">Total Lagu</p>
          </div>
          <div className="rounded-2xl bg-blush-soft p-4">
            <p className="font-serif text-3xl font-bold text-rose-gold-deep">{wishes.length}</p>
            <p className="text-xs text-muted-foreground">Total Ucapan</p>
          </div>
        </div>
      </section>

      {/* Pengaturan */}
      <section className="luxury-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-rose-gold-deep">
          <Settings className="h-5 w-5 text-rose-gold" /> Pengaturan
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama"
          />
          <input
            className={inputClass}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            className={inputClass}
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="Jam, contoh 19:00"
          />
          <input
            className={inputClass}
            value={form.loc}
            onChange={(e) => setForm({ ...form, loc: e.target.value })}
            placeholder="Lokasi"
          />
          <textarea
            className={`${inputClass} sm:col-span-2`}
            rows={2}
            value={form.gift}
            onChange={(e) => setForm({ ...form, gift: e.target.value })}
            placeholder="Teks di dalam kado besar"
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            value={form.g1}
            onChange={(e) => setForm({ ...form, g1: e.target.value })}
            placeholder="Isi Kado Kecil 1 - Foto Kenangan"
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            value={form.g2}
            onChange={(e) => setForm({ ...form, g2: e.target.value })}
            placeholder="Isi Kado Kecil 2 - Video Ucapan"
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            value={form.g3}
            onChange={(e) => setForm({ ...form, g3: e.target.value })}
            placeholder="Isi Kado Kecil 3 - Pesan Rahasia"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          className="btn-rose-gold mt-4 cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold"
        >
          Simpan Pengaturan
        </button>
      </section>

      {/* Kelola Foto */}
      <section className="luxury-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-rose-gold-deep">
          <ImagePlus className="h-5 w-5 text-rose-gold" /> Kelola Foto
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={handleUploadPhotos}
            className="btn-rose-gold cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            + Upload Foto
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-blush-mist p-2.5"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <span className="flex-1 truncate text-sm font-medium">{photo.title}</span>
              <button
                type="button"
                onClick={() => deletePhoto(photo.id)}
                aria-label={`Hapus ${photo.title}`}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Kelola Musik */}
      <section className="luxury-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-rose-gold-deep">
          <Music className="h-5 w-5 text-rose-gold" /> Kelola Musik
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="Judul Lagu"
          />
          <input
            className={inputClass}
            value={songArtist}
            onChange={(e) => setSongArtist(e.target.value)}
            placeholder="Penyanyi"
          />
          <input
            ref={songInputRef}
            type="file"
            accept="audio/*"
            className={`${inputClass} sm:col-span-2`}
          />
        </div>
        <button
          type="button"
          onClick={handleUploadSong}
          className="btn-rose-gold mt-4 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          + Upload Lagu
        </button>
        <div className="mt-4 space-y-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-blush-mist px-4 py-2.5"
            >
              <span className="truncate text-sm font-medium">
                {song.title} — {song.artist}
              </span>
              <button
                type="button"
                onClick={() => deleteSong(song.id)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Kelola Ucapan */}
      <section className="luxury-card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-rose-gold-deep">
          <Heart className="h-5 w-5 text-rose-gold" /> Kelola Ucapan
        </h2>
        <div className="mt-4 space-y-3">
          <input
            className={inputClass}
            value={wishName}
            onChange={(e) => setWishName(e.target.value)}
            placeholder="Nama Pengirim"
          />
          <textarea
            className={inputClass}
            rows={3}
            value={wishMsg}
            onChange={(e) => setWishMsg(e.target.value)}
            placeholder="Isi Ucapan"
          />
          <select
            className={inputClass}
            value={wishDesign}
            onChange={(e) => setWishDesign(e.target.value as WishDesign)}
          >
            <option value="Pink Mewah">Pink Mewah</option>
            <option value="Rose Gold Elegan">Rose Gold Elegan</option>
            <option value="Pastel Floral">Pastel Floral</option>
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddWish}
          className="btn-rose-gold mt-4 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          + Tambah Ucapan
        </button>
        <div className="mt-4 space-y-2">
          {wishes.map((wish) => (
            <div
              key={wish.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-blush-mist px-4 py-2.5"
            >
              <span className="truncate text-sm">
                <b>{wish.name}</b> — {wish.message}
              </span>
              <button
                type="button"
                onClick={() => deleteWish(wish.id)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}