export const JOIN_FORM_SECTION_ID = "join-form";

export function scrollToJoinForm(): boolean {
  if (typeof window === "undefined") return false;

  const target = document.getElementById(JOIN_FORM_SECTION_ID);
  if (!target) return false;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior, block: "start" });
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