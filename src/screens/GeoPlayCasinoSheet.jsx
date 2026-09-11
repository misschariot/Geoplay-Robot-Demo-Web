import { useEffect, useRef, useState } from "react";
import "./GeoPlayCasinoSheet.css";
import { getGeoPlayWinners } from "../data/GeoPlayWinnerData";
import casinoBranding from "../data/casinoBranding";

function getCasinoBranding(casino) {
  return casinoBranding[casino.id] || {};
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

function GeoPlayCasinoSheet({
  casino,
  onClose,
  initialSnap = "collapsed",
  isFtueSheetFading = false,
  isFtueCasinoSheet = false,
}) {
  const startingSnap = initialSnap === "full" ? "full" : "collapsed";

  const [snap, setSnap] = useState(startingSnap);
  const [isEntering, setIsEntering] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isAutoFullOpening, setIsAutoFullOpening] = useState(false);

  const sheetRef = useRef(null);
  const sheetBodyRef = useRef(null);
  const isClosingRef = useRef(false);
  const dragStartYRef = useRef(null);
  const dragStartOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const closeTimerRef = useRef(null);
  const autoFullOpenTimerRef = useRef(null);
  const snapRef = useRef("collapsed");
  const gamesScrollerRef = useRef(null);
  const gamesDragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const getMetrics = () => {
    const viewportHeight = window.innerHeight;

    const collapsedHeight = 250;
    const fullHeight = Math.min(
      760,
      Math.max(collapsedHeight, viewportHeight - 24)
    );

    return {
      collapsedHeight,
      fullHeight,
    };
  };

  const applyHeight = (height, animate = true) => {
    if (!sheetRef.current) return;

    sheetRef.current.style.transition = animate
      ? "height 430ms cubic-bezier(0.22, 0.8, 0.2, 1)"
      : "none";

    sheetRef.current.style.height = `${Math.max(0, height)}px`;
  };

  const snapTo = (nextSnap, animate = true) => {
    const metrics = getMetrics();
    const nextHeight =
      nextSnap === "full"
        ? metrics.fullHeight
        : metrics.collapsedHeight;

    snapRef.current = nextSnap;
    setSnap(nextSnap);
    currentOffsetRef.current = nextHeight;

    requestAnimationFrame(() => {
      applyHeight(nextHeight, animate);
    });

    if (nextSnap === "full" && sheetBodyRef.current) {
      sheetBodyRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    const settle = () => {
      const metrics = getMetrics();
      const nextHeight =
        startingSnap === "full"
          ? metrics.fullHeight
          : metrics.collapsedHeight;

      snapRef.current = startingSnap;
      setSnap(startingSnap);
      currentOffsetRef.current = nextHeight;
      applyHeight(nextHeight, false);

      if (startingSnap === "full") {
        setIsAutoFullOpening(true);
        autoFullOpenTimerRef.current = window.setTimeout(() => {
          autoFullOpenTimerRef.current = null;
          setIsEntering(false);
          setIsAutoFullOpening(false);
        }, 760);
      } else {
        setIsEntering(false);
        applyHeight(nextHeight, true);
      }
    };

    const frame = window.requestAnimationFrame(settle);

    const handleResize = () => {
      if (isClosingRef.current) return;

      const metrics = getMetrics();
      const nextHeight =
        snapRef.current === "full"
          ? metrics.fullHeight
          : metrics.collapsedHeight;

      currentOffsetRef.current = nextHeight;
      applyHeight(nextHeight, false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [startingSnap]);

  useEffect(() => {
    snapRef.current = startingSnap;
    setSnap(startingSnap);

    const frame = window.requestAnimationFrame(() => {
      const metrics = getMetrics();
      const nextHeight =
        startingSnap === "full"
          ? metrics.fullHeight
          : metrics.collapsedHeight;
      currentOffsetRef.current = nextHeight;
      applyHeight(nextHeight, false);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (autoFullOpenTimerRef.current !== null) {
        window.clearTimeout(autoFullOpenTimerRef.current);
        autoFullOpenTimerRef.current = null;
      }
    };
  }, [casino.id, startingSnap]);

  const handleClose = (force = false) => {
    if (!force && isFtueCasinoSheet) return;
    if (isClosingRef.current) return;

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

  /*
    FTUE close trigger:
    GeoPlayMap waits until the robot and verification dialogue have
    completely finished fading, then sets isFtueSheetFading.
    Reuse the sheet's existing handleClose() so the normal 430ms
    slide-down animation and cleanup path remain unchanged.
  */
  useEffect(() => {
    if (!isFtueSheetFading) return;

    handleClose(true);
  }, [isFtueSheetFading]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (autoFullOpenTimerRef.current !== null) {
        window.clearTimeout(autoFullOpenTimerRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event) => {
    if (isFtueCasinoSheet) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const isHandle = Boolean(
      event.target?.closest?.(".geoplay-casino-sheet-handle-area")
    );

    const isGamesScroller = Boolean(
      event.target?.closest?.(".geoplay-casino-sheet-games-scroller")
    );

    const isCloseButton = Boolean(
      event.target?.closest?.(".geoplay-casino-sheet-close")
    );

    // The close button owns its own click interaction.
    // Do not let the sheet's drag handler capture the pointer.
    if (isCloseButton) return;

    // At FULL, only the handle controls the sheet.
    // The rest of the sheet is a native vertical scroll surface.
    if (snapRef.current === "full" && !isHandle) return;

    // The games carousel owns horizontal gestures.
    if (isGamesScroller) return;

    const metrics = getMetrics();
    const currentHeight =
      snapRef.current === "full"
        ? metrics.fullHeight
        : metrics.collapsedHeight;

    dragStartYRef.current = event.clientY;
    dragStartOffsetRef.current = currentHeight;
    currentOffsetRef.current = currentHeight;
    lastYRef.current = event.clientY;
    lastTimeRef.current = performance.now();

    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    applyHeight(currentHeight, false);
  };

  const handlePointerMove = (event) => {
    if (isFtueCasinoSheet) return;
    if (dragStartYRef.current === null || !sheetRef.current) return;

    const metrics = getMetrics();
    const deltaY = event.clientY - dragStartYRef.current;

    const minHeight = metrics.collapsedHeight;
    const maxHeight = metrics.fullHeight;

    const nextHeight = Math.min(
      maxHeight,
      Math.max(minHeight, dragStartOffsetRef.current - deltaY)
    );

    currentOffsetRef.current = nextHeight;
    applyHeight(nextHeight, false);

    lastYRef.current = event.clientY;
    lastTimeRef.current = performance.now();

    if (Math.abs(deltaY) > 8) {
      event.preventDefault();
    }
  };

  const handlePointerUp = (event) => {
    if (isFtueCasinoSheet) return;
    if (dragStartYRef.current === null) return;

    const deltaY = event.clientY - dragStartYRef.current;
    const elapsed = Math.max(
      1,
      performance.now() - lastTimeRef.current
    );
    const velocity =
      (event.clientY - lastYRef.current) / elapsed;

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
      snapTo("full");
      return;
    }

    if (deltaY > 45 || velocity > 0.45) {
      if (snapRef.current === "full") {
        snapTo("collapsed");
      } else {
        handleClose();
      }
      return;
    }

    const midpoint =
      (metrics.collapsedHeight + metrics.fullHeight) / 2;

    snapTo(
      currentOffsetRef.current >= midpoint
        ? "full"
        : "collapsed"
    );
  };

  const handleKeyDown = (event) => {
    if (isFtueCasinoSheet) {
      event.preventDefault();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      snapTo("full");
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (snapRef.current === "full") {
        snapTo("collapsed");
      } else {
        handleClose();
      }
    }
  };

  const handleGamesPointerDown = (event) => {
    if (isFtueCasinoSheet) return;
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

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
    if (isFtueCasinoSheet) return;
    const scroller = gamesScrollerRef.current;
    const drag = gamesDragRef.current;

    if (!scroller || !drag.active) return;

    const deltaX = event.clientX - drag.startX;
    scroller.scrollLeft =
      drag.startScrollLeft - deltaX;
  };

  const endGamesPointerDrag = (event) => {
    if (isFtueCasinoSheet) return;
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
  const verificationClass =
    getVerificationClass(verificationStatus);
  const verificationIcon =
    getVerificationIcon(verificationStatus);
  const verificationLabel =
    getVerificationLabel(verificationStatus);
  const latestWinners = getGeoPlayWinners(casino);

  return (
    <>
      <button
        type="button"
        className={`geoplay-casino-sheet-scrim${
          isEntering ? " is-entering" : ""
        }${isClosing ? " is-closing" : ""}${
          isFtueSheetFading ? " is-ftue-fading" : ""
        }${isFtueCasinoSheet ? " is-ftue-locked" : ""}`}
        aria-label="Close casino details"
        onClick={handleClose}
      />

      <section
        ref={sheetRef}
        className={`geoplay-casino-sheet is-${snap}${
          isEntering ? " is-entering" : ""
        }${isAutoFullOpening ? " is-auto-full-opening" : ""}${
          isClosing ? " is-closing" : ""
        }${isFtueCasinoSheet ? " is-ftue-locked" : ""}`}
        aria-label={`${casino.name} details`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="geoplay-casino-sheet-handle-area"
          role={isFtueCasinoSheet ? undefined : "button"}
          tabIndex={isFtueCasinoSheet ? -1 : 0}
          aria-label={
            isFtueCasinoSheet
              ? undefined
              : "Drag to resize casino details"
          }
          onKeyDown={handleKeyDown}
        >
          <div className="geoplay-casino-sheet-handle" />
        </div>

        <button
          type="button"
          className="geoplay-casino-sheet-close"
          aria-label="Close casino details"
          disabled={isFtueCasinoSheet}
          onClick={handleClose}
        >
          ×
        </button>

        <div
          ref={sheetBodyRef}
          className="geoplay-casino-sheet-body"
        >
          <div className="geoplay-casino-sheet-hero">
            {branding.hero && (
              <img
                src={branding.hero}
                alt=""
                className="geoplay-casino-sheet-hero-image"
              />
            )}

            <div
              className="geoplay-casino-sheet-hero-overlay"
              aria-hidden="true"
            />

            {branding.logo && (
              <div className="geoplay-casino-sheet-logo">
                <img
                  src={branding.logo}
                  alt={`${casino.name} logo`}
                />
              </div>
            )}

            <div className="geoplay-casino-sheet-info">
              <h2>{casino.name}</h2>

              <div className="geoplay-casino-sheet-meta">
                <span className="geoplay-casino-sheet-distance">
                  <span
                    className="geoplay-casino-sheet-pin"
                    aria-hidden="true"
                  />
                  {casino.distanceMiles.toFixed(1)} mi away
                </span>

                <span
                  className={`geoplay-casino-sheet-verified is-${verificationClass}`}
                >
                  <span aria-hidden="true">
                    {verificationIcon}
                  </span>
                  {verificationLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="geoplay-casino-sheet-partial-content">
            <div className="geoplay-casino-sheet-play-here">
              <button
                type="button"
                className="geoplay-casino-sheet-play-here-button"
                disabled={isFtueCasinoSheet}
              >
                PLAY HERE
              </button>
            </div>

            <div
              className="geoplay-casino-sheet-actions"
              aria-label="Casino actions"
            >
              <button
                type="button"
                className="geoplay-casino-sheet-action"
                disabled={isFtueCasinoSheet}
                aria-label={`Call ${casino.name}`}
                onClick={() =>
                  console.log(
                    "GeoPlay Call tapped:",
                    casino.name
                  )
                }
              >
                <span
                  className="geoplay-casino-sheet-action-icon"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    focusable="false"
                  >
                    <path d="M7.2 3.8 9.8 3l2 4.7-2.1 1.6a15.2 15.2 0 0 0 5 5l1.6-2.1 4.7 2-.8 2.6c-.4 1.3-1.7 2.1-3 1.8C10.8 17.2 6.8 13.2 5.4 7.8c-.3-1.3.5-2.6 1.8-3Z" />
                  </svg>
                </span>
                <span>Call</span>
              </button>

              <button
                type="button"
                className="geoplay-casino-sheet-action"
                disabled={isFtueCasinoSheet}
                aria-label={`Open ${casino.name} website`}
                onClick={() =>
                  console.log(
                    "GeoPlay Website tapped:",
                    casino.name
                  )
                }
              >
                <span
                  className="geoplay-casino-sheet-action-icon"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    focusable="false"
                  >
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M3.7 12h16.6M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" />
                  </svg>
                </span>
                <span>Website</span>
              </button>

              <button
                type="button"
                className="geoplay-casino-sheet-action"
                disabled={isFtueCasinoSheet}
                aria-label={`Save ${casino.name}`}
                onClick={() =>
                  console.log(
                    "GeoPlay Save tapped:",
                    casino.name
                  )
                }
              >
                <span
                  className="geoplay-casino-sheet-action-icon"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    focusable="false"
                  >
                    <path d="M6.5 4.5A2.5 2.5 0 0 1 9 2h6a2.5 2.5 0 0 1 2.5 2.5V21l-5.5-3.4L6.5 21V4.5Z" />
                  </svg>
                </span>
                <span>Save</span>
              </button>

              <button
                type="button"
                className="geoplay-casino-sheet-action"
                disabled={isFtueCasinoSheet}
                aria-label={`Share ${casino.name}`}
                onClick={() =>
                  console.log(
                    "GeoPlay Share tapped:",
                    casino.name
                  )
                }
              >
                <span
                  className="geoplay-casino-sheet-action-icon"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    focusable="false"
                  >
                    <path d="M12 15V3.5M8 7.5l4-4 4 4" />
                    <path d="M5 12.5v6A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-6" />
                  </svg>
                </span>
                <span>Share</span>
              </button>
            </div>

            <div className="geoplay-casino-sheet-location">
              <div
                className="geoplay-casino-sheet-location-icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  focusable="false"
                >
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
                disabled={isFtueCasinoSheet}
                aria-label={`Get directions to ${casino.name}`}
                onClick={() =>
                  console.log(
                    "GeoPlay Get Directions tapped:",
                    casino.name
                  )
                }
              >
                <span>Get Directions</span>
                <svg
                  viewBox="0 0 24 24"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path d="M4 12h14M13 7l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="geoplay-casino-sheet-full-content">
            <section
              className="geoplay-casino-sheet-games"
              aria-label="Available Games"
            >
              <div className="geoplay-casino-sheet-section-heading">
                <div className="geoplay-casino-sheet-section-title">
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
                          <svg
                            viewBox="0 0 24 24"
                            focusable="false"
                            aria-hidden="true"
                          >
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