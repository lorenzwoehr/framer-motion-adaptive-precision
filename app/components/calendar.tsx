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

export function Calendar() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [nearestSlot, setNearestSlot] = useState({ left: 0, top: 0 });

  // drag to create event
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0); // Track where the drag started
  const [eventCard, setEventCard] = useState({ top: 0, height: 0 }); // Style for the dynamically added element

  // to do: get timeslot height dynamically
  // const [bounds, ref] = useMeasure();
  const slotHeight = 15;

  // Function to handle mouse down (start dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("mouse down");

    const calendarElement = document.getElementById("calendar");
    if (!calendarElement) return;

    const rect = calendarElement.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const snapY = Math.round(y / slotHeight) * slotHeight;

    // Initialize the new element's position and height
    if (!dragging) {
      console.log("Start dragging Y: " + snapY);
      setEventCard({ top: snapY, height: 0 });
    }

    setStartY(snapY); // Store the starting Y position
    setDragging(true); // Set dragging state to true
  };

  // handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    const calendarElement = document.getElementById("calendar");
    if (!calendarElement) return;

    const rect = calendarElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPosition({ x, y });

    const snapY = Math.round(y / slotHeight) * slotHeight;

    // Set the nearest slot position
    setNearestSlot({
      left: 0, // This is the fixed position from the original code
      top: snapY,
    });

    if (dragging) {
      const deltaY = snapY - startY; // Calculate the distance dragged

      // If dragging upwards, adjust the top position and reduce the height
      if (deltaY < 0) {
        setEventCard({ top: startY + deltaY, height: Math.abs(deltaY) });
      } else {
        // If dragging downwards, increase the height without changing the top
        setEventCard({ top: startY, height: deltaY });
      }
    }
  };

  // Function to handle mouse up (end dragging)
  const handleMouseUp = () => {
    console.log("mouse up");

    if (dragging) {
      setDragging(false); // Stop dragging on mouse up
      setEventCard({ top: 0, height: 0 }); // Reset the element
    }
  };

  // Add event listeners for mousemove and mouseup
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Clean up the listeners when dragging ends
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div className="relative" id="calendar" onMouseDown={handleMouseDown}>
      {/* Snapping cursor */}
      <motion.div
        className="w-full h-[2px] bg-gray-700 absolute z-10"
        animate={{ left: nearestSlot.left, top: nearestSlot.top }}
        transition={{ type: "spring", bounce: 0, duration: 0.25 }}
      ></motion.div>

      {/* Dynamically added element that follows the cursor */}
      {dragging && (
        <motion.div
          className="absolute bg-gray-100 w-8 w-full"
          style={{ top: `${eventCard.top}px` }}
          initial={{ opacity: 0, top: `${eventCard.top}px` }}
          animate={{
            opacity: 1,
            top: `${eventCard.top}px`,
            height: `${eventCard.height}px`,
          }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.25 }}
        ></motion.div>
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
