
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Flower2,
  Heart,
  Image as ImageIcon,
  Video,
  Loader2,
  Play,
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
  photos: Media[];
};

// ======================================================
// LAZY IMAGE
// ======================================================

function LazyImage({
  media,
  alt,
}: {
  media: Media;
  alt?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const mediaUrl = `/api/image/${encodeURIComponent(media.id)}`;

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="detail-lazy-media"
    >
      {!loaded && !failed && (
        <div className="detail-lazy-placeholder">
          <span className="detail-lazy-spinner" />
          <small>Loading memory...</small>
        </div>
      )}

      {failed ? (
        <div className="detail-media-error">
          <Flower2 size={30} />
          <span>Foto tidak dapat dimuat</span>
        </div>
      ) : visible ? (
        <img
          src={mediaUrl}
          alt={alt || media.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={
            loaded
              ? "detail-media-loaded"
              : "detail-media-hidden"
          }
        />
      ) : null}
    </div>
  );
}

// ======================================================
// VIDEO CARD - TANPA MEMUAT VIDEO
// ======================================================

function VideoCard({ video }: { video: Media }) {
  const videoUrl = `/api/image/${encodeURIComponent(video.id)}`;

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="detail-video-card video-open-card"
      title={`Putar ${video.name}`}
    >
      <div className="video-thumbnail-placeholder">
        <Video size={43} />

        <span className="video-play-button">
          <Play size={22} fill="currentColor" />
        </span>

        <span className="video-placeholder-label">
          VIDEO MEMORY
        </span>
      </div>

      <div className="video-caption">
        <Play size={15} />
        <span>{video.name}</span>
      </div>

      <div className="video-open-label">
        Klik untuk memutar di tab baru ↗
      </div>
    </a>
  );
}

// ======================================================
// ALBUM DETAIL PAGE
// ======================================================

export default function AlbumDetailPage() {
  const params = useParams<{ albumId: string }>();
  const albumId = params.albumId;

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD ALBUM
  // ====================================================

  useEffect(() => {
    let active = true;

    async function loadAlbum() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/albums", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data album.");
        }

        const data = await response.json();

        const albums: Album[] = Array.isArray(data.albums)
          ? data.albums
          : [];

        const found = albums.find(
          (item) => item.id === albumId
        );

        if (!found) {
          throw new Error("Album tidak ditemukan.");
        }

        if (active) {
          setAlbum({
            ...found,
            photos: Array.isArray(found.photos)
              ? found.photos
              : [],
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (albumId) {
      loadAlbum();
    }

    return () => {
      active = false;
    };
  }, [albumId]);

  // ====================================================
  // LOADING STATE
  // ====================================================

  if (loading) {
    return (
      <main className="album-detail-loading">
        <Loader2 className="spin" size={32} />
        <p>Membuka kenangan kita...</p>
      </main>
    );
  }

  // ====================================================
  // ERROR STATE
  // ====================================================

  if (error || !album) {
    return (
      <main className="album-detail-loading">
        <Flower2 size={36} />

        <h2>Kenangan tidak ditemukan</h2>

        <p>{error}</p>

        <Link href="/memories" className="back-button">
          <ArrowLeft size={17} />
          Kembali ke album
        </Link>
      </main>
    );
  }

  // ====================================================
  // MEDIA FILTER
  // ====================================================

  const photos = album.photos.filter((item) =>
    item.mimeType?.startsWith("image/")
  );

  const videos = album.photos.filter((item) =>
    item.mimeType?.startsWith("video/")
  );

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="album-detail-page">

      {/* HEADER */}

      <header className="detail-topbar">
        <Link href="/memories" className="back-button">
          <ArrowLeft size={18} />
          Kembali ke Our Memories
        </Link>

        <span className="detail-brand">
          <Flower2 size={19} />
          Forever With You
        </span>
      </header>

      {/* HERO */}

      <section className="detail-hero">
        <span className="eyebrow">
          A LITTLE CHAPTER OF US
        </span>

        <h1>
          {album.name} <em>♡</em>
        </h1>

        <p>
          Every picture holds a story, every video keeps a feeling.
        </p>

        <div className="detail-stats">
          <span>
            <ImageIcon size={16} />
            {photos.length} Photos
          </span>

          <span>
            <Video size={16} />
            {videos.length} Videos
          </span>
        </div>

        <div className="detail-decoration">✿</div>
      </section>

      {/* CONTENT */}

      <section className="detail-content">

        <div className="detail-section-heading">
          <div>
            <span className="eyebrow">
              CAPTURED MOMENTS
            </span>

            <h2>Our Little Memories</h2>
          </div>

          <Heart size={24} />
        </div>

        {/* PHOTOS */}

        {photos.length > 0 && (
          <>
            <h3 className="media-heading">
              <ImageIcon size={17} />
              Photos
              <span className="media-total">
                {photos.length}
              </span>
            </h3>

            <div className="detail-media-grid">
              {photos.map((photo, index) => (
                <a
                  className="detail-photo-card"
                  key={photo.id}
                  href={`/api/image/${encodeURIComponent(
                    photo.id
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LazyImage
                    media={photo}
                    alt={photo.name}
                  />

                  <div className="media-overlay">
                    <span>{photo.name}</span>
                    <span>View photo ↗</span>
                  </div>

                  <span className="media-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}

        {/* VIDEOS */}

        {videos.length > 0 && (
          <>
            <h3 className="media-heading video-heading">
              <Video size={17} />
              Videos
              <span className="media-total">
                {videos.length}
              </span>
            </h3>

            <div className="detail-video-grid">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                />
              ))}
            </div>
          </>
        )}

        {/* EMPTY */}

        {album.photos.length === 0 && (
          <div className="empty-state">
            <Flower2 size={36} />
            <p>Album ini belum memiliki foto atau video.</p>
          </div>
        )}

      </section>

      {/* FOOTER */}

      <footer className="detail-footer">
        <Flower2 size={16} />
        Made with love, Dita & Ego
        <Heart size={14} fill="currentColor" />
      </footer>

    </main>
  );
}
