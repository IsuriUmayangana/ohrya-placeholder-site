export const JOIN_FORM_SECTION_ID = "join-form";

/** Scroller Duration */
export const JOIN_FORM_SCROLL_DURATION_MS = 1400;

let activeScrollFrame: number | null = null;

/** Easing Function */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Get Scroll Top */
function getScrollTop(): number {
  return Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  );
}

/** Set Scroll Top */
function setScrollTop(top: number): void {
  window.scrollTo({ top, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

/** Get Scroll Target Y */
function getScrollTargetY(element: HTMLElement): number {
  const scrollMarginTop = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  const top = element.getBoundingClientRect().top + getScrollTop();
  const scrollHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
  );
  const maxScroll = Math.max(0, scrollHeight - window.innerHeight);
  return Math.min(maxScroll, Math.max(0, top - scrollMarginTop));
}

/** Animate Scroll To */
function animateScrollTo(target: HTMLElement, targetY: number, durationMs: number): void {
  if (activeScrollFrame !== null) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = null;
  }

  const startY = getScrollTop();
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    setScrollTop(targetY);
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / durationMs, 1);
    setScrollTop(startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      activeScrollFrame = requestAnimationFrame(step);
    } else {
      activeScrollFrame = null;
      setScrollTop(targetY);
      if (Math.abs(getScrollTop() - targetY) > 48) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  activeScrollFrame = requestAnimationFrame(step);
}

/** Run Scroll */
function runScroll(target: HTMLElement, reduceMotion: boolean): void {
  const targetY = getScrollTargetY(target);

  if (reduceMotion) {
    setScrollTop(targetY);
    return;
  }

  animateScrollTo(target, targetY, JOIN_FORM_SCROLL_DURATION_MS);
}

/** Scroll To Join Form */
export function scrollToJoinForm(): boolean {
  if (typeof window === "undefined") return false;

  const target = document.getElementById(JOIN_FORM_SECTION_ID);
  if (!target) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => runScroll(target, reduceMotion));
  });

  const hash = `#${JOIN_FORM_SECTION_ID}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${hash}`,
    );
  }

  return true;
}