
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

export default function LazyImage({
  src,
  alt = "",
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

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
        rootMargin: "250px",
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`lazy-image-container ${className}`}
    >
      {!loaded && !failed && (
        <div className="lazy-image-placeholder">
          <span className="lazy-spinner" />
        </div>
      )}

      {failed ? (
        <div className="lazy-image-error">
          <span>♡</span>
          <small>Gambar tidak tersedia</small>
        </div>
      ) : visible ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={loaded ? "lazy-image-loaded" : "lazy-image-hidden"}
        />
      ) : null}
    </div>
  );
}
