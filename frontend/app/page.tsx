"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";
import { Dropzone } from "@/components/Dropzone";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProcess } from "@/lib/context/ProcessContext";
import { extractCriteriaFromPDF } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { setPdfFile, setCriteria, isLoading, setIsLoading, setError } =
    useProcess();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // This function will be called when a file is accepted by the dropzone
  const handleFileAccepted = (file: File) => {
    console.log("File accepted:", file);
    setUploadedFile(file);
    setPdfFile(file);
  };

  const handleProcess = async () => {
    if (!uploadedFile) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the API to extract criteria from the PDF
      const response = await extractCriteriaFromPDF(uploadedFile);

      if (response.success) {
        setCriteria(response.criteria);

        // Navigate to the validation page
        router.push("/validate");
      } else {
        setError(response.message || "Failed to extract criteria from the PDF");
      }
    } catch (err) {
      console.error("Error processing PDF:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Automatically&nbsp;</span>
        <span className={title()}>generate&nbsp;</span>
        <br />
        <span className={title({ color: "violet" })}>RFQ responses</span>
        <div className={subtitle({ class: "mt-4" })}>
          Just drop the tender notice PDF and let our AI do the rest.
        </div>
      </div>

      {/* Dropzone */}
      <Dropzone onFileAccepted={handleFileAccepted} className="mt-6 mb-6" />

      <div className="flex gap-3">
        <button
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
            isDisabled: !uploadedFile || isLoading,
          })}
          disabled={!uploadedFile || isLoading}
          onClick={handleProcess}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </div>
          ) : (
            "Next >"
          )}
        </button>
      </div>
    </section>
  );
}
