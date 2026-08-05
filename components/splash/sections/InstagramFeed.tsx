// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import type { InstagramFeedItem } from "@/lib/instagram-feed";

const PLAY_ICON = "/splash/assets/play-icon.svg";

const AUTO_MS = 4500;
const FEED_POLL_MS = 120000;
const DEFAULT_VISIBLE = 5;

function isVideoOrReel(item: InstagramFeedItem) {
  return (
    item.mediaProductType === "REELS" ||
    item.mediaType === "VIDEO" ||
    item.mediaType === "REELS"
  );
}

function thumbnailFor(item: InstagramFeedItem) {
  if (isVideoOrReel(item)) {
    return item.thumbnailUrl || item.mediaUrl;
  }
  return item.mediaUrl || item.thumbnailUrl;
}

function captionPreview(caption) {
  if (!caption) {
    return "View on Instagram";
  }
  const trimmed = caption.trim().replace(/\s+/g, " ");
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

function getFeedSignature(items: InstagramFeedItem[]) {
  return items.map((item) => item.id).join("|");
}

async function loadFeedData() {
  try {
    const live = await fetch(`/api/instagram?t=${Date.now()}`, {
      cache: "no-store",
    });
    const contentType = live.headers.get("content-type") || "";
    if (live.ok && contentType.includes("application/json")) {
      return live.json();
    }
  } catch {
    /* fall through to static JSON */
  }

  const response = await fetch(`/data/instagram.json?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Failed to load Instagram feed (${response.status})`);
  }
  return response.json();
}

export default function InstagramFeed() {
  // Only used for fallback link — success path must NOT setState or React
  // will re-render and wipe imperatively mounted carousel slides.
  const [showFallback, setShowFallback] = useState(false);
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const dotsRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const itemsRef = useRef<InstagramFeedItem[]>([]);
  const signatureRef = useRef("");

  useEffect(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;
    const viewport = viewportRef.current;
    const dotsRoot = dotsRef.current;
    const section = sectionRef.current;
    const prevBtn = prevBtnRef.current;
    const nextBtn = nextBtnRef.current;

    if (!carousel || !track || !viewport || !dotsRoot || !section) {
      return undefined;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let slides: HTMLAnchorElement[] = [];
    let dots: HTMLButtonElement[] = [];
    let realCount = 0;
    let cloneCount = 0;
    let trackIndex = 0;
    let step = 0;
    let slideWidth = 0;
    let visibleCount = DEFAULT_VISIBLE;
    let autoTimer = null;
    let pointerStartX = 0;
    let pointerDeltaX = 0;
    let isPointerDown = false;
    let suppressClick = false;
    let transitionEndHandler: ((event: TransitionEvent) => void) | null = null;
    let loopJumpTimer = null;
    let feedPollTimer = null;
    let feedLoading = false;
    let destroyed = false;

    function readCssNumber(styles, name, fallback) {
      const raw = styles.getPropertyValue(name).trim();
      const value = Number.parseFloat(raw);
      return Number.isFinite(value) ? value : fallback;
    }

    function logicalIndex() {
      if (realCount <= 0) {
        return 0;
      }
      return (((trackIndex - cloneCount) % realCount) + realCount) % realCount;
    }

    function syncMetricsFromDom() {
      if (slides.length < 2) {
        return;
      }
      slideWidth = slides[0].getBoundingClientRect().width;
      step = slides[1].offsetLeft - slides[0].offsetLeft;
    }

    function setTrackTransform(dragPx = 0) {
      const vw =
        viewport.clientWidth || carousel.clientWidth || window.innerWidth;
      const activeSlide = slides[trackIndex];
      const center = activeSlide
        ? activeSlide.offsetLeft + activeSlide.offsetWidth / 2
        : trackIndex * step + slideWidth / 2;
      const x = vw / 2 - center + dragPx;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    }

    function unlockMotion() {
      carousel.classList.remove("is-loop-jumping");
      track.classList.remove("is-dragging");
      track.style.transition = "";
      slides.forEach((slide) => {
        slide.style.transition = "";
      });
    }

    function withInstantMotion(callback) {
      if (loopJumpTimer) {
        clearTimeout(loopJumpTimer);
        loopJumpTimer = null;
      }

      carousel.classList.add("is-loop-jumping");
      track.classList.add("is-dragging");
      track.style.transition = "none";
      slides.forEach((slide) => {
        slide.style.transition = "none";
      });

      callback();
      void track.offsetHeight;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!destroyed) {
            unlockMotion();
          }
        });
      });
    }

    function applyTrackPosition(dragPx = 0, { instant = false } = {}) {
      if (instant) {
        withInstantMotion(() => {
          setTrackTransform(dragPx);
        });
        return;
      }
      setTrackTransform(dragPx);
    }

    function updateActiveSlides() {
      slides.forEach((slide, i) => {
        const isActive = i === trackIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
        slide.tabIndex = isActive ? 0 : -1;
      });

      const current = logicalIndex();
      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
        dot.tabIndex = active ? 0 : -1;
      });
    }

    function normalizeTrackIndex() {
      if (realCount <= 0 || cloneCount <= 0) {
        return false;
      }

      let shifted = false;

      if (trackIndex < cloneCount) {
        trackIndex += realCount;
        shifted = true;
      } else if (trackIndex >= cloneCount + realCount) {
        trackIndex -= realCount;
        shifted = true;
      }

      if (shifted) {
        withInstantMotion(() => {
          syncMetricsFromDom();
          setTrackTransform(0);
          updateActiveSlides();
        });
      }

      return shifted;
    }

    function clearTransitionHandler() {
      if (transitionEndHandler) {
        track.removeEventListener("transitionend", transitionEndHandler);
        transitionEndHandler = null;
      }
      if (loopJumpTimer) {
        clearTimeout(loopJumpTimer);
        loopJumpTimer = null;
      }
    }

    function stopAutoplay() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (destroyed || reduceMotion || realCount < 2) {
        return;
      }
      autoTimer = setInterval(() => {
        goToTrack(trackIndex + 1);
      }, AUTO_MS);
    }

    function scheduleNormalize() {
      clearTransitionHandler();

      transitionEndHandler = (event) => {
        if (event.target !== track || event.propertyName !== "transform") {
          return;
        }
        clearTransitionHandler();
        normalizeTrackIndex();
      };
      track.addEventListener("transitionend", transitionEndHandler);

      loopJumpTimer = setTimeout(() => {
        clearTransitionHandler();
        normalizeTrackIndex();
      }, 650);
    }

    function goToTrack(
      nextIndex,
      { userDriven = false, instant = false } = {},
    ) {
      if (!slides.length) {
        return;
      }

      clearTransitionHandler();
      trackIndex = nextIndex;
      applyTrackPosition(0, { instant });
      updateActiveSlides();

      if (instant || reduceMotion) {
        normalizeTrackIndex();
      } else {
        scheduleNormalize();
      }

      if (userDriven) {
        startAutoplay();
      }
    }

    function goToLogical(logical, options = {}) {
      if (realCount <= 0) {
        return;
      }

      const targetLogical = ((logical % realCount) + realCount) % realCount;
      const current = logicalIndex();
      const forward = (targetLogical - current + realCount) % realCount;
      const backward = (current - targetLogical + realCount) % realCount;

      if (forward <= backward) {
        goToTrack(trackIndex + forward, options);
      } else {
        goToTrack(trackIndex - backward, options);
      }
    }

    function openInstagramPost(url) {
      if (!url) {
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    }

    function bindSlideClick(link: HTMLAnchorElement) {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        if (suppressClick) {
          suppressClick = false;
          return;
        }

        openInstagramPost(link.dataset.permalink || link.href);
      });
    }

    function buildSlide(item: InstagramFeedItem) {
      const src = thumbnailFor(item);
      if (!src || !item.permalink) {
        return null;
      }

      const link = document.createElement("a");
      link.className = "instagram-slide";
      link.href = item.permalink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", captionPreview(item.caption));
      link.setAttribute("aria-roledescription", "slide");
      link.dataset.permalink = item.permalink;

      const media = document.createElement("div");
      media.className = "instagram-slide-media";

      const img = document.createElement("img");
      img.className = "instagram-slide-image";
      img.src = src;
      img.alt = "";
      img.loading = "eager";
      img.decoding = "async";
      img.draggable = false;
      img.referrerPolicy = "no-referrer";
      media.appendChild(img);

      if (isVideoOrReel(item)) {
        const play = document.createElement("span");
        play.className = "instagram-slide-play";
        play.setAttribute("aria-hidden", "true");

        const playImg = document.createElement("img");
        playImg.src = PLAY_ICON;
        playImg.alt = "";
        play.appendChild(playImg);
        media.appendChild(play);
      }

      link.appendChild(media);

      if (item.caption) {
        const caption = document.createElement("p");
        caption.className = "instagram-slide-caption";
        caption.textContent = captionPreview(item.caption);
        link.appendChild(caption);
      }

      bindSlideClick(link);
      return link;
    }

    function cloneSlide(slide: HTMLAnchorElement) {
      const clone = slide.cloneNode(true) as HTMLAnchorElement;
      bindSlideClick(clone);
      return clone;
    }

    function rebuildDots() {
      dotsRoot.innerHTML = "";
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < realCount; i += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "instagram-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Go to Instagram post ${i + 1}`);
        dot.addEventListener("click", () => {
          goToLogical(i, { userDriven: true });
        });
        fragment.appendChild(dot);
      }

      dotsRoot.appendChild(fragment);
      dots = Array.from(dotsRoot.querySelectorAll(".instagram-dot"));
      updateActiveSlides();
    }

    function updateSlideMetrics() {
      const width = carousel.clientWidth || window.innerWidth;
      if (width <= 0) {
        return;
      }

      const styles = getComputedStyle(section);
      const gap = readCssNumber(styles, "--ig-gap", 12);
      visibleCount = Math.max(
        1,
        Math.round(readCssNumber(styles, "--ig-visible", DEFAULT_VISIBLE)),
      );

      const fitCount = Math.max(1.5, visibleCount - 0.55);
      slideWidth = Math.max(96, (width - (visibleCount - 1) * gap) / fitCount);
      const slideH = slideWidth * 1.55;
      step = slideWidth + gap;

      section.style.setProperty("--ig-slide-w", `${slideWidth}px`);
      section.style.setProperty("--ig-slide-h", `${slideH}px`);
      section.style.setProperty("--ig-step", `${step}px`);
      carousel.style.setProperty("--ig-slide-w", `${slideWidth}px`);
      carousel.style.setProperty("--ig-slide-h", `${slideH}px`);

      void track.offsetHeight;
      syncMetricsFromDom();

      applyTrackPosition(0, { instant: true });
      updateActiveSlides();
    }

    function revealFallback() {
      carousel.classList.remove("is-ready");
      dotsRoot.classList.remove("is-ready");
      track.innerHTML = "";
      dotsRoot.innerHTML = "";
      setShowFallback(true);
    }

    function mountSlides(items: InstagramFeedItem[]) {
      const realSlides = items.map(buildSlide).filter(Boolean);
      realCount = realSlides.length;

      if (!realCount) {
        return false;
      }

      cloneCount = Math.max(3, DEFAULT_VISIBLE);
      track.innerHTML = "";

      for (let i = realCount - cloneCount; i < realCount; i += 1) {
        const source = realSlides[(i + realCount) % realCount];
        track.appendChild(cloneSlide(source));
      }

      realSlides.forEach((slide) => {
        track.appendChild(slide);
      });

      for (let i = 0; i < cloneCount; i += 1) {
        track.appendChild(cloneSlide(realSlides[i % realCount]));
      }

      slides = Array.from(track.querySelectorAll(".instagram-slide"));
      trackIndex = cloneCount;
      return true;
    }

    function renderFeed(items: InstagramFeedItem[], { isUpdate = false } = {}) {
      const nextSignature = getFeedSignature(items);

      if (!items.length) {
        if (!signatureRef.current) {
          revealFallback();
        }
        return;
      }

      if (isUpdate && nextSignature === signatureRef.current) {
        return;
      }

      const keepLogical = signatureRef.current ? logicalIndex() : 0;
      signatureRef.current = nextSignature;
      itemsRef.current = items;
      stopAutoplay();

      if (!mountSlides(items)) {
        revealFallback();
        return;
      }

      dotsRoot.innerHTML = "";
      dots = [];
      rebuildDots();

      // Avoid React setState on success — re-renders wipe DOM-mounted slides.
      updateSlideMetrics();

      const target = cloneCount + (keepLogical % realCount);
      goToTrack(target, { instant: true });

      requestAnimationFrame(() => {
        if (destroyed) {
          return;
        }
        updateSlideMetrics();
        carousel.classList.add("is-ready");
        dotsRoot.classList.add("is-ready");
        startAutoplay();
      });
    }

    async function loadInstagramFeed({ isUpdate = false } = {}) {
      if (feedLoading || destroyed) {
        return;
      }
      feedLoading = true;

      try {
        const data = await loadFeedData();
        if (destroyed) {
          return;
        }
        const items = Array.isArray(data.items) ? (data.items as InstagramFeedItem[]) : [];
        renderFeed(items, { isUpdate });
      } catch {
        if (!signatureRef.current && !destroyed) {
          revealFallback();
        }
      } finally {
        feedLoading = false;
      }
    }

    function onResize() {
      updateSlideMetrics();
    }

    function onVisibility() {
      if (document.hidden) {
        stopAutoplay();
      } else {
        loadInstagramFeed({ isUpdate: true });
        startAutoplay();
      }
    }

    function onKeyDown(event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToTrack(trackIndex - 1, { userDriven: true });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToTrack(trackIndex + 1, { userDriven: true });
      }
    }

    function onPrev() {
      goToTrack(trackIndex - 1, { userDriven: true });
    }

    function onNext() {
      goToTrack(trackIndex + 1, { userDriven: true });
    }

    function onPointerDown(event) {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      if (event.target.closest(".instagram-nav, .instagram-dot")) {
        return;
      }
      isPointerDown = true;
      pointerStartX = event.clientX;
      pointerDeltaX = 0;
      suppressClick = false;
      stopAutoplay();
    }

    function onPointerMove(event) {
      if (!isPointerDown) {
        return;
      }
      pointerDeltaX = event.clientX - pointerStartX;
      if (Math.abs(pointerDeltaX) > 8) {
        suppressClick = true;
        track.classList.add("is-dragging");
        applyTrackPosition(pointerDeltaX);
      }
    }

    function endPointer() {
      if (!isPointerDown) {
        return;
      }
      isPointerDown = false;
      track.classList.remove("is-dragging");

      const threshold = Math.min(
        80,
        step * 0.35 || viewport.clientWidth * 0.18,
      );

      if (pointerDeltaX > threshold) {
        suppressClick = true;
        goToTrack(trackIndex - 1, { userDriven: true });
      } else if (pointerDeltaX < -threshold) {
        suppressClick = true;
        goToTrack(trackIndex + 1, { userDriven: true });
      } else {
        applyTrackPosition();
        startAutoplay();
      }

      pointerDeltaX = 0;
    }

    function onPointerLeave() {
      if (isPointerDown) {
        endPointer();
      }
    }

    function onMouseEnter() {
      stopAutoplay();
    }

    function onMouseLeave() {
      startAutoplay();
    }

    function onFocusIn() {
      stopAutoplay();
    }

    function onFocusOut(event) {
      if (!carousel.contains(event.relatedTarget)) {
        startAutoplay();
      }
    }

    loadInstagramFeed();
    feedPollTimer = setInterval(() => {
      loadInstagramFeed({ isUpdate: true });
    }, FEED_POLL_MS);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    viewport.addEventListener("keydown", onKeyDown);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);
    carousel.addEventListener("mouseenter", onMouseEnter);
    carousel.addEventListener("mouseleave", onMouseLeave);
    carousel.addEventListener("focusin", onFocusIn);
    carousel.addEventListener("focusout", onFocusOut);
    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: true });
    viewport.addEventListener("pointerup", endPointer);
    viewport.addEventListener("pointercancel", endPointer);
    viewport.addEventListener("pointerleave", onPointerLeave);

    return () => {
      destroyed = true;
      stopAutoplay();
      clearTransitionHandler();
      if (feedPollTimer) {
        clearInterval(feedPollTimer);
      }
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      viewport.removeEventListener("keydown", onKeyDown);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      carousel.removeEventListener("mouseenter", onMouseEnter);
      carousel.removeEventListener("mouseleave", onMouseLeave);
      carousel.removeEventListener("focusin", onFocusIn);
      carousel.removeEventListener("focusout", onFocusOut);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endPointer);
      viewport.removeEventListener("pointercancel", endPointer);
      viewport.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <section
      className="instagram-section"
      aria-labelledby="instagram-heading"
      ref={sectionRef}
    >
      <div className="instagram-section-header">
        <h2 id="instagram-heading" className="instagram-heading">
          Follow Our Journey
        </h2>
        <p className="instagram-subtitle">
          Recent posts, reels, and moments from OHRYA.
        </p>
      </div>

      <div
        className="instagram-carousel"
        id="instagram-carousel"
        ref={carouselRef}
      >
        <div
          className="instagram-carousel-viewport"
          id="instagram-viewport"
          ref={viewportRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Instagram posts"
        >
          <div
            className="instagram-carousel-track"
            id="instagram-track"
            ref={trackRef}
            aria-live="polite"
          />
        </div>

        <button
          type="button"
          className="instagram-nav instagram-nav--prev"
          id="instagram-prev"
          ref={prevBtnRef}
          aria-label="Previous Instagram post"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="instagram-nav instagram-nav--next"
          id="instagram-next"
          ref={nextBtnRef}
          aria-label="Next Instagram post"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className="instagram-dots"
        id="instagram-dots"
        ref={dotsRef}
        role="tablist"
        aria-label="Instagram slide controls"
      />

      <p
        className="instagram-fallback"
        id="instagram-fallback"
        hidden={!showFallback}
      >
        <a
          href="https://www.instagram.com/ohryafoundation/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow us on Instagram
        </a>
      </p>
    </section>
  );
}
