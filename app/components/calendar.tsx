"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLabelFromTimeSlots, getTimeRangeFromIndexes } from "../utils";
import { CalendarEvent } from "./calendar-event";
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
    const index = Math.floor(y / slotHeight);

    if (!dragging) {
      setStartIndex(index);
      setEndIndex(index);
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

    const y = getYPosition(e);
    const index = Math.floor(y / slotHeight);

    setNearestSlot({ top: index * slotHeight });

    if (dragging) {
      const newHeight = Math.abs(index - startIndex) * slotHeight;

      if (index < startIndex) {
        // Dragging upwards: set negative marginTop to simulate moving up
        setEventStyle({
          top: startIndex * slotHeight, // Keep top fixed
          height: newHeight,
          transformY: -newHeight, // Use negative transfrom to simulate upward drag
        });
      } else {
        // Dragging downwards: reset marginTop to 0 and adjust height
        setEventStyle({
          top: startIndex * slotHeight, // Keep top fixed
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
        } else {
          setDragDirection("up");
        }

        setSelectedTime(
          getTimeRangeFromIndexes(
            Math.min(index, startIndex),
            Math.max(index, endIndex)
          )
        );
      }
    }
  };

  const handleMouseUp = () => {
    setEventStyle({ top: 0, height: 0, transformY: 0 });
    setDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

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
          type: "easeOut",
          duration: 0.15,
        }}
      >
        {/* Cursor */}
        <motion.div
          className="absolute opacity-0 group-hover:opacity-100 group-active:bg-gray-400 w-full h-[4px] rounded bg-gray-200 mt-[-1px] z-30 transition-colors"
          animate={{ top: nearestSlot.top }}
        ></motion.div>

        {/* Calendar event */}
        {dragging && (
          <CalendarEvent
            eventStyle={eventStyle}
            selectedTime={selectedTime}
            dragDirection={dragDirection}
            slotsSpanned={Math.abs(startIndex - endIndex)} // Pass the number of slots spanned as a prop
          />
        )}
      </MotionConfig>
      <div className="flex flex-col items-stretch justify-start flex-nowrap w-[270px] padding-[64px] select-none">
        {timeSlots.map((timeSlot, hourIndex) => (
          <div key={hourIndex} className="relative">
            <span className="absolute top-[-12px] left-[-40px] text-gray-400 text-sm leading-7 font-normal text-xs select-none">
              {getLabelFromTimeSlots(hourIndex)}
            </span>
            <div
              data-index={hourIndex * 4}
              data-time={timeSlot.hour}
              className="relative h-[15px] w-full border-t-2 border-gray-200 select-none z-0"
            ></div>
            {timeSlot.slots.map((slot, index) => (
              <div
                key={index}
                data-index={hourIndex * 4 + index + 1}
                data-time={slot}
                className="relative h-[15px] w-full border-t border-gray-200 select-none z-0"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
