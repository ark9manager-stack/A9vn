import { useEffect, useRef } from "react";

let lockCount = 0;
let savedScrollY = 0;
let savedStyles = null;
const activeLocks = new Set();

function getScrollbarWidth() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

function restoreScrollStyles({ restorePosition = true } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const { body, documentElement } = document;
  const styles = savedStyles;
  const y = savedScrollY;

  body.style.overflow = styles?.bodyOverflow ?? "";
  body.style.paddingRight = styles?.bodyPaddingRight ?? "";
  body.style.position = styles?.bodyPosition ?? "";
  body.style.top = styles?.bodyTop ?? "";
  body.style.width = styles?.bodyWidth ?? "";
  documentElement.style.overflow = styles?.htmlOverflow ?? "";

  savedScrollY = 0;
  savedStyles = null;

  if (restorePosition && Number.isFinite(y) && y > 0) {
    try {
      window.scrollTo(0, y);
    } catch {
      // no-op
    }
  }
}

function lockScroll(lockId) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  if (activeLocks.has(lockId)) return;

  const { body, documentElement } = document;

  if (lockCount === 0) {
    const scrollbarWidth = getScrollbarWidth();
    savedScrollY = window.scrollY || documentElement.scrollTop || 0;
    savedStyles = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      htmlOverflow: documentElement.style.overflow,
    };

    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.width = "100%";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  activeLocks.add(lockId);
  lockCount = activeLocks.size;
}

function unlockScroll(lockId) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (lockId != null) activeLocks.delete(lockId);
  lockCount = activeLocks.size;

  if (lockCount > 0) return;
  restoreScrollStyles();
}

export function resetScrollLock({ restorePosition = false } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  activeLocks.clear();
  lockCount = 0;
  restoreScrollStyles({ restorePosition });
}

export function useScrollLock(locked) {
  const lockIdRef = useRef(Symbol("scroll-lock"));

  useEffect(() => {
    const lockId = lockIdRef.current;
    if (!locked) {
      unlockScroll(lockId);
      return undefined;
    }

    lockScroll(lockId);
    return () => unlockScroll(lockId);
  }, [locked]);
}
