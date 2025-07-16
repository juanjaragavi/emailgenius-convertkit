"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [notification, setNotification] = useState("");

  const copyToClipboard = useCallback(async () => {
    try {
      // Check if there's any selected text
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText) {
        // Copy selected text - preserve original formatting
        await navigator.clipboard.writeText(selectedText);
        setNotification(
          `Selected text copied! When pasting to ConvertKIT, click "Yes, format" to preserve Markdown.`
        );
      } else {
        // Copy full content as fallback - preserve original Markdown formatting
        await navigator.clipboard.writeText(response);
        setNotification(
          'Full email campaign copied! When pasting to ConvertKIT, click "Yes, format" to preserve Markdown.'
        );
      }

      setTimeout(() => setNotification(""), 5000); // Longer timeout for guidance message
    } catch (err) {
      console.error("Failed to copy: ", err);
      setNotification("Failed to copy to clipboard");
      setTimeout(() => setNotification(""), 3000);
    }
  }, [response]);

  // Markdown validation function to ensure proper formatting
  const validateMarkdown = useCallback(
    (content: string): { isValid: boolean; issues: string[] } => {
      const issues: string[] = [];

      // Check for unmatched bold markers
      const boldMarkers = (content.match(/\*\*/g) || []).length;
      if (boldMarkers % 2 !== 0) {
        issues.push("Unmatched bold markers (**) detected");
      }

      // Check for proper bullet point formatting
      const bulletLines = content
        .split("\n")
        .filter((line) => line.trim().match(/^[\*\-\+]\s/));
      bulletLines.forEach((line) => {
        if (!line.match(/^[\*\-\+]\s+\S/)) {
          issues.push("Improper bullet point formatting detected");
        }
      });

      // Check for ConvertKIT variable syntax
      if (content.includes("{{ subscriber.first_name }}")) {
        // Valid ConvertKIT syntax
      } else if (
        content.includes("%FIRSTNAME%") ||
        content.includes("[FIRSTNAME]")
      ) {
        issues.push(
          "Non-ConvertKIT variable syntax detected - should use {{ subscriber.first_name }}"
        );
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    },
    []
  );

  // Debug parsing function to help troubleshoot format issues
  const debugParseFields = useCallback((text: string) => {
    console.log("=== PARSING DEBUG ===");
    console.log("Raw text:", text);

    const patterns = {
      subjectLine1: [
        /\*\*A\/B Test Subject Line 1:\*\*\s*(.+)/,
        /(?:^|\n)1\.\s*\*\*A\/B Test Subject Line 1:\*\*\s*(.+)/,
        /Invitation:\s*(.+)/,
        /Subject\s*Line\s*1[:\s]*(.+)/i,
      ],
      subjectLine2: [
        /\*\*A\/B Test Subject Line 2:\*\*\s*(.+)/,
        /(?:^|\n)2\.\s*\*\*A\/B Test Subject Line 2:\*\*\s*(.+)/,
        /Priority\s*Notification:\s*(.+)/,
        /Subject\s*Line\s*2[:\s]*(.+)/i,
      ],
      previewText: [
        /\*\*Preview Text:\*\*\s*(.+)/,
        /(?:^|\n)3\.\s*\*\*Preview Text:\*\*\s*(.+)/,
        /Preview\s*Text:\s*(.+)/,
      ],
    };

    for (const [fieldName, fieldPatterns] of Object.entries(patterns)) {
      console.log(`\n--- Testing ${fieldName} ---`);
      for (let i = 0; i < fieldPatterns.length; i++) {
        const pattern = fieldPatterns[i];
        const match = text.match(pattern);
        console.log(
          `Pattern ${i + 1}: ${pattern.source} - ${
            match ? "MATCH" : "NO MATCH"
          }`
        );
        if (match) {
          console.log(`  Result: "${match[1].trim()}"`);
          break;
        }
      }
    }

    console.log("=== END DEBUG ===");
  }, []);

  // Enhanced copy function with validation and better error handling
  const copyFieldWithValidation = useCallback(
    async (content: string, fieldName: string) => {
      try {
        // Validate Markdown before copying
        const validation = validateMarkdown(content);

        if (!validation.isValid) {
          console.warn(
            `Markdown validation issues for ${fieldName}:`,
            validation.issues
          );
          // Still copy but warn user
          setNotification(
            `${fieldName} copied with formatting warnings. Check console for details.`
          );
        }

        // Ensure content is clean but preserve Markdown
        const cleanContent = content
          .replace(/^\s*\n+|\n+\s*$/g, "") // Remove leading/trailing empty lines
          .replace(/\n{3,}/g, "\n\n"); // Normalize multiple line breaks to double

        // Copy the cleaned content while preserving Markdown
        await navigator.clipboard.writeText(cleanContent);

        if (validation.isValid) {
          setNotification(
            `${fieldName} copied! When pasting to ConvertKIT, click "Yes, format" to preserve Markdown.`
          );
        }

        setTimeout(() => setNotification(""), 5000);
      } catch (err) {
        console.error("Failed to copy: ", err);
        setNotification("Failed to copy to clipboard - please try again");
        setTimeout(() => setNotification(""), 3000);
      }
    },
    [validateMarkdown]
  );

  // Parse response to extract individual fields with Markdown preservation
  const parseEmailFields = useCallback((text: string) => {
    const fields = {
      subjectLine1: "",
      subjectLine2: "",
      previewText: "",
      emailBody: "",
      ctaButton: "",
      imageConcept: "",
    };

    // Try multiple patterns for more flexible parsing
    const patterns = {
      subjectLine1: [
        /\*\*A\/B Test Subject Line 1:\*\*\s*(.+)/,
        /(?:^|\n)1\.\s*\*\*A\/B Test Subject Line 1:\*\*\s*(.+)/,
        /Invitation:\s*(.+)/,
        /Subject\s*Line\s*1[:\s]*(.+)/i,
      ],
      subjectLine2: [
        /\*\*A\/B Test Subject Line 2:\*\*\s*(.+)/,
        /(?:^|\n)2\.\s*\*\*A\/B Test Subject Line 2:\*\*\s*(.+)/,
        /Priority\s*Notification:\s*(.+)/,
        /Subject\s*Line\s*2[:\s]*(.+)/i,
      ],
      previewText: [
        /\*\*Preview Text:\*\*\s*(.+)/,
        /(?:^|\n)3\.\s*\*\*Preview Text:\*\*\s*(.+)/,
        /Preview\s*Text:\s*(.+)/,
      ],
      emailBody: [
        /\*\*Email Body:\*\*\s*([\s\S]*?)(?=\n\*\*Call-to-Action Button Text:\*\*)/,
        /(?:^|\n)4\.\s*\*\*Email Body:\*\*\s*([\s\S]*?)(?=\n\*\*Call-to-Action Button Text:\*\*)/,
        /(?:^|\n)4\.\s*\*\*Email Body:\*\*\s*([\s\S]*?)(?=\n(?:5\.|.*Call-to-Action))/,
        /Hi\s*\{\{\s*subscriber\.first_name\s*\}\}[,\s]*([\s\S]*?)(?=\nCall-to-Action Button Text:)/,
        /(Hi\s*\{\{\s*subscriber\.first_name\s*\}\}[\s\S]*?)(?=\nCall-to-Action Button Text:)/,
      ],
      ctaButton: [
        /\*\*Call-to-Action Button Text:\*\*\s*(.+)/,
        /(?:^|\n)5\.\s*\*\*Call-to-Action Button Text:\*\*\s*(.+)/,
        /Call-to-Action\s*Button\s*Text:\s*(.+)/,
      ],
      imageConcept: [
        /\*\*Image Concept:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/,
        /(?:^|\n)6\.\s*\*\*Image Concept:\*\*\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/,
        /Image\s*Concept:\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/,
      ],
    };

    // Try each pattern for each field
    for (const [fieldName, fieldPatterns] of Object.entries(patterns)) {
      for (const pattern of fieldPatterns) {
        const match = text.match(pattern);
        if (match) {
          const content = match[1].trim();
          if (content) {
            if (fieldName === "emailBody" || fieldName === "imageConcept") {
              // Preserve internal formatting but clean up leading/trailing whitespace
              fields[fieldName as keyof typeof fields] = content
                .replace(/^\s*\n|\n\s*$/g, "")
                .trim();
            } else {
              fields[fieldName as keyof typeof fields] = content;
            }
            break; // Found a match, move to next field
          }
        }
      }
    }

    // If email body is still empty, try to extract from Hi {{ subscriber.first_name }} to CTA
    if (!fields.emailBody) {
      const emailBodyFallback = text.match(
        /(Hi\s*\{\{\s*subscriber\.first_name\s*\}\}[\s\S]*?)(?=\nCall-to-Action Button Text:|$)/
      );
      if (emailBodyFallback) {
        fields.emailBody = emailBodyFallback[1]
          .replace(/^\s*\n|\n\s*$/g, "")
          .trim();
      }
    }

    // If still no email body, try to extract everything between Preview Text and Call-to-Action
    if (!fields.emailBody) {
      const emailBodyFallback2 = text.match(
        /Preview Text:.*?\n\n([\s\S]*?)(?=\nCall-to-Action Button Text:|$)/
      );
      if (emailBodyFallback2) {
        fields.emailBody = emailBodyFallback2[1]
          .replace(/^\s*\n|\n\s*$/g, "")
          .trim();
      }
    }

    return fields;
  }, []);

  // Copy button component with ConvertKIT integration guidance and validation
  const CopyButton = ({
    content,
    fieldName,
  }: {
    content: string;
    fieldName: string;
  }) => (
    <button
      onClick={() => copyFieldWithValidation(content, fieldName)}
      className="inline-flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded border border-blue-300 transition-colors duration-200"
      title={`Copy ${fieldName} with Markdown formatting and validation`}
    >
      <svg
        className="w-3 h-3 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      Copy
    </button>
  );

  // Show notification when keyboard shortcuts are used
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2000);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K for focus on input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const urlInput = document.getElementById("url") as HTMLInputElement;
        urlInput?.focus();
        showNotification("Focused on URL input");
      }

      // Enter key to submit form (when input is focused)
      if (e.key === "Enter" && e.target === document.getElementById("url")) {
        e.preventDefault();
        if (!loading && url.trim()) {
          const form = document.querySelector("form");
          if (form) {
            const submitEvent = new Event("submit", {
              bubbles: true,
              cancelable: true,
            });
            form.dispatchEvent(submitEvent);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, url, showNotification]);

  const renderEmailFields = (text: string) => {
    // Debug the parsing for troubleshooting
    debugParseFields(text);

    const fields = parseEmailFields(text);

    return (
      <div className="space-y-6">
        {/* Subject Line 1 */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              A/B Test Subject Line 1
            </h3>
            <CopyButton
              content={fields.subjectLine1}
              fieldName="Subject Line 1"
            />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.subjectLine1}
          </p>
        </div>

        {/* Subject Line 2 */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              A/B Test Subject Line 2
            </h3>
            <CopyButton
              content={fields.subjectLine2}
              fieldName="Subject Line 2"
            />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.subjectLine2}
          </p>
        </div>

        {/* Preview Text */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">Preview Text</h3>
            <CopyButton content={fields.previewText} fieldName="Preview Text" />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.previewText}
          </p>
        </div>

        {/* Email Body */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">Email Body</h3>
            <CopyButton content={fields.emailBody} fieldName="Email Body" />
          </div>
          <div className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
            {fields.emailBody}
          </div>
        </div>

        {/* CTA Button */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              Call-to-Action Button Text
            </h3>
            <CopyButton
              content={fields.ctaButton}
              fieldName="CTA Button Text"
            />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.ctaButton}
          </p>
        </div>

        {/* Image Concept */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">Image Concept</h3>
            <CopyButton
              content={fields.imageConcept}
              fieldName="Image Concept"
            />
          </div>
          <div className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.imageConcept}
          </div>
        </div>

        {/* Debug information when parsing has issues */}
        {(!fields.subjectLine1 ||
          !fields.subjectLine2 ||
          !fields.previewText ||
          !fields.emailBody ||
          !fields.ctaButton) && (
          <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-yellow-800 mb-2">
              Parsing Debug Information
            </h3>
            <div className="text-yellow-700 text-sm mb-2">
              <p>
                Missing fields:{" "}
                {[
                  !fields.subjectLine1 && "Subject Line 1",
                  !fields.subjectLine2 && "Subject Line 2",
                  !fields.previewText && "Preview Text",
                  !fields.emailBody && "Email Body",
                  !fields.ctaButton && "CTA Button",
                  !fields.imageConcept && "Image Concept",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-2">Raw AI output:</p>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap text-sm bg-white p-2 rounded border max-h-40 overflow-y-auto">
              {text}
            </div>
          </div>
        )}

        {/* Fallback - show original text if complete parsing fails */}
        {!fields.subjectLine1 &&
          !fields.subjectLine2 &&
          !fields.previewText &&
          !fields.emailBody &&
          !fields.ctaButton &&
          !fields.imageConcept && (
            <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-red-800 mb-2">
                Complete Parsing Failure
              </h3>
              <p className="text-red-700 text-sm mb-2">
                Unable to parse any fields from the AI output. Please check the
                format.
              </p>
              <div className="text-gray-700 whitespace-pre-wrap text-sm bg-white p-2 rounded border max-h-40 overflow-y-auto">
                {text}
              </div>
            </div>
          )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setProgress("Initializing AI model...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = "Failed to generate content";

        if (errorData.error) {
          errorMessage = errorData.error;
        }

        // Add specific error guidance based on status code
        if (res.status === 401) {
          errorMessage +=
            "\n\nPlease check your Gemini API key in the environment variables.";
        } else if (res.status === 429) {
          errorMessage += "\n\nAPI quota exceeded. Please try again later.";
        } else if (res.status === 503) {
          errorMessage +=
            "\n\nNetwork connectivity issue. Please check your internet connection.";
        }

        throw new Error(errorMessage);
      }

      const reader = res.body?.getReader();

      if (!reader) {
        // Fallback for non-streaming response
        const data = await res.json();
        setResponse(data.content || data.error || "Unknown error");
        setProgress("Complete!");
        return;
      }

      const decoder = new TextDecoder();
      let result = "";

      setProgress("Analyzing URL and generating content...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                result += data.content;
                setResponse(result);
              }
              if (data.progress) {
                setProgress(data.progress);
              }
              if (data.done) {
                setProgress("Complete!");
              }
              if (data.error) {
                let errorMessage = data.error;

                // Add helpful guidance for common errors
                if (errorMessage.includes("API key")) {
                  errorMessage +=
                    "\n\n🔧 To fix this:\n1. Get your API key from https://makersuite.google.com/app/apikey\n2. Add it to your .env.local file as GEMINI_API_KEY=your_key_here\n3. Restart the development server";
                } else if (errorMessage.includes("quota")) {
                  errorMessage +=
                    "\n\n⏰ The API quota has been exceeded. Please try again later or check your Google Cloud Console for quota limits.";
                } else if (errorMessage.includes("Network error")) {
                  errorMessage +=
                    "\n\n🌐 Check your internet connection and try again.";
                }

                setResponse(errorMessage);
                setProgress("Error occurred");
                break;
              }
            } catch {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "An error occurred while processing your request.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResponse(errorMessage);
      setProgress("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-md">
          <div className="text-sm leading-relaxed">{notification}</div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            EmailGenius - ConvertKIT Email Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Generate high-converting email campaigns for financial products
            using AI-powered templates
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Keyboard Shortcuts:</strong> Press{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">⌘K</kbd>{" "}
              (or{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">
                Ctrl+K
              </kbd>
              ) to focus on URL input • Press{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">Enter</kbd>{" "}
              to generate • Use{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">Tab</kbd>{" "}
              to navigate • Select any text and click copy button or use{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">⌘C</kbd> to
              copy selected text
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-orange-600 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-bold text-orange-800 mb-2">
                  ConvertKIT Integration Guide
                </h4>
                <p className="text-sm text-orange-700 mb-2">
                  When pasting content into ConvertKIT, you may see a dialog
                  asking &ldquo;Format as Markdown?&rdquo;:
                </p>
                <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                  <li>
                    <strong>Always click &ldquo;Yes, format&rdquo;</strong> to
                    preserve bold text, formatting, and structure
                  </li>
                  <li>
                    Clicking &ldquo;No, paste as usual&rdquo; will remove all
                    Markdown formatting
                  </li>
                  <li>
                    The content is optimized for ConvertKIT&apos;s Markdown
                    processor
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="https://us.topfinanzas.com/financial-solutions/example-financial-product-page"
                tabIndex={1}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              tabIndex={2}
            >
              {loading ? "Generating Email..." : "Generate Email Campaign"}
            </button>

            {loading && progress && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <div className="text-sm text-blue-700 font-medium">
                  {progress}
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full animate-pulse"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            )}
          </form>

          {response && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  Generated ConvertKIT Email Campaign:
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    💡 Each field has its own copy button with Markdown
                    preservation
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm cursor-pointer"
                    tabIndex={3}
                    title="Copy selected text or full content with Markdown formatting"
                  >
                    Copy All
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="text-gray-800 leading-relaxed select-text cursor-text">
                  {renderEmailFields(response)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
