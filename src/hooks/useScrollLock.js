import { useEffect, useRef } from "react";

let lockCount = 0;
let savedStyles = null;
const activeLocks = new Set();

function getScrollbarWidth() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

function restoreScrollStyles() {
  if (typeof document === "undefined") return;

  const { body, documentElement } = document;
  const styles = savedStyles;

  body.style.overflow = styles?.bodyOverflow ?? "";
  body.style.paddingRight = styles?.bodyPaddingRight ?? "";
  body.style.position = styles?.bodyPosition ?? "";
  body.style.top = styles?.bodyTop ?? "";
  body.style.width = styles?.bodyWidth ?? "";
  documentElement.style.overflow = styles?.htmlOverflow ?? "";

  savedStyles = null;
}

function lockScroll(lockId) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  if (activeLocks.has(lockId)) return;

  const { body, documentElement } = document;

  if (lockCount === 0) {
    const scrollbarWidth = getScrollbarWidth();
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
    body.style.position = savedStyles.bodyPosition || "";
    body.style.top = savedStyles.bodyTop || "";
    body.style.width = savedStyles.bodyWidth || "";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  activeLocks.add(lockId);
  lockCount = activeLocks.size;
}

function unlockScroll(lockId) {
  if (typeof document === "undefined") return;

  if (lockId != null) activeLocks.delete(lockId);
  lockCount = activeLocks.size;

  if (lockCount > 0) return;
  restoreScrollStyles();
}

export function resetScrollLock() {
  if (typeof document === "undefined") return;

  activeLocks.clear();
  lockCount = 0;
  restoreScrollStyles();

  const { body, documentElement } = document;
  if (body.style.position === "fixed") body.style.position = "";
  if (body.style.top) body.style.top = "";
  if (body.style.width === "100%") body.style.width = "";
  if (body.style.overflow === "hidden") body.style.overflow = "";
  if (documentElement.style.overflow === "hidden") {
    documentElement.style.overflow = "";
  }
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
