"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLabelFromTimeSlots, getTimeRangeFromIndexes } from "../utils";
import useMeasure from "use-measure";

const timeSlots = [
  { hour: "13:00", slots: ["13:15", "13:30", "13:45"] },
  { hour: "14:00", slots: ["14:15", "14:30", "14:45"] },
  { hour: "15:00", slots: ["15:15", "15:30", "15:45"] },
  { hour: "16:00", slots: ["16:15", "16:30", "16:45"] },
  { hour: "17:00", slots: [] },
];

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

    let y = 0;

    if ("touches" in e && e.touches.length > 0) {
      y = e.touches[0].clientY - rect.top;
    } else if ("clientY" in e) {
      y = e.clientY - rect.top;
    }

    // Constrain the Y position within the bounds of the calendar
    return Math.min(Math.max(y, 0), rect.height);
  };

  // Function to handle mouse down (start dragging)
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    console.log("mouse down");

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
      className="relative group select-none"
      id="calendar"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Snapping cursor */}
      <motion.div
        className="opacity-0 group-hover:opacity-100 w-full h-[2px] bg-gray-700 absolute z-10"
        animate={{ top: nearestSlot.top }}
        transition={{ type: "spring", bounce: 0, duration: 0.15 }}
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
          transition={{ type: "spring", bounce: 0, duration: 0.15 }}
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
              {getLabelFromTimeSlots(hourIndex)}
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
