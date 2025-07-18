"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [notification, setNotification] = useState("");

  // Image generation state
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState("");

  // Clear all data with confirmation
  const clearAllData = useCallback(() => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer."
    );

    if (confirmed) {
      setUrl("");
      setCampaignId("");
      setResponse("");
      setProgress("");
      setImageUrl("");
      setImageProgress("");
      setNotification("¡Todos los datos han sido borrados exitosamente!");

      // Clear the notification after 3 seconds
      setTimeout(() => setNotification(""), 3000);
    }
  }, []);

  // UTM parameter generation function
  const generateTargetUrl = useCallback(
    (productUrl: string, campaignIdValue: string) => {
      if (!productUrl || !campaignIdValue) return "";

      try {
        const url = new URL(productUrl);

        // Determine campaign prefix based on URL
        let campaignPrefix = "";
        if (url.hostname.includes("us.topfinanzas.com")) {
          campaignPrefix = "us_tc_bc";
        } else if (
          url.hostname.includes("topfinanzas.com") &&
          url.pathname.includes("/mx/")
        ) {
          campaignPrefix = "mx_tc_bc";
        } else {
          // Default fallback - try to detect from hostname
          if (url.hostname.includes(".mx") || url.pathname.includes("/mx")) {
            campaignPrefix = "mx_tc_bc";
          } else {
            campaignPrefix = "us_tc_bc"; // Default to US
          }
        }

        // Generate UTM parameters in the desired order
        const utmParams = new URLSearchParams({
          utm_campaign: `${campaignPrefix}_${campaignIdValue}`,
          utm_medium: "email",
          utm_source: "convertkit",
          utm_term: "broadcast",
          utm_content: "boton_1",
        });

        // Append UTM parameters to the original URL
        const separator = url.search ? "&" : "?";
        return `${productUrl}${separator}${utmParams.toString()}`;
      } catch (error) {
        console.error("Error generating target URL:", error);
        return productUrl; // Return original URL if there's an error
      }
    },
    []
  );

  // Validate campaign ID
  const validateCampaignId = useCallback((id: string) => {
    if (!id)
      return { isValid: false, message: "El ID de campaña es requerido" };
    if (!/^\d+$/.test(id))
      return {
        isValid: false,
        message: "El ID de campaña debe contener solo números",
      };
    if (id.length < 1 || id.length > 10)
      return {
        isValid: false,
        message: "El ID de campaña debe tener entre 1 y 10 dígitos",
      };
    return { isValid: true, message: "" };
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      // Check if there's any selected text
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText) {
        // Copy selected text - preserve original formatting
        await navigator.clipboard.writeText(selectedText);
        setNotification(
          `¡Texto seleccionado copiado! Al pegar en ConvertKIT, haz clic en "Yes, format" para conservar Markdown.`
        );
      } else {
        // Copy full content as fallback - preserve original Markdown formatting
        await navigator.clipboard.writeText(response);
        setNotification(
          '¡Campaña de correo electrónico completa copiada! Al pegar en ConvertKIT, haz clic en "Yes, format" para conservar Markdown.'
        );
      }

      setTimeout(() => setNotification(""), 5000); // Longer timeout for guidance message
    } catch (err) {
      console.error("Falló la copia: ", err);
      setNotification("Falló la copia al portapapeles");
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
        issues.push("Marcadores de negrita (**) sin pareja detectados");
      }

      // Check for proper bullet point formatting
      const bulletLines = content
        .split("\n")
        .filter((line) => line.trim().match(/^[\*\-\+]\s/));
      bulletLines.forEach((line) => {
        if (!line.match(/^[\*\-\+]\s+\S/)) {
          issues.push("Formato de viñeta incorrecto detectado");
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
          "Sintaxis de variable no compatible con ConvertKIT detectada - debería usar {{ subscriber.first_name }}"
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
    console.log("=== DEBUG DE ANÁLISIS ===");
    console.log("Texto sin procesar:", text);

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
      console.log(`\n--- Probando ${fieldName} ---`);
      for (let i = 0; i < fieldPatterns.length; i++) {
        const pattern = fieldPatterns[i];
        const match = text.match(pattern);
        console.log(
          `Patrón ${i + 1}: ${pattern.source} - ${
            match ? "COINCIDENCIA" : "SIN COINCIDENCIA"
          }`
        );
        if (match) {
          console.log(`  Resultado: "${match[1].trim()}"`);
          break;
        }
      }
    }

    console.log("=== FIN DEL DEBUG ===");
  }, []);

  // Enhanced copy function with validation and better error handling
  const copyFieldWithValidation = useCallback(
    async (content: string, fieldName: string) => {
      try {
        // Validate Markdown before copying
        const validation = validateMarkdown(content);

        if (!validation.isValid) {
          console.warn(
            `Problemas de validación de Markdown para ${fieldName}:`,
            validation.issues
          );
          // Still copy but warn user
          setNotification(
            `${fieldName} copiado con advertencias de formato. Revisa la consola para más detalles.`
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
            `¡${fieldName} copiado! Al pegar en ConvertKIT, haz clic en "Yes, format" para conservar Markdown.`
          );
        }

        setTimeout(() => setNotification(""), 5000);
      } catch (err) {
        console.error("Falló la copia: ", err);
        setNotification(
          "Falló la copia al portapapeles - por favor, inténtalo de nuevo"
        );
        setTimeout(() => setNotification(""), 3000);
      }
    },
    [validateMarkdown]
  );

  // Parse response to extract individual fields with Markdown preservation
  const parseEmailFields = useCallback(
    (text: string) => {
      const fields = {
        subjectLine1: "",
        subjectLine2: "",
        previewText: "",
        emailBody: "",
        ctaButton: "",
        imageConcept: "",
        targetUrl: "",
      };

      // Generate target URL with UTM parameters if campaign ID is provided
      if (url && campaignId) {
        fields.targetUrl = generateTargetUrl(url, campaignId);
      }

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
    },
    [url, campaignId, generateTargetUrl]
  );

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
      className="inline-flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded border border-blue-300 transition-colors duration-200 cursor-pointer"
      title={`Copiar ${fieldName} con formato Markdown y validación`}
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
      Copiar
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
        showNotification("Foco en la entrada de URL");
      }

      // Enter key to submit form (when input is focused)
      if (
        e.key === "Enter" &&
        (e.target === document.getElementById("url") ||
          e.target === document.getElementById("campaignId"))
      ) {
        e.preventDefault();
        if (!loading && url.trim() && campaignId.trim()) {
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
  }, [loading, url, campaignId, showNotification]);

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
              Línea de Asunto de Prueba A/B 1
            </h3>
            <CopyButton
              content={fields.subjectLine1}
              fieldName="Línea de Asunto 1"
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
              Línea de Asunto de Prueba A/B 2
            </h3>
            <CopyButton
              content={fields.subjectLine2}
              fieldName="Línea de Asunto 2"
            />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.subjectLine2}
          </p>
        </div>

        {/* Preview Text */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              Texto de Vista Previa
            </h3>
            <CopyButton
              content={fields.previewText}
              fieldName="Texto de Vista Previa"
            />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.previewText}
          </p>
        </div>

        {/* Email Body */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              Cuerpo del Correo
            </h3>
            <CopyButton
              content={fields.emailBody}
              fieldName="Cuerpo del Correo"
            />
          </div>
          <div className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
            {fields.emailBody}
          </div>
        </div>

        {/* CTA Button */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              Texto del Botón de Llamada a la Acción
            </h3>
            <CopyButton
              content={fields.ctaButton}
              fieldName="Texto del Botón de Llamada a la Acción"
            />
          </div>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {fields.ctaButton}
          </p>
        </div>

        {/* Target URL with UTM Parameters */}
        {fields.targetUrl && (
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-gray-800">
                URL de Destino con Parámetros UTM
              </h3>
              <CopyButton
                content={fields.targetUrl}
                fieldName="URL de Destino"
              />
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm text-green-700 font-medium mb-2">
                ✅ URL generada automáticamente con parámetros UTM para análisis
                de campaña
              </p>
              <div className="text-gray-700 bg-white p-2 rounded border text-sm break-all">
                {fields.targetUrl}
              </div>
              <div className="mt-2 text-xs text-green-600">
                <strong>Parámetros UTM incluidos:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• utm_source: convertkit</li>
                  <li>• utm_medium: email</li>
                  <li>• utm_term: broadcast</li>
                  <li>• utm_content: boton_1</li>
                  <li>
                    • utm_campaign:{" "}
                    {campaignId
                      ? url.includes("us.topfinanzas.com")
                        ? `us_tc_bc_${campaignId}`
                        : `mx_tc_bc_${campaignId}`
                      : "N/A"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Image Concept */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-800">
              Concepto de Imagen
            </h3>
            <CopyButton
              content={fields.imageConcept}
              fieldName="Concepto de Imagen"
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
              Información de Depuración de Análisis
            </h3>
            <div className="text-yellow-700 text-sm mb-2">
              <p>
                Campos faltantes:{" "}
                {[
                  !fields.subjectLine1 && "Línea de Asunto 1",
                  !fields.subjectLine2 && "Línea de Asunto 2",
                  !fields.previewText && "Texto de Vista Previa",
                  !fields.emailBody && "Cuerpo del Correo",
                  !fields.ctaButton && "Botón de Llamada a la Acción",
                  !fields.imageConcept && "Concepto de Imagen",
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-2">Salida de IA sin procesar:</p>
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
                Fallo Completo en el Análisis
              </h3>
              <p className="text-red-700 text-sm mb-2">
                No se pudieron analizar campos de la salida de la IA. Por favor,
                verifica el formato.
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

    // Validate campaign ID before proceeding
    const campaignValidation = validateCampaignId(campaignId);
    if (!campaignValidation.isValid) {
      setNotification(campaignValidation.message);
      setTimeout(() => setNotification(""), 4000);
      return;
    }

    setLoading(true);
    setResponse("");
    setProgress("Inicializando modelo de IA...");

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
        let errorMessage = "Falló la generación de contenido";

        if (errorData.error) {
          errorMessage = errorData.error;
        }

        // Add specific error guidance based on status code
        if (res.status === 401) {
          errorMessage +=
            "\n\nPor favor, verifica tu clave de API de Gemini en las variables de entorno.";
        } else if (res.status === 429) {
          errorMessage +=
            "\n\nCuota de API excedida. Por favor, inténtalo de nuevo más tarde.";
        } else if (res.status === 503) {
          errorMessage +=
            "\n\nProblema de conectividad de red. Por favor, verifica tu conexión a internet.";
        }

        throw new Error(errorMessage);
      }

      const reader = res.body?.getReader();

      if (!reader) {
        // Fallback for non-streaming response
        const data = await res.json();
        setResponse(data.content || data.error || "Error desconocido");
        setProgress("¡Completado!");
        return;
      }

      const decoder = new TextDecoder();
      let result = "";

      setProgress("Analizando URL y generando contenido...");

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
                setProgress(
                  "¡Contenido del correo generado! Iniciando generación de imagen..."
                );
                const fields = parseEmailFields(result);
                if (fields.imageConcept) {
                  await handleImageGeneration(fields.imageConcept);
                } else {
                  setImageProgress(
                    "No se pudo encontrar el concepto de la imagen en el contenido del correo."
                  );
                }
                setProgress("¡Completado!");
              }
              if (data.error) {
                let errorMessage = data.error;

                // Add helpful guidance for common errors
                if (errorMessage.includes("API key")) {
                  errorMessage +=
                    "\n\n🔧 Para solucionarlo:\n1. Obtén tu clave de API de https://makersuite.google.com/app/apikey\n2. Añádela a tu archivo .env.local como GEMINI_API_KEY=tu_clave_aqui\n3. Reinicia el servidor de desarrollo";
                } else if (errorMessage.includes("quota")) {
                  errorMessage +=
                    "\n\n⏰ Se ha excedido la cuota de la API. Por favor, inténtalo de nuevo más tarde o revisa tus límites de cuota en la Google Cloud Console.";
                } else if (errorMessage.includes("Network error")) {
                  errorMessage +=
                    "\n\n🌐 Revisa tu conexión a internet e inténtalo de nuevo.";
                }

                setResponse(errorMessage);
                setProgress("Ocurrió un error");
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
      let errorMessage = "Ocurrió un error al procesar tu solicitud.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResponse(errorMessage);
      setProgress("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  // Image generation handler
  const handleImageGeneration = async (imageConcept: string) => {
    setImageLoading(true);
    setImageUrl("");
    setImageProgress("Generando imagen con IA...");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageConcept }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falló la generación de la imagen");
      }

      const data = await res.json();

      if (data.imageUrl) {
        setImageProgress("Imagen recibida, preparando para mostrar...");
        setImageUrl(data.imageUrl);
        // The key on the Image component will handle the re-render
        setImageProgress("¡Imagen mostrada exitosamente!");
      } else {
        throw new Error("La API no devolvió ninguna URL de imagen.");
      }
    } catch (error) {
      console.error("Error en la generación de la imagen:", error);
      setImageProgress("Ocurrió un error durante la generación de la imagen");
      setNotification(
        error instanceof Error
          ? error.message
          : "Falló la generación de la imagen"
      );
      setTimeout(() => setNotification(""), 5000);
    } finally {
      setImageLoading(false);
    }
  };

  // Download image handler
  const downloadImage = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated_image.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setNotification("¡Imagen descargada exitosamente!");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error de descarga:", error);
      setNotification("Falló la descarga de la imagen");
      setTimeout(() => setNotification(""), 3000);
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
            Genera campañas de correo electrónico de alta conversión para
            productos financieros utilizando plantillas impulsadas por IA
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Atajos de Teclado:</strong> Presiona{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">⌘K</kbd> (o{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">
                Ctrl+K
              </kbd>
              ) para enfocar en la entrada de URL • Presiona{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">Enter</kbd>{" "}
              para generar • Usa{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">Tab</kbd>{" "}
              para navegar • Selecciona cualquier texto y haz clic en el botón
              de copiar o usa{" "}
              <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">⌘C</kbd>{" "}
              para copiar el texto seleccionado
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
                  Guía de Integración de ConvertKIT
                </h4>
                <p className="text-sm text-orange-700 mb-2">
                  Al pegar contenido en ConvertKIT, es posible que veas un
                  diálogo preguntando &ldquo;Format as Markdown?&rdquo;:
                </p>
                <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                  <li>
                    <strong>
                      Siempre haz clic en &ldquo;Yes, format&rdquo;
                    </strong>{" "}
                    para conservar el texto en negrita, el formato y la
                    estructura
                  </li>
                  <li>
                    Hacer clic en &ldquo;No, paste as usual&rdquo; eliminará
                    todo el formato Markdown
                  </li>
                  <li>
                    El contenido está optimizado para el procesador de Markdown
                    de ConvertKIT
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
                URL del Producto
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

            <div>
              <label
                htmlFor="campaignId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ID de Campaña de ConvertKIT
                <span className="text-xs text-gray-500 ml-1">
                  (solo números)
                </span>
              </label>
              <input
                type="text"
                id="campaignId"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="123456"
                pattern="[0-9]+"
                title="Solo se permiten números"
                tabIndex={2}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Introduce el ID numérico de tu campaña de ConvertKIT para
                generar parámetros UTM automáticamente
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || imageLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
              tabIndex={3}
            >
              {loading || imageLoading
                ? "Generando..."
                : "Generar Correo e Imagen"}
            </button>

            {(loading || progress) && (
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
                  Campaña de Correo Electrónico de ConvertKIT Generada:
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearAllData}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm cursor-pointer transition-colors duration-200"
                    tabIndex={4}
                    title="Borrar todo el contenido generado y los campos de entrada y generar un nuevo correo"
                  >
                    Generar Correo Nuevo
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm cursor-pointer transition-colors duration-200"
                    tabIndex={4}
                    title="Copiar texto seleccionado o contenido completo con formato Markdown"
                  >
                    Copiar Todo
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

          {/* Image Generation Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-purple-800">
                Generación de Imágenes con IA
              </h3>
            </div>

            <p className="text-sm text-purple-700 mb-4">
              La imagen se generará automáticamente después de crear el
              contenido del correo, utilizando el &lsquo;Concepto de
              Imagen&rsquo; del texto generado.
            </p>

            {(imageLoading || imageProgress) && (
              <div className="mt-4 p-3 bg-purple-100 rounded-md">
                <div className="text-sm text-purple-800 font-medium">
                  {imageProgress}
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            )}

            {imageUrl && (
              <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-purple-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-purple-800">
                    Imagen Generada
                  </h4>
                  <button
                    onClick={downloadImage}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm cursor-pointer transition-colors duration-200"
                  >
                    Descargar Imagen
                  </button>
                </div>
                <Image
                  key={imageUrl}
                  src={imageUrl}
                  alt={`Generated image for the campaign`}
                  width={512}
                  height={512}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
