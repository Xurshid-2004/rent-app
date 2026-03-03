
"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isBefore,
  isSameDay,
  eachDayOfInterval,
  isWithinInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Selection = {
  start: Date | null;
  end: Date | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (days: string[], start: Date | null, end: Date | null) => void;
};

const RentCalendar: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selection, setSelection] = useState<Selection>({
    start: null,
    end: null,
  });

  if (!isOpen) return null;

  const nextMonth = () =>
    setCurrentMonth(addMonths(currentMonth, 1));

  const prevMonth = () =>
    setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (day: Date) => {
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) return;

    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: day, end: null });
    } else if (selection.start && isBefore(day, selection.start)) {
      setSelection({ start: day, end: null });
    } else {
      setSelection({ ...selection, end: day });
    }
  };

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="flex-1 p-1.5 sm:p-3 min-w-0">
        <h3 className="text-center font-bold mb-1.5 sm:mb-3 text-xs sm:text-sm md:text-base">
          {format(monthDate, "MMMM yyyy")}
        </h3>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-[8px] sm:text-xs font-semibold text-gray-400 py-0.5 sm:py-1">
              {d}
            </div>
          ))}

          {days.map((day, i) => {
            const isSelected =
              (selection.start && isSameDay(day, selection.start)) ||
              (selection.end && isSameDay(day, selection.end));

            const inRange =
              selection.start &&
              selection.end &&
              isWithinInterval(day, {
                start: selection.start,
                end: selection.end,
              });

            const isPast =
              isBefore(day, new Date()) &&
              !isSameDay(day, new Date());

            const isCurrentMonth =
              startOfMonth(day).getTime() === monthStart.getTime();

            return (
              <button
                key={i}
                onClick={() => handleDateClick(day)}
                className={`min-h-[28px] h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-all text-xs sm:text-sm md:text-base font-semibold
                  ${!isCurrentMonth ? "text-transparent pointer-events-none" : ""}
                  ${isPast ? "text-gray-300 cursor-not-allowed" : "text-black hover:bg-purple-100"}
                  ${isSelected ? "bg-purple-600 text-white" : ""}
                  ${inRange ? "bg-purple-50 rounded-none" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    if (!selection.start) return;

    const daysArray = eachDayOfInterval({
      start: selection.start,
      end: selection.end || selection.start, // Agar faqat bitta kun tanlangansa, end = start
    });

    // 🔥 Firebase uchun ISO string format
    const firebaseReadyArray = daysArray.map((d) =>
      format(d, "yyyy-MM-dd")
    );

    onSave(firebaseReadyArray, selection.start, selection.end || selection.start);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 p-3 sm:p-4 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[85dvh] sm:max-h-[80dvh] overflow-y-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-2 px-1 sm:px-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-gray-900">Kunni tanlang</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-5 h-5 sm:w-6 sm:h-6 min-w-[36px] sm:min-w-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-white text-xs sm:text-sm md:text-base active:scale-95 shadow-lg">
            ✕
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex justify-between items-center mb-2 px-1 sm:px-2">
          <button onClick={prevMonth} className="p-0.5 sm:p-1 min-w-[16px] sm:min-w-[24px] min-h-[16px] sm:min-h-[24px] flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full active:scale-95 transition-all duration-200 shadow-md">
            <ChevronLeft size={6} className="sm:size-8 text-white font-bold" />
          </button>

          <div className="text-center">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
          </div>

          <button onClick={nextMonth} className="p-0.5 sm:p-1 min-w-[16px] sm:min-w-[24px] min-h-[16px] sm:min-h-[24px] flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full active:scale-95 transition-all duration-200 shadow-md">
            <ChevronRight size={6} className="sm:size-8 text-white font-bold" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {renderMonth(currentMonth)}
          {/* Mobil qurilmalarda faqat bitta oy, desktop da ikkita oy */}
          <div className="hidden lg:block">
            {renderMonth(addMonths(currentMonth, 1))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-1 sm:gap-2 mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => setSelection({ start: null, end: null })}
            className="min-h-[28px] sm:min-h-[32px] px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
          >
            Reset
          </button>

          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={onClose}
              className="min-h-[28px] sm:min-h-[32px] px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all active:scale-95 text-xs sm:text-sm"
            >
              Bekor qilish
            </button>

            <button
              onClick={handleSave}
              className="min-h-[28px] sm:min-h-[32px] px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 shadow-lg transition-all active:scale-95 text-xs sm:text-sm"
            >
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentCalendar;