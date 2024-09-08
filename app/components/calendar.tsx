"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import useMeasure from "use-measure";

const timeSlots = [
  { hour: "1 PM", slots: ["1:15 PM", "1:30 PM", "1:45 PM"] },
  { hour: "2 PM", slots: ["2:15 PM", "2:30 PM", "2:45 PM"] },
  { hour: "3 PM", slots: ["3:15 PM", "3:30 PM", "3:45 PM"] },
  { hour: "4 PM", slots: ["4:15 PM", "4:30 PM", "4:45 PM"] },
  { hour: "5 PM", slots: [] },
];

// Helper to format time from index position
const getTimeFromIndex = (index: number) => {
  const hours = 1 + Math.floor(index / 4); // Start at 1 PM
  const minutes = (index % 4) * 15;
  const isPM = hours >= 12;
  const displayHours = hours > 12 ? hours - 12 : hours;
  const formattedMinutes =
    minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
  return `${displayHours}${formattedMinutes} ${isPM ? "PM" : "AM"}`;
};

// Helper to get time range from start and end index
const getTimeRangeFromIndexes = (startIdx: number, endIdx: number) => {
  const startTime = getTimeFromIndex(startIdx);
  const endTime = getTimeFromIndex(endIdx);
  return `${startTime} - ${endTime}`;
};

export function Calendar() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [nearestSlot, setNearestSlot] = useState({ top: 0 });

  // drag to create event
  const [dragging, setDragging] = useState(false);
  const [startIndex, setStartIndex] = useState(0); // Index where drag started
  const [endIndex, setEndIndex] = useState(0); // Index where drag ends
  const [eventStyle, setEventStyle] = useState({ top: 0, height: 0 });
  const [selectedTime, setSelectedTime] = useState(""); // Store the selected time range

  // to do: get timeslot height dynamically
  // const [bounds, ref] = useMeasure();
  const slotHeight = 15;

  // Helper to get the correct Y position based on mouse or touch
  const getYPosition = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
  ): number => {
    const calendarElement = document.getElementById("calendar")!;
    const rect = calendarElement.getBoundingClientRect();

    if ("touches" in e && e.touches.length > 0) {
      return e.touches[0].clientY - rect.top;
    } else if ("clientY" in e) {
      return e.clientY - rect.top;
    }

    return 0;
  };

  // Function to handle mouse down (start dragging)
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    console.log("mouse down");
    // const calendarElement = document.getElementById("calendar");
    // if (!calendarElement) return;

    // const rect = calendarElement.getBoundingClientRect();
    const y = getYPosition(e);
    const index = Math.floor(y / slotHeight);

    setStartIndex(index);
    setEndIndex(index); // Initially, endIndex is the same as startIndex
    setEventStyle({ top: index * slotHeight, height: 0 });
    setNearestSlot({ top: index * slotHeight });
    setDragging(true);
  };

  // handle mouse move
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    const calendarElement = document.getElementById("calendar");
    if (!calendarElement) return;

    // const rect = calendarElement.getBoundingClientRect();
    const y = getYPosition(e);
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;

    // setCursorPosition({ x, y });

    const index = Math.floor(y / slotHeight);

    // Update the snapping cursor
    setNearestSlot({ top: index * slotHeight });

    if (dragging) {
      const newHeight = Math.abs(index - startIndex) * slotHeight;
      const newTop = Math.min(index, startIndex) * slotHeight;

      setStartIndex(index);
      setEndIndex(index); // Update endIndex
      setEventStyle({ top: newTop, height: newHeight });
      setSelectedTime(
        getTimeRangeFromIndexes(
          Math.min(index, startIndex),
          Math.max(index, endIndex)
        )
      );
    }
  };

  // Function to handle mouse up (end dragging)
  const handleMouseUp = () => {
    console.log("mouse up");
    setDragging(false); // Stop dragging on mouse up
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false }); // Use passive: false to prevent default touch scrolling
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      className="relative select-none"
      id="calendar"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Snapping cursor */}
      <motion.div
        className="w-full h-[2px] bg-gray-700 absolute z-10"
        animate={{ top: nearestSlot.top }}
        transition={{ type: "spring", bounce: 0, duration: 0.2 }}
      ></motion.div>

      {/* Dynamically added element that follows the cursor */}
      {dragging && (
        <motion.div
          className="absolute bg-gray-100 w-8 w-full"
          style={{ top: `${eventStyle.top}px` }}
          initial={{ opacity: 0, top: `${eventStyle.top}px` }}
          animate={{
            opacity: 1,
            top: `${eventStyle.top}px`,
            height: `${eventStyle.height}px`,
          }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        >
          <p className="select-none">{selectedTime}</p>
        </motion.div>
      )}

      {/* Main time slot sections */}
      <div className="flex flex-col items-stretch justify-start flex-nowrap w-[270px] padding-[64px] select-none">
        {timeSlots.map((timeSlot, hourIndex) => (
          <div key={hourIndex} className="relative">
            {/* Display hour */}
            <span className="absolute top-[-12px] left-[-40px] text-gray-600 text-sm leading-7 font-normal text-xs select-none">
              {timeSlot.hour}
            </span>
            {/* Main time block */}
            <div
              data-index={hourIndex * 4}
              data-time={timeSlot.hour}
              className="relative h-[15px] w-full border-t-2 select-none z-0"
            ></div>
            {/* Additional slots for each quarter hour */}
            {timeSlot.slots.map((slot, index) => (
              <div
                key={index}
                data-index={hourIndex * 4 + index + 1}
                data-time={slot}
                className="relative h-[15px] w-full border-t select-none z-0"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
