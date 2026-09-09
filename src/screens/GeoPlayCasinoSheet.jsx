import { useEffect, useRef, useState } from "react";
import "./GeoPlayCasinoSheet.css";
import { getGeoPlayWinners } from "../data/GeoPlayWinnerData";

const CASINO_BRANDING = {
  "Agua Caliente Resort Casino Spa Rancho Mirage": {
    hero: "/hero/agua-hero.jpg",
    logo: "/logos/agua-logo.jpg",
  },
  "Buffalo Run Casino & Resort": {
    hero: "/hero/buffalo-hero.jpg",
    logo: "/logos/buffalo-logo.jpg",
  },
  "Cherokee Casino Grove": {
    hero: "/hero/cherokee-hero.jpg",
    logo: "/logos/cherokee-logo.jpg",
  },
  "Downstream Casino Resort": {
    hero: "/hero/downstream-hero.jpg",
    logo: "/logos/downstream-logo.png",
  },
  "High Winds Casino": {
    hero: "/hero/high-hero.jpg",
    logo: "/logos/high-logo.jpg",
  },
  "Indigo Sky Casino": {
    hero: "/hero/indigo-hero.jpg",
    logo: "/logos/indigo-logo.PNG",
  },
  "Morongo Casino Resort & Spa": {
    hero: "/hero/morongo-hero.jpg",
    logo: "/logos/morongo-logo.PNG",
  },
  "Osage Casino Hotel - Tulsa": {
    hero: "/hero/osage-hero.jpg",
    logo: "/logos/osage-logo.jpg",
  },
  "Pala Casino Spa Resort": {
    hero: "/hero/pala-hero.png",
    logo: "/logos/pala-logo.png",
  },
  "Casino Pauma": {
    hero: "/hero/pauma-hero.jpg",
    logo: "/logos/pauma-logo.jpg",
  },
  "Pechanga Resort Casino": {
    hero: "/hero/pechanga-hero.jpg",
    logo: "/logos/pechanga-logo.PNG",
  },
  "Yaamava' Resort & Casino": {
    hero: "/hero/yaamava-hero.jpg",
    logo: "/logos/yaamava-logo.PNG",
  },
};

function getCasinoBranding(casino) {
  return CASINO_BRANDING[casino.name] || {};
}

function getVerificationStatus(casino) {
  if (casino.verificationStatus) {
    const normalized = String(casino.verificationStatus)
      .trim()
      .toLowerCase();

    if (normalized === "processing") return "Processing";
    if (normalized === "verified") return "Verified";
    if (normalized === "not verified") return "Not Verified";
  }

  return casino.identityVerified ? "Verified" : "Not Verified";
}

function getVerificationIcon(status) {
  if (status === "Verified") return "✓";
  if (status === "Processing") return "•";
  return "×";
}

function getVerificationClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function getVerificationLabel(status) {
  return status === "Verified" ? "ID Verified" : status;
}

function GeoPlayCasinoSheet({ casino, onClose }) {
  const [snap, setSnap] = useState("collapsed");
  const [isEntering, setIsEntering] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const sheetRef = useRef(null);
  const sheetBodyRef = useRef(null);
  const isClosingRef = useRef(false);
  const dragStartYRef = useRef(null);
  const dragStartOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const closeTimerRef = useRef(null);
  const snapRef = useRef("collapsed");
  const gamesScrollerRef = useRef(null);
  const gamesDragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const getMetrics = () => {
    const sheet = sheetRef.current;
    const viewportHeight = window.innerHeight;

    if (!sheet) {
      return {
        sheetHeight: 0,
        collapsedOffset: 0,
        partialOffset: 0,
        collapsedVisible: Math.min(250, Math.max(230, viewportHeight * 0.36)),
        partialVisible: Math.min(520, Math.max(450, viewportHeight * 0.70)),
      };
    }

    const sheetHeight = sheet.clientHeight;
    const collapsedVisible = Math.min(
      250,
      Math.max(230, viewportHeight * 0.36)
    );
    const partialVisible = Math.min(
      520,
      Math.max(450, viewportHeight * 0.70)
    );
    const fullVisible = Math.min(
      viewportHeight - 24,
      sheetHeight
    );

    return {
      sheetHeight,
      collapsedVisible,
      partialVisible,
      fullVisible,
      collapsedOffset: Math.max(0, sheetHeight - collapsedVisible),
      partialOffset: Math.max(0, sheetHeight - partialVisible),
      fullOffset: Math.max(0, sheetHeight - fullVisible),
    };
  };

  const applyOffset = (offset, animate = true) => {
    if (!sheetRef.current) return;

    sheetRef.current.style.transition = animate
      ? "transform 430ms cubic-bezier(0.22, 0.8, 0.2, 1)"
      : "none";

    sheetRef.current.style.transform =
      `translate3d(0, ${Math.max(0, offset)}px, 0)`;
  };

  const snapTo = (nextSnap, animate = true) => {
    const metrics = getMetrics();
    const nextOffset =
      nextSnap === "full"
        ? metrics.fullOffset
        : nextSnap === "partial"
          ? metrics.partialOffset
          : metrics.collapsedOffset;

    snapRef.current = nextSnap;
    setSnap(nextSnap);
    currentOffsetRef.current = nextOffset;

    requestAnimationFrame(() => {
      applyOffset(nextOffset, animate);
    });
  };

  useEffect(() => {
    const settle = () => {
      setIsEntering(false);
      const metrics = getMetrics();
      applyOffset(metrics.collapsedOffset, true);
    };

    const frame = window.requestAnimationFrame(settle);

    const handleResize = () => {
      if (isClosingRef.current) return;

      const metrics = getMetrics();
      const nextOffset =
        snapRef.current === "full"
          ? metrics.fullOffset
          : snapRef.current === "partial"
            ? metrics.partialOffset
            : metrics.collapsedOffset;

      currentOffsetRef.current = nextOffset;
      applyOffset(nextOffset, false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    snapRef.current = "collapsed";
    setSnap("collapsed");

    const frame = window.requestAnimationFrame(() => {
      const metrics = getMetrics();
      currentOffsetRef.current = metrics.collapsedOffset;
      applyOffset(metrics.collapsedOffset, false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [casino.id]);

  const handleClose = () => {
    if (isClosing) return;

    isClosingRef.current = true;
    setIsClosing(true);

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      onClose();
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 430);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const metrics = getMetrics();
    const currentOffset =
      snapRef.current === "full"
        ? metrics.fullOffset
        : snapRef.current === "partial"
          ? metrics.partialOffset
          : metrics.collapsedOffset;

    dragStartYRef.current = event.clientY;
    dragStartOffsetRef.current = currentOffset;
    currentOffsetRef.current = currentOffset;
    lastYRef.current = event.clientY;
    lastTimeRef.current = performance.now();

    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    applyOffset(currentOffset, false);
  };

  const handlePointerMove = (event) => {
    if (dragStartYRef.current === null || !sheetRef.current) return;

    const metrics = getMetrics();
    const deltaY = event.clientY - dragStartYRef.current;

    const minOffset = metrics.fullOffset;
    const maxOffset = metrics.collapsedOffset;

    const nextOffset = Math.min(
      maxOffset,
      Math.max(minOffset, dragStartOffsetRef.current + deltaY)
    );

    currentOffsetRef.current = nextOffset;
    applyOffset(nextOffset, false);

    lastYRef.current = event.clientY;
    lastTimeRef.current = performance.now();
  };

  const handlePointerUp = (event) => {
    if (dragStartYRef.current === null) return;

    const deltaY = event.clientY - dragStartYRef.current;
    const elapsed = Math.max(1, performance.now() - lastTimeRef.current);
    const velocity = (event.clientY - lastYRef.current) / elapsed;

    dragStartYRef.current = null;

    if (event.currentTarget?.releasePointerCapture) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    }

    const metrics = getMetrics();

    if (
      snapRef.current === "collapsed" &&
      (deltaY > 75 || velocity > 0.65)
    ) {
      handleClose();
      return;
    }

    if (deltaY < -45 || velocity < -0.45) {
      if (snapRef.current === "collapsed") {
        snapTo("partial");
      } else if (snapRef.current === "partial") {
        snapTo("full");
      }
      return;
    }

    if (deltaY > 45 || velocity > 0.45) {
      if (snapRef.current === "full") {
        snapTo("partial");
      } else {
        snapTo("collapsed");
      }
      return;
    }

    const stops = [
      { name: "collapsed", offset: metrics.collapsedOffset },
      { name: "partial", offset: metrics.partialOffset },
      { name: "full", offset: metrics.fullOffset },
    ];

    const nearestStop = stops.reduce((nearest, stop) =>
      Math.abs(currentOffsetRef.current - stop.offset) <
      Math.abs(currentOffsetRef.current - nearest.offset)
        ? stop
        : nearest
    );

    snapTo(nearestStop.name);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (snapRef.current === "collapsed") {
        snapTo("partial");
      } else if (snapRef.current === "partial") {
        snapTo("full");
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (snapRef.current === "full") {
        snapTo("partial");
      } else if (snapRef.current === "partial") {
        snapTo("collapsed");
      } else {
        handleClose();
      }
    }
  };

  const handleGamesPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const scroller = gamesScrollerRef.current;
    if (!scroller) return;

    gamesDragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: scroller.scrollLeft,
    };

    scroller.setPointerCapture?.(event.pointerId);
  };

  const handleGamesPointerMove = (event) => {
    const scroller = gamesScrollerRef.current;
    const drag = gamesDragRef.current;

    if (!scroller || !drag.active) return;

    const deltaX = event.clientX - drag.startX;
    scroller.scrollLeft = drag.startScrollLeft - deltaX;
  };

  const endGamesPointerDrag = (event) => {
    const scroller = gamesScrollerRef.current;
    if (!scroller) return;

    gamesDragRef.current.active = false;

    if (scroller.hasPointerCapture?.(event.pointerId)) {
      try {
        scroller.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    }
  };

  const branding = getCasinoBranding(casino);
  const verificationStatus = getVerificationStatus(casino);
  const verificationClass = getVerificationClass(verificationStatus);
  const verificationIcon = getVerificationIcon(verificationStatus);
  const verificationLabel = getVerificationLabel(verificationStatus);
  const latestWinners = getGeoPlayWinners(casino);

  return (
    <>
      <button
        type="button"
        className={`geoplay-casino-sheet-scrim${
          isEntering ? " is-entering" : ""
        }${isClosing ? " is-closing" : ""}`}
        aria-label="Close casino details"
        onClick={handleClose}
      />

      <section
        ref={sheetRef}
        className={`geoplay-casino-sheet is-${snap}${
          isEntering ? " is-entering" : ""
        }${isClosing ? " is-closing" : ""}`}
        aria-label={`${casino.name} details`}
      >
        <div
          className="geoplay-casino-sheet-handle-area"
          role="button"
          tabIndex={0}
          aria-label="Drag to resize casino details"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <div className="geoplay-casino-sheet-handle" />
        </div>

        <button
          type="button"
          className="geoplay-casino-sheet-close"
          aria-label="Close casino details"
          onClick={handleClose}
        >
          ×
        </button>

        <div className="geoplay-casino-sheet-hero">
          {branding.hero && (
            <img
              src={branding.hero}
              alt=""
              className="geoplay-casino-sheet-hero-image"
            />
          )}

          <div className="geoplay-casino-sheet-hero-overlay" aria-hidden="true" />

          {branding.logo && (
            <div className="geoplay-casino-sheet-logo">
              <img src={branding.logo} alt={`${casino.name} logo`} />
            </div>
          )}

          <div className="geoplay-casino-sheet-info">
            <h2>{casino.name}</h2>

            <div className="geoplay-casino-sheet-meta">
              <span className="geoplay-casino-sheet-distance">
                <span className="geoplay-casino-sheet-pin" aria-hidden="true" />
                {casino.distanceMiles.toFixed(1)} mi away
              </span>

              <span
                className={`geoplay-casino-sheet-verified is-${verificationClass}`}
              >
                <span aria-hidden="true">{verificationIcon}</span>
                {verificationLabel}
              </span>
            </div>
          </div>
        </div>

        <div
          ref={sheetBodyRef}
          className="geoplay-casino-sheet-body"
        >
          <div className="geoplay-casino-sheet-partial-content">
          <div
            className="geoplay-casino-sheet-actions"
            aria-label="Casino actions"
          >
            <button
              type="button"
              className="geoplay-casino-sheet-action"
              aria-label={`Call ${casino.name}`}
              onClick={() => console.log("GeoPlay Call tapped:", casino.name)}
            >
              <span className="geoplay-casino-sheet-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M7.2 3.8 9.8 3l2 4.7-2.1 1.6a15.2 15.2 0 0 0 5 5l1.6-2.1 4.7 2-.8 2.6c-.4 1.3-1.7 2.1-3 1.8C10.8 17.2 6.8 13.2 5.4 7.8c-.3-1.3.5-2.6 1.8-3Z" />
                </svg>
              </span>
              <span>Call</span>
            </button>

            <button
              type="button"
              className="geoplay-casino-sheet-action"
              aria-label={`Open ${casino.name} website`}
              onClick={() => console.log("GeoPlay Website tapped:", casino.name)}
            >
              <span className="geoplay-casino-sheet-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M3.7 12h16.6M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" />
                </svg>
              </span>
              <span>Website</span>
            </button>

            <button
              type="button"
              className="geoplay-casino-sheet-action"
              aria-label={`Save ${casino.name}`}
              onClick={() => console.log("GeoPlay Save tapped:", casino.name)}
            >
              <span className="geoplay-casino-sheet-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M6.5 4.5A2.5 2.5 0 0 1 9 2h6a2.5 2.5 0 0 1 2.5 2.5V21l-5.5-3.4L6.5 21V4.5Z" />
                </svg>
              </span>
              <span>Save</span>
            </button>

            <button
              type="button"
              className="geoplay-casino-sheet-action"
              aria-label={`Share ${casino.name}`}
              onClick={() => console.log("GeoPlay Share tapped:", casino.name)}
            >
              <span className="geoplay-casino-sheet-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 15V3.5M8 7.5l4-4 4 4" />
                  <path d="M5 12.5v6A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-6" />
                </svg>
              </span>
              <span>Share</span>
            </button>
          </div>

          <div className="geoplay-casino-sheet-location">
            <div className="geoplay-casino-sheet-location-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 21s6.5-6.3 6.5-11.1A6.5 6.5 0 1 0 5.5 9.9C5.5 14.7 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.1" />
              </svg>
            </div>

            <div className="geoplay-casino-sheet-location-copy">
              <strong>LOCATION</strong>
              <span>{casino.address}</span>
            </div>

            <button
              type="button"
              className="geoplay-casino-sheet-directions"
              aria-label={`Get directions to ${casino.name}`}
              onClick={() =>
                console.log("GeoPlay Get Directions tapped:", casino.name)
              }
            >
              <span>Get Directions</span>
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M4 12h14M13 7l5 5-5 5" />
              </svg>
            </button>
          </div>
          </div>

          <div className="geoplay-casino-sheet-full-content">
          <section className="geoplay-casino-sheet-games" aria-label="Available Games">
            <div className="geoplay-casino-sheet-section-heading">
              <div className="geoplay-casino-sheet-section-title">
                <span className="geoplay-casino-sheet-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M7 8.5h10l2.2 3.2a5.7 5.7 0 0 1 .7 4.9l-.5 1.4a2.3 2.3 0 0 1-4.2.4l-1.2-2H10l-1.2 2a2.3 2.3 0 0 1-4.2-.4l-.5-1.4a5.7 5.7 0 0 1 .7-4.9L7 8.5Z" />
                    <path d="M8.5 12.5v3M7 14h3M16.5 12.5v.01" />
                  </svg>
                </span>
                <h3>AVAILABLE GAMES</h3>
              </div>
            </div>

            <div
              ref={gamesScrollerRef}
              className="geoplay-casino-sheet-games-scroller"
              onPointerDown={handleGamesPointerDown}
              onPointerMove={handleGamesPointerMove}
              onPointerUp={endGamesPointerDrag}
              onPointerCancel={endGamesPointerDrag}
            >
              {(casino.games || []).map((game) => (
                <article
                  className="geoplay-casino-sheet-game"
                  key={`${game.name}-${game.image}`}
                >
                  <div className="geoplay-casino-sheet-game-art">
                    <img
                      src={game.image}
                      alt={game.name}
                      draggable="false"
                    />

                    {game.popular && (
                      <span
                        className="geoplay-casino-sheet-game-popular"
                        aria-label="Popular game"
                        title="Popular game"
                      >
                        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                          <path d="M13.1 2.8c.3 3-1 4.5-2.3 5.9-1.1 1.2-2.2 2.4-2.2 4.5 0 1.4.6 2.4 1.4 3.1-.1-1.4.6-2.6 1.7-3.5.9-.8 1.6-1.7 1.7-3.2 2.5 1.8 4 4.2 4 7 0 3.2-2.2 5.6-5.7 5.6s-6-2.3-6-5.9c0-2.9 1.8-5.4 4-7.8 1.7-1.9 3.2-3.7 3.4-5.7Z" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <h4>{game.name}</h4>
                  <span className="geoplay-casino-sheet-game-genre">
                    {game.genre}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section
            className="geoplay-casino-sheet-winners-section"
            aria-label="Latest Winners"
          >
            <div className="geoplay-casino-sheet-winners-heading">
              <div className="geoplay-casino-sheet-section-title">
                <span
                  className="geoplay-casino-sheet-winners-icon"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M6 4h12v3.5c0 3.1-1.7 5.5-4.3 6.5-.4.2-.7.5-.7 1v1.5h3v2H8v-2h3v-1.5c0-.5-.3-.8-.7-1C7.7 13 6 10.6 6 7.5V4Z" />
                    <path d="M6 6H3.8v1.5c0 2.2 1.4 3.7 3.6 4.1M18 6h2.2v1.5c0 2.2-1.4 3.7-3.6 4.1M9 21h6" />
                  </svg>
                </span>
                <h3>LATEST WINNERS</h3>
              </div>
            </div>

            {latestWinners.length > 0 && (
              <div className="geoplay-casino-sheet-winners-viewport">
                <div className="geoplay-casino-sheet-winners-track">
                  {[0, 1].map((copy) => (
                    <div
                      className="geoplay-casino-sheet-winners-set"
                      key={copy}
                    >
                      {latestWinners.map((winner) => (
                        <article
                          className="geoplay-casino-sheet-winner"
                          key={`${copy}-${winner.id}`}
                        >
                          <img
                            className="geoplay-casino-sheet-winner-avatar"
                            src={winner.avatar}
                            alt=""
                            draggable="false"
                          />

                          <div className="geoplay-casino-sheet-winner-player">
                            <strong>{winner.player}</strong>
                            <span>{winner.game}</span>
                          </div>

                          <div className="geoplay-casino-sheet-winner-win">
                            <span>Won</span>
                            <b>{winner.amount}</b>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          </div>
        </div>
      </section>
    </>
  );
}

export default GeoPlayCasinoSheet;
