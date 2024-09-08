"use client";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarEventProps {
  eventStyle: {
    top: number;
    height: number;
    transformY: number;
  };
  selectedTime: string;
  dragDirection: string;
  slotsSpanned: number;
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({
  eventStyle,
  selectedTime,
  dragDirection,
  slotsSpanned,
}) => {
  // Dynamically adjust font size and padding based on the number of slots spanned
  const fontSize =
    slotsSpanned > 2 ? "13px" : slotsSpanned > 1 ? "12px" : "10px";
  // Adjust padding based on span
  const padding = {
    paddingTop: slotsSpanned > 2 ? 6 : slotsSpanned > 1 ? 8 : 1,
    paddingBottom: slotsSpanned > 2 ? 6 : slotsSpanned > 1 ? 8 : 1,
  };

  return (
    <motion.div
      className={`absolute w-full z-10 text-white leading-snug ${fontSize}	${
        dragDirection === "down" ? "mt-[-4px]" : "mt-[6px]"
      }`}
      style={{ top: `${eventStyle.top}px` }}
      initial={{
        opacity: 0,
        top: `${eventStyle.top}px`,
        height: 0,
      }}
      animate={{
        opacity: 1,
        top: `${eventStyle.top}px`,
        height: `${eventStyle.height}px`,
        transform: `translateY(${eventStyle.transformY}px)`, // Apply transformY to translateY
      }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-[#0090FF] w-full h-full rounded-lg px-2 overflow-hidden">
        <AnimatePresence>
          <motion.p
            className={`select-none`}
            initial={{
              opacity: 0,
              fontSize: "10px",
              paddingTop: 0,
              paddingBottom: 0,
            }}
            animate={{
              opacity: 1,
              fontSize,
              paddingTop: padding.paddingTop,
              paddingBottom: padding.paddingBottom,
            }}
            exit={{ opacity: 0 }}
          >
            {selectedTime}
            {slotsSpanned > 2 ? (
              <motion.span
                key="event-name-long"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold block"
              >
                Event name
              </motion.span>
            ) : (
              <motion.span
                key="event-name-short"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold"
              >
                , Event name
              </motion.span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
