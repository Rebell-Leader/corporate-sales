"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProcess } from "@/lib/context/ProcessContext";
import { generateEmails, sendEmails, RFQEmail } from "@/lib/api";

const loadingMessages = [
  "Analyzing requirements...",
  "Crafting personalized messages...",
  "Formatting specifications...",
  "Finalizing email content...",
];

export default function EmailPage() {
  const router = useRouter();
  const { criteria, recommendations } = useProcess();
  const [emails, setEmails] = useState<RFQEmail[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (emails.length > 0 && !selectedCategory) {
      setSelectedCategory(emails[0].category);
    }
  }, [emails, selectedCategory]);

  useEffect(() => {
    if (criteria.length === 0) {
      router.push("/");

      return;
    }

    let messageInterval: NodeJS.Timeout;

    const loadEmails = async () => {
      messageInterval = setInterval(() => {
        setLoadingMessageIndex((current) =>
          current >= loadingMessages.length - 1 ? 0 : current + 1
        );
      }, 2000);

      try {
        const response = await generateEmails(recommendations || []);

        if (response.success) {
          setEmails(response.emails);
          setSelectedCategory(response.emails[0]?.category || "");
        } else {
          setError(response.message || "Failed to generate emails");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
        clearInterval(messageInterval);
      }
    };

    loadEmails();

    return () => {
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [criteria.length, router, recommendations]);

  const handleEmailChange = (field: keyof RFQEmail, value: string) => {
    setEmails(
      emails.map((email) =>
        email.category === selectedCategory
          ? { ...email, [field]: value }
          : email
      )
    );
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      setError(null);

      const response = await sendEmails(emails);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Failed to send emails");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await generateEmails(recommendations || []);

      if (response.success) {
        setEmails(response.emails);
      } else {
        setError(response.message || "Failed to regenerate emails");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center mb-6">
          <span className={title({ size: "sm" })}>
            Emails Sent Successfully!
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Thank you for using our service. Your RFQ emails have been sent.
          </div>
        </div>

        <button
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          onClick={() => router.push("/")}
        >
          Start New Request
        </button>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <LoadingSpinner size="lg" />
        </div>
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-foreground-600">
            {loadingMessages[loadingMessageIndex]}
          </p>
          <p className="text-sm text-foreground-500 mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  const selectedEmail = emails.find((e) => e.category === selectedCategory);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center mb-6">
        <span className={title({ size: "sm" })}>Review RFQ Emails</span>
        <div className={subtitle({ class: "mt-4" })}>
          Review and edit the generated emails before sending.
        </div>
      </div>

      <div className="w-full max-w-4xl">
        {/* Category Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2 p-1 bg-content2 rounded-lg">
            {emails.map((email) => (
              <button
                key={email.category}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  email.category === selectedCategory
                    ? "bg-primary text-white"
                    : "hover:bg-content3"
                }`}
                onClick={() => setSelectedCategory(email.category)}
              >
                {email.category}
              </button>
            ))}
          </div>
        </div>

        {selectedEmail && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="email-to"
              >
                To:
              </label>
              <input
                className="w-full p-2 rounded border bg-transparent"
                id="email-to"
                type="email"
                value={selectedEmail.to}
                onChange={(e) => handleEmailChange("to", e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="email-subject"
              >
                Subject:
              </label>
              <input
                className="w-full p-2 rounded border bg-transparent"
                id="email-subject"
                type="text"
                value={selectedEmail.subject}
                onChange={(e) => handleEmailChange("subject", e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="email-content"
              >
                Content:
              </label>
              <textarea
                className="w-full h-96 p-4 rounded border bg-transparent font-mono text-sm"
                id="email-content"
                value={selectedEmail.content}
                onChange={(e) => handleEmailChange("content", e.target.value)}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-danger/10 border border-danger rounded-lg text-center">
            <p className="text-danger">{error}</p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <button
            className={buttonStyles({
              color: "default",
              variant: "flat",
              radius: "full",
            })}
            onClick={() => router.push("/processing")}
          >
            &lt; Back
          </button>
          <button
            className={buttonStyles({
              color: "default",
              variant: "flat",
              radius: "full",
            })}
            disabled={isSending}
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
            disabled={isSending}
            onClick={handleSend}
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Emails"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
