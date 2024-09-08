"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLabelFromTimeSlots, getTimeRangeFromIndexes } from "../utils";
import { CalendarEvent } from "./calendar-event";

const timeSlots = [
  { hour: "13:00", slots: ["13:15", "13:30", "13:45"] },
  { hour: "14:00", slots: ["14:15", "14:30", "14:45"] },
  { hour: "15:00", slots: ["15:15", "15:30", "15:45"] },
  { hour: "16:00", slots: ["16:15", "16:30", "16:45"] },
  { hour: "17:00", slots: [] },
];

export function Calendar() {
  const [nearestSlot, setNearestSlot] = useState({ top: 0 });

  const [dragging, setDragging] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [eventStyle, setEventStyle] = useState({
    top: 0,
    height: 0,
    transformY: 0,
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [dragDirection, setDragDirection] = useState("down");

  const slotHeight = 15;

  // Offset y position of mouse cursor / touch within calendar
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

    return Math.min(Math.max(y, 0), rect.height);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const y = getYPosition(e);
    const index = Math.floor(y / slotHeight); //

    // Initialize event card
    if (!dragging) {
      setStartIndex(index);
      setEndIndex(index); // Start and end initially the same
      setEventStyle({
        top: index * slotHeight,
        height: 0,
        transformY: 0,
      });
      setNearestSlot({ top: index * slotHeight });
    }

    setDragging(true);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    const calendarElement = document.getElementById("calendar");
    if (!calendarElement) return;

    const y = getYPosition(e); // Offset y position of mouse cursor / touch within calendar
    const index = Math.floor(y / slotHeight); //

    setNearestSlot({ top: index * slotHeight });

    if (dragging) {
      const newHeight = Math.abs(index - startIndex) * slotHeight;

      if (index < startIndex) {
        // Dragging upwards: set negative marginTop to simulate moving up
        setEventStyle({
          top: startIndex * slotHeight,
          height: newHeight,
          transformY: -newHeight, // Use negative transfrom to simulate upward drag
        });
      } else {
        // Dragging downwards: reset marginTop to 0 and adjust height
        setEventStyle({
          top: startIndex * slotHeight,
          height: newHeight,
          transformY: 0, // Reset transform
        });
      }

      // Update the endIndex only if it changes
      if (index !== endIndex) {
        setEndIndex(index);

        // Determine drag direction
        if (index > startIndex) {
          setDragDirection("down");
          setSelectedTime(getTimeRangeFromIndexes(startIndex, index));
        } else {
          setDragDirection("up");
          setSelectedTime(getTimeRangeFromIndexes(index, startIndex));
        }
      }
    }
  };

  // Reset event style
  const handleMouseUp = () => {
    setEventStyle({ top: 0, height: 0, transformY: 0 });
    setDragging(false);
  };

  useEffect(() => {
    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

    // Clear event listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [dragging, startIndex, endIndex]);

  return (
    <div
      className="relative group select-none"
      id="calendar"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <MotionConfig
        transition={{
          type: "easeOut", // Has to be anything else than spring to be in sync, sadly
          duration: 0.15,
        }}
      >
        {/* Cursor */}
        <motion.div
          className="absolute opacity-0 group-hover:opacity-100 group-active:bg-neutral-400 dark:group-active:bg-neutral-500 w-full h-[4px] rounded bg-neutral-200 dark:bg-neutral-700 mt-[-1px] z-30 transition-colors"
          animate={{ top: nearestSlot.top }}
        ></motion.div>

        {/* Calendar event */}
        {dragging && (
          <CalendarEvent
            eventStyle={eventStyle}
            selectedTime={selectedTime} // Selected time to be printed on event card
            dragDirection={dragDirection} // Direction of dragging: up / down
            slotsSpanned={Math.abs(startIndex - endIndex)} // Number of slots spanned as a prop
          />
        )}
      </MotionConfig>
      <div className="flex flex-col items-stretch justify-start flex-nowrap w-[270px] padding-[64px] select-none">
        {timeSlots.map((timeSlot, hourIndex) => (
          <div key={hourIndex} className="relative">
            <span className="absolute top-[-12px] left-[-40px] text-neutral-400 dark:text-neutral-500 text-sm leading-7 font-normal text-xs select-none">
              {getLabelFromTimeSlots(hourIndex)}
            </span>
            <div
              data-time={timeSlot.hour}
              className="relative h-[15px] w-full border-t-2 border-neutral-200 dark:border-neutral-700 select-none z-0"
            ></div>
            {timeSlot.slots.map((slot, index) => (
              <div
                key={index}
                data-time={slot}
                className="relative h-[15px] w-full select-none z-0"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
