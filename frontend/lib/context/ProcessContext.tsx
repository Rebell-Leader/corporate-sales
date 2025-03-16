"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

import { Criterion, ProductRecommendation } from "@/lib/api";

// Define the context state shape
interface ProcessContextState {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  criteria: Criterion[];
  setCriteria: (criteria: Criterion[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  recommendations: ProductRecommendation[];
  setRecommendations: (recommendations: ProductRecommendation[]) => void;
}

// Create the context with default values
const ProcessContext = createContext<ProcessContextState>({
  pdfFile: null,
  setPdfFile: () => {},
  criteria: [],
  setCriteria: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  recommendations: [],
  setRecommendations: () => {},
});

// Custom hook to use the context
export const useProcess = () => useContext(ProcessContext);

// Provider component
export function ProcessProvider({ children }: { children: ReactNode }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<
    ProductRecommendation[]
  >([]);

  return (
    <ProcessContext.Provider
      value={{
        pdfFile,
        setPdfFile,
        criteria,
        setCriteria,
        isLoading,
        setIsLoading,
        error,
        setError,
        recommendations,
        setRecommendations,
      }}
    >
      {children}
    </ProcessContext.Provider>
  );
}
