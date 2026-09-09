import { useEffect, useRef, useState } from "react";
import "./GeoPlayCasinoSheet.css";

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
    hero: "/hero/pala-hero.jpg",
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

const SNAP_ORDER = ["full", "partial", "collapsed"];

function GeoPlayCasinoSheet({ casino, onClose }) {
  const [snap, setSnap] = useState("collapsed");
  const sheetRef = useRef(null);
  const startYRef = useRef(null);
  const startOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const snapRef = useRef("collapsed");

  const getMetrics = () => {
    const viewportHeight = window.innerHeight;
    const sheetHeight = Math.min(viewportHeight * 0.88, 720);

    const collapsedVisibleHeight = Math.min(
      270,
      Math.max(230, viewportHeight * 0.36)
    );

    const partialVisibleHeight = Math.min(
      500,
      Math.max(360, viewportHeight * 0.52)
    );

    return {
      sheetHeight,
      offsets: {
        full: 0,
        partial: Math.max(0, sheetHeight - partialVisibleHeight),
        collapsed: Math.max(0, sheetHeight - collapsedVisibleHeight),
      },
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

  const snapTo = (nextSnap) => {
    const { offsets } = getMetrics();
    const nextOffset = offsets[nextSnap];

    snapRef.current = nextSnap;
    setSnap(nextSnap);
    currentOffsetRef.current = nextOffset;

    requestAnimationFrame(() => {
      applyOffset(nextOffset, true);
    });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      snapTo("collapsed");
    });

    const handleResize = () => {
      const { offsets } = getMetrics();
      const nextOffset = offsets[snapRef.current];
      currentOffsetRef.current = nextOffset;
      applyOffset(nextOffset, false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    snapRef.current = "collapsed";
    snapTo("collapsed");
  }, [casino.id]);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const { offsets } = getMetrics();
    const currentOffset = offsets[snap];

    startYRef.current = event.clientY;
    startOffsetRef.current = currentOffset;
    currentOffsetRef.current = currentOffset;
    lastYRef.current = event.clientY;
    lastTimeRef.current = performance.now();

    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    applyOffset(currentOffset, false);
  };

  const handlePointerMove = (event) => {
    if (startYRef.current === null || !sheetRef.current) {
      return;
    }

    const { offsets } = getMetrics();
    const deltaY = event.clientY - startYRef.current;

    const nextOffset = Math.min(
      offsets.collapsed,
      Math.max(offsets.full, startOffsetRef.current + deltaY)
    );

    currentOffsetRef.current = nextOffset;
    applyOffset(nextOffset, false);

    lastYRef.current = event.clientY;
    lastTimeRef.current = performance.now();
  };

  const handlePointerUp = (event) => {
    if (startYRef.current === null) return;

    const startOffset = startOffsetRef.current;
    const currentOffset = currentOffsetRef.current;
    const deltaY = event.clientY - startYRef.current;

    const elapsed = Math.max(
      1,
      performance.now() - lastTimeRef.current
    );

    const velocity =
      (event.clientY - lastYRef.current) / elapsed;

    startYRef.current = null;

    if (event.currentTarget?.releasePointerCapture) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    }

    const { offsets } = getMetrics();

    if (
      startOffset >= offsets.collapsed - 4 &&
      (deltaY > 75 || velocity > 0.65)
    ) {
      onClose();
      return;
    }

    const entries = SNAP_ORDER.map((name) => [name, offsets[name]]);

    let targetSnap;

    if (Math.abs(velocity) > 0.45) {
      if (velocity < 0) {
        targetSnap =
          entries
            .filter(([, offset]) => offset < currentOffset - 2)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "full";
      } else {
        targetSnap =
          entries
            .filter(([, offset]) => offset > currentOffset + 2)
            .sort((a, b) => a[1] - b[1])[0]?.[0] || "collapsed";
      }
    } else {
      targetSnap = entries.reduce(
        (closest, entry) =>
          Math.abs(entry[1] - currentOffset) <
          Math.abs(closest[1] - currentOffset)
            ? entry
            : closest
      )[0];
    }

    snapTo(targetSnap);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const currentIndex = SNAP_ORDER.indexOf(snap);

      if (currentIndex > 0) {
        snapTo(SNAP_ORDER[currentIndex - 1]);
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const currentIndex = SNAP_ORDER.indexOf(snap);

      if (currentIndex < SNAP_ORDER.length - 1) {
        snapTo(SNAP_ORDER[currentIndex + 1]);
      } else {
        onClose();
      }
    }
  };

  const branding = getCasinoBranding(casino);
  const verificationStatus = getVerificationStatus(casino);
  const verificationClass = getVerificationClass(verificationStatus);
  const verificationIcon = getVerificationIcon(verificationStatus);
  const verificationLabel = getVerificationLabel(verificationStatus);

  const demoWinners = [
    {
      player: "Demo Winner",
      game: casino.games[0]?.name,
      amount: "$250",
    },
    {
      player: "Lucky Player",
      game: casino.games[1]?.name,
      amount: "$175",
    },
    {
      player: "Big Win",
      game: casino.games[2]?.name,
      amount: "$125",
    },
  ];

  return (
    <>
      <button
        type="button"
        className={`geoplay-casino-sheet-scrim is-${snap}`}
        aria-label="Close casino details"
        onClick={onClose}
      />

      <section
        ref={sheetRef}
        className={`geoplay-casino-sheet is-${snap}`}
        aria-label={`${casino.name} details`}
      >
        <div
          className="geoplay-casino-sheet-drag-region"
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
          onClick={onClose}
        >
          ×
        </button>

        <div className="geoplay-casino-sheet-content">
          <div className="geoplay-casino-sheet-hero">
            {branding.hero && (
              <img
                src={branding.hero}
                alt=""
                className="geoplay-casino-sheet-hero-image"
              />
            )}
            <div className="geoplay-casino-sheet-hero-overlay" />

            <div className="geoplay-casino-sheet-collapsed-info">
              <h2>{casino.name}</h2>

              <div className="geoplay-casino-sheet-collapsed-meta">
                <span className="geoplay-casino-sheet-collapsed-distance">
                  <span
                    className="geoplay-casino-sheet-collapsed-pin"
                    aria-hidden="true"
                  />
                  {casino.distanceMiles.toFixed(1)} mi away
                </span>

                <span
                  className={`geoplay-casino-sheet-collapsed-verified is-${verificationClass}`}
                >
                  <span aria-hidden="true">{verificationIcon}</span>
                  {verificationLabel}
                </span>
              </div>
            </div>
          </div>

          {branding.logo && (
            <div className="geoplay-casino-sheet-logo">
              <img
                src={branding.logo}
                alt={`${casino.name} logo`}
              />
            </div>
          )}

          <div className="geoplay-casino-sheet-header">
            <h2>{casino.name}</h2>

            <div className="geoplay-casino-sheet-identity">
              <span>{casino.distanceMiles.toFixed(1)} MILES AWAY</span>
              <span>•</span>
              <span>
                {verificationIcon} {verificationLabel}
              </span>
            </div>
          </div>

          <div className="geoplay-casino-sheet-location">
            <div
              className="geoplay-casino-sheet-location-icon"
              aria-hidden="true"
            >
              ●
            </div>

            <div>
              <strong>CASINO LOCATION</strong>
              <span>{casino.address}</span>
            </div>

            <span aria-hidden="true">›</span>
          </div>

          <div className="geoplay-casino-sheet-section">
            <div className="geoplay-casino-sheet-section-heading">
              <div>
                <h3>GEOPLAY GAMES</h3>
                <p>Games available at this property</p>
              </div>
              <span>SWIPE →</span>
            </div>

            <div className="geoplay-casino-sheet-games">
              {casino.games.map((game) => (
                <button
                  type="button"
                  className="geoplay-casino-sheet-game"
                  key={game.name}
                  aria-label={`Play ${game.name}`}
                >
                  <div className="geoplay-casino-sheet-game-art">
                    <img src={game.image} alt="" />
                  </div>

                  <div className="geoplay-casino-sheet-game-copy">
                    <strong>{game.name}</strong>
                    <span>{game.genre}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="geoplay-casino-sheet-section">
            <div className="geoplay-casino-sheet-section-heading">
              <div>
                <h3>RECENT WINS</h3>
                <p>Demo activity from this property</p>
              </div>

              <span className="geoplay-casino-sheet-live">
                <span aria-hidden="true" /> LIVE
              </span>
            </div>

            <div className="geoplay-casino-sheet-winners">
              {demoWinners.map((winner, index) => (
                <div
                  className="geoplay-casino-sheet-winner"
                  key={`${winner.game}-${index}`}
                >
                  <div className="geoplay-casino-sheet-winner-icon">
                    ★
                  </div>

                  <div className="geoplay-casino-sheet-winner-copy">
                    <strong>{winner.player}</strong>
                    <span>{winner.game}</span>
                  </div>

                  <div className="geoplay-casino-sheet-winner-amount">
                    <span>WIN</span>
                    <b>{winner.amount}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="geoplay-casino-sheet-play"
            onClick={() =>
              console.log(
                "GeoPlay PLAY HERE tapped:",
                casino.name
              )
            }
          >
            <span>PLAY HERE</span>
            <span aria-hidden="true">→</span>
          </button>

          <div className="geoplay-casino-sheet-footer">
            GEOPLAY • PLAY NEARBY
          </div>
        </div>
      </section>
    </>
  );
}

export default GeoPlayCasinoSheet;
