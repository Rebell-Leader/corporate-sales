"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { button as buttonStyles } from "@heroui/theme";
import { PlusIcon, MinusIcon } from "lucide-react";

import { title, subtitle } from "@/components/primitives";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProcess } from "@/lib/context/ProcessContext";
import { extractCriteriaFromPDF, Criterion } from "@/lib/api";

export default function ValidatePage() {
  const router = useRouter();
  const {
    pdfFile,
    criteria,
    setCriteria,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useProcess();

  // If we don't have a PDF file or criteria, redirect back to home
  useEffect(() => {
    if (!pdfFile && !isLoading && criteria.length === 0) {
      router.push("/");
    }
  }, [pdfFile, isLoading, criteria.length, router]);

  const handleRegenerate = async () => {
    if (!pdfFile) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await extractCriteriaFromPDF(pdfFile);

      if (response.success) {
        setCriteria(response.criteria);
      } else {
        setError(response.message || "Failed to extract criteria from the PDF");
      }
    } catch (err) {
      console.error("Error regenerating criteria:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    setCriteria(criteria);
    router.push("/processing");
  };

  // Function to update a criterion
  const updateCriterion = (category: string, updates: Partial<Criterion>) => {
    setCriteria(
      criteria.map((criterion) =>
        criterion.category === category
          ? { ...criterion, ...updates }
          : criterion
      )
    );
  };

  // Function to update a spec
  const updateSpec = (
    category: string,
    specName: string,
    value: string | number
  ) => {
    setCriteria(
      criteria.map((criterion) =>
        criterion.category === category
          ? {
              ...criterion,
              specs: {
                ...criterion.specs,
                [specName]: value,
              },
            }
          : criterion
      )
    );
  };

  // Function to remove a criterion
  const removeCriterion = (category: string) => {
    setCriteria(
      criteria.filter((criterion) => criterion.category !== category)
    );
  };

  // Function to add a new spec
  const addSpec = (category: string) => {
    setCriteria(
      criteria.map((criterion) =>
        criterion.category === category
          ? {
              ...criterion,
              specs: {
                ...criterion.specs,
                "new-spec": "value",
              },
            }
          : criterion
      )
    );
  };

  // Function to remove a spec
  const removeSpec = (category: string, specName: string) => {
    setCriteria(
      criteria.map((criterion) =>
        criterion.category === category
          ? {
              ...criterion,
              specs: Object.fromEntries(
                Object.entries(criterion.specs).filter(
                  ([key]) => key !== specName
                )
              ),
            }
          : criterion
      )
    );
  };

  if (!pdfFile && !isLoading && criteria.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center mb-6">
        <span className={title({ size: "sm" })}>
          Validate Extracted Requirements
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Review and edit the requirements extracted from your document before
          proceeding.
        </div>
      </div>

      {isLoading ? (
        <div className="w-full max-w-4xl p-8 flex justify-center">
          <LoadingSpinner size="lg" message="Processing your document..." />
        </div>
      ) : error ? (
        <div className="w-full max-w-4xl p-6 bg-danger/10 border border-danger rounded-lg text-center">
          <p className="text-danger font-medium">{error}</p>
          <button
            className={buttonStyles({
              color: "danger",
              variant: "flat",
              size: "sm",
              className: "mt-4",
            })}
            onClick={() => router.push("/")}
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className="w-full max-w-4xl">
            {criteria.map((criterion) => (
              <div
                key={criterion.category}
                className="mb-6 border rounded-lg bg-content1 shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-4 border-b bg-content2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <input
                        className="w-full text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors py-1"
                        value={criterion.category}
                        onChange={(e) =>
                          updateCriterion(criterion.category, {
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center ml-4">
                      <span className="text-sm mr-2">Quantity:</span>
                      <input
                        type="number"
                        min="1"
                        className="w-16 p-1 border rounded text-right"
                        value={criterion.quantity}
                        onChange={(e) =>
                          updateCriterion(criterion.category, {
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                      <button
                        className={buttonStyles({
                          color: "danger",
                          variant: "light",
                          size: "sm",
                          className: "ml-4",
                        })}
                        onClick={() => removeCriterion(criterion.category)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specs List */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Specifications</h4>
                    <button
                      className="flex items-center text-xs text-primary"
                      onClick={() => addSpec(criterion.category)}
                    >
                      <PlusIcon size={14} className="mr-1" /> Add Spec
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(criterion.specs).map(
                      ([specName, specValue]) => (
                        <div
                          key={specName}
                          className="flex items-center space-x-2"
                        >
                          <input
                            className="flex-1 text-xs p-1.5 border rounded-l"
                            value={specName}
                            placeholder="Spec name"
                            onChange={(e) => {
                              const oldValue = criterion.specs[specName];
                              removeSpec(criterion.category, specName);
                              updateSpec(
                                criterion.category,
                                e.target.value,
                                oldValue
                              );
                            }}
                          />
                          <span className="text-xs">=</span>
                          <input
                            className="flex-1 text-xs p-1.5 border rounded-r"
                            value={specValue}
                            placeholder="Value"
                            onChange={(e) =>
                              updateSpec(
                                criterion.category,
                                specName,
                                e.target.value
                              )
                            }
                          />
                          <button
                            className="text-xs text-danger p-1"
                            onClick={() =>
                              removeSpec(criterion.category, specName)
                            }
                          >
                            <MinusIcon size={14} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              className={buttonStyles({
                color: "default",
                variant: "flat",
                radius: "full",
              })}
              onClick={handleRegenerate}
            >
              Regenerate
            </button>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "shadow",
              })}
              onClick={handleNext}
              disabled={criteria.length === 0}
            >
              Next &gt;
            </button>
          </div>
        </>
      )}
    </section>
  );
}
