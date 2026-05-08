import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const defaultItems = [
  "Item 1",
  "Item 2",
  "Item 3",
  "Item 4",
  "Item 5",
  "Item 6",
  "Item 7",
  "Item 8",
  "Item 9",
  "Item 10",
  "Item 11",
  "Item 12",
  "Item 13",
  "Item 14",
  "Item 15",
];

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.45, triggerOnce: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ y: 18, scale: 0.96, opacity: 0 }}
      animate={
        inView
          ? { y: 0, scale: 1, opacity: 1 }
          : { y: 18, scale: 0.96, opacity: 0 }
      }
      transition={{ duration: 0.22, delay, ease: "easeOut" }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = defaultItems,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  constrainHeight = true,
  initialSelectedIndex = -1,
  renderItem,
  getItemKey,
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item, index) => {
      setSelectedIndex(index);
      onItemSelect?.(item, index);
    },
    [onItemSelect],
  );

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);

    setTopGradientOpacity(Math.min(scrollTop / 48, 1));
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 64, 1),
    );
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!enableArrowNavigation) return;

      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }
    },
    [enableArrowNavigation, items, onItemSelect, selectedIndex],
  );

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (!selectedItem) return;

    const extraMargin = 44;
    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;

    if (itemTop < containerScrollTop + extraMargin) {
      container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
    } else if (
      itemBottom >
      containerScrollTop + containerHeight - extraMargin
    ) {
      container.scrollTo({
        top: itemBottom - containerHeight + extraMargin,
        behavior: "smooth",
      });
    }

    setKeyboardNav(false);
  }, [keyboardNav, selectedIndex]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={listRef}
        tabIndex={enableArrowNavigation ? 0 : undefined}
        className={`outline-none ${
          constrainHeight
            ? `max-h-[min(58vh,560px)] min-h-[320px] overflow-y-auto overscroll-contain p-3 ${
                displayScrollbar
                  ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-primary/50"
                  : "scrollbar-hide"
              }`
            : "overflow-visible p-0"
        }`}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: constrainHeight && displayScrollbar ? "thin" : "none",
          scrollbarColor:
            constrainHeight && displayScrollbar
              ? "hsl(var(--primary) / 0.5) rgba(255,255,255,0.05)"
              : "auto",
        }}
      >
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <AnimatedItem
              key={getItemKey?.(item, index) ?? index}
              delay={Math.min(index * 0.015, 0.12)}
              index={index}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onClick={() => handleItemClick(item, index)}
            >
              <div
                className={`${selectedIndex === index ? "scale-[1.01]" : ""} ${itemClassName}`}
              >
                {renderItem ? (
                  renderItem(item, index, selectedIndex === index)
                ) : (
                  <div
                    className={`rounded-lg bg-[#111] p-4 ${
                      selectedIndex === index ? "bg-[#222]" : ""
                    }`}
                  >
                    <p className="m-0 text-white">{item}</p>
                  </div>
                )}
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>

      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#080b0f] to-transparent transition-opacity duration-300 ease-out"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#080b0f] to-transparent transition-opacity duration-300 ease-out"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedList;
