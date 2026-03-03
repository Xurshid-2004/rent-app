"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type DateRange = { start: Date | null; end: Date | null };

const OrderDateContext = createContext<{
  range: DateRange;
  setRange: (r: DateRange) => void;
}>({ range: { start: null, end: null }, setRange: () => {} });

export function OrderDateProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  return (
    <OrderDateContext.Provider value={{ range, setRange }}>
      {children}
    </OrderDateContext.Provider>
  );
}

export function useOrderDate() {
  return useContext(OrderDateContext);
}
