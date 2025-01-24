'use client';
import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [start, setStart] = useState(false);

  return (
    <DataContext.Provider value={{ loading, setLoading, start, setStart }}>
      {children}
    </DataContext.Provider>
  );
};
