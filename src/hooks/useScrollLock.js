import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;
let savedStyles = null;

function getScrollbarWidth() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

function lockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

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

  lockCount += 1;
}

function unlockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyles) return;

  const { body, documentElement } = document;

  body.style.overflow = savedStyles.bodyOverflow;
  body.style.paddingRight = savedStyles.bodyPaddingRight;
  body.style.position = savedStyles.bodyPosition;
  body.style.top = savedStyles.bodyTop;
  body.style.width = savedStyles.bodyWidth;
  documentElement.style.overflow = savedStyles.htmlOverflow;

  window.scrollTo(0, savedScrollY);
  savedScrollY = 0;
  savedStyles = null;
}

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    lockScroll();
    return unlockScroll;
  }, [locked]);
}
