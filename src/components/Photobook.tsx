
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Flower2,
  Heart,
  LogOut,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Camera,
  Video,
  Search,
} from "lucide-react";

type Media = {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
};

type Album = {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
  photos: Media[];
};

type Payload = {
  albums: Album[];
  syncedAt: string;
};

type PhotobookProps = {
  username?: string | null;
};

export default function Photobook({
  username = "",
}: PhotobookProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [syncedAt, setSyncedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");

  // Username aman meskipun tidak dikirim dari halaman sebelumnya.
  const safeUsername = String(username ?? "")
    .trim()
    .toLowerCase();

  const displayName =
    safeUsername === "dita"
      ? "Dita"
      : safeUsername === "ego"
        ? "Ego"
        : "Teman";

  // Sinkronisasi Google Drive
  const sync = useCallback(async () => {
    try {
      const response = await fetch("/api/albums", {
        cache: "no-store",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          result?.error || "Gagal mengambil album Google Drive."
        );
      }

      const data: Payload = await response.json();

      setAlbums(
        Array.isArray(data.albums)
          ? data.albums.map((album) => ({
              ...album,
              photos: Array.isArray(album.photos)
                ? album.photos
                : [],
            }))
          : []
      );

      setSyncedAt(data.syncedAt || new Date().toISOString());
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil album."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto sync setiap 1 menit
  useEffect(() => {
    sync();

    const timer = window.setInterval(() => {
      sync();
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [sync]);

  // Pencarian album
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return albums.filter((album) =>
      String(album.name ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  }, [albums, query]);

  // Jumlah foto
  const totalPhotos = albums.reduce(
    (sum, album) =>
      sum +
      album.photos.filter((photo) =>
        photo.mimeType?.startsWith("image/")
      ).length,
    0
  );

  // Jumlah video
  const totalVideos = albums.reduce(
    (sum, album) =>
      sum +
      album.photos.filter((photo) =>
        photo.mimeType?.startsWith("video/")
      ).length,
    0
  );

  const dateLabel = syncedAt
    ? new Date(syncedAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  // Kontrol musik
  const toggleMusic = async () => {
    const audio = document.getElementById(
      "bg-music"
    ) as HTMLAudioElement | null;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
        alert(
          "Musik belum bisa diputar. Pastikan file romantic-piano.mp3 tersedia di folder public/music."
        );
      }
    } else {
      audio.pause();
    }
  };

  // Autoplay setelah interaksi pertama pengguna.
  useEffect(() => {
    const audio = document.getElementById(
      "bg-music"
    ) as HTMLAudioElement | null;

    if (!audio) return;

    const startMusic = () => {
      if (audio.paused) {
        audio.play().catch(() => {
          setPlaying(false);
        });
      }

      window.removeEventListener("click", startMusic);
      window.removeEventListener("touchstart", startMusic);
      window.removeEventListener("keydown", startMusic);
    };

    window.addEventListener("click", startMusic);
    window.addEventListener("touchstart", startMusic);
    window.addEventListener("keydown", startMusic);

    return () => {
      window.removeEventListener("click", startMusic);
      window.removeEventListener("touchstart", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, []);

  return (
    <main className="book-page">
      {/* NAVBAR */}
      <header className="topbar">
        <Link className="brand" href="/memories">
          <span className="brand-icon">
            <Flower2 size={21} />
          </span>

          <span>
            Forever <em>With You</em>
          </span>
        </Link>

        <div className="top-actions">
          <span className="welcome">
            Hi, {displayName} ♡
          </span>

          <form action="/logout" method="POST">
            <button
              type="submit"
              className="icon-button"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-flower flower-a">✿</div>
        <div className="hero-flower flower-b">❀</div>

        <p className="eyebrow">OUR LITTLE WORLD</p>

        <h1>
          Every moment,
          <br />
          <em>a story worth keeping.</em>
        </h1>

        <p className="hero-copy">
          A collection of little things that became our favorite memories.
        </p>

        <div className="hero-signature">
          <span />
          Dita <Heart size={13} fill="currentColor" /> Ego
          <span />
        </div>

        <div className="hero-stats">
          <div>
            <strong>{albums.length}</strong>
            <span>little albums</span>
          </div>

          <i />

          <div>
            <strong>{totalPhotos}</strong>
            <span>beautiful photos</span>
          </div>

          <i />

          <div>
            <strong>{totalVideos}</strong>
            <span>little videos</span>
          </div>
        </div>
      </section>

      {/* ALBUM CONTENT */}
      <section className="content-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE MEMORY BOX</p>

            <h2>
              Our Memories <span>♡</span>
            </h2>
          </div>

          <button
            className="sync-button"
            onClick={sync}
            disabled={loading}
            type="button"
          >
            <RefreshCw
              size={15}
              className={loading ? "spin" : ""}
            />
            Sync Drive
          </button>
        </div>

        <div className="sync-note">
          <span className="live-dot" />
          Connected to Google Drive
          <span>·</span>
          Last sync {dateLabel}
          <span>·</span>
          auto sync every 1 minute
        </div>

        {/* SEARCH */}
        <div className="search-row">
          <Search size={17} />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a memory..."
            aria-label="Search albums"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="notice">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="loading-state">
            <Flower2 className="spin" size={28} />

            <p>Gathering our little memories...</p>
          </div>
        ) : filtered.length === 0 ? (
          /* EMPTY */
          <div className="empty-state">
            <Flower2 size={32} />

            <p>
              {albums.length
                ? "No album found."
                : "Belum ada folder moment di Drive."}
            </p>

            <small>
              Tambahkan folder ke folder utama Google Drive,
              lalu tekan Sync Drive.
            </small>
          </div>
        ) : (
          /* ALBUM GRID */
          <div className="album-grid">
            {filtered.map((album, index) => {
              const photos = album.photos.filter((photo) =>
                photo.mimeType?.startsWith("image/")
              );

              const videos = album.photos.filter((photo) =>
                photo.mimeType?.startsWith("video/")
              );

              const cover = photos[0] ?? videos[0];

              return (
                <Link
                  href={`/memories/${encodeURIComponent(album.id)}`}
                  className="album-card"
                  key={album.id}
                >
                  <div className={`album-cover cover-${index % 4}`}>
                    {cover ? (
                      cover.mimeType.startsWith("video/") ? (
                        <div className="video-cover video-cover-static">
                          <div className="video-placeholder">
                            <Video size={42} />
                            <span>Video Memory</span>
                            <small>Click to explore</small>
                          </div>

                          <span className="video-play">
                            <Play size={22} fill="currentColor" />
                          </span>
                        </div>
                      ) : (
                        <img
                          src={`/api/image/${encodeURIComponent(
                            cover.id
                          )}`}
                          alt={album.name}
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="no-cover">
                        <Flower2 size={38} />
                        <span>our moment</span>
                      </div>
                    )}

                    <span className="photo-count">
                      <Camera size={12} />
                      {photos.length}
                    </span>

                    {videos.length > 0 && (
                      <span className="video-count">
                        <Video size={12} />
                        {videos.length}
                      </span>
                    )}

                    <span className="cover-heart">♡</span>
                  </div>

                  <div className="album-info">
                    <strong>{album.name}</strong>

                    <span>
                      {photos.length} photos
                      <i>·</i>
                      {videos.length} videos
                    </span>

                    <div className="album-open">
                      Buka kenangan <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* QUOTE */}
        <div className="quote-card">
          <span>“</span>

          <p>
            In a world full of places, you are my favorite one.
          </p>

          <small>— with love, always ♡</small>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <Flower2 size={15} />
        made of love, memories & a little bit of magic
        <Heart size={13} fill="currentColor" />
      </footer>

     
      
    </main>
  );
}
