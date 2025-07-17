import { NextRequest, NextResponse } from "next/server";
import { GeminiService } from "@/lib/gemini";

// Initialize Gemini service
const geminiService = new GeminiService();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "La URL es requerida" },
        { status: 400 }
      );
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial progress
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                progress: "Inicializando modelo de IA...",
              })}\n\n`
            )
          );

          // Send URL analysis progress
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                progress: "Analizando URL y generando contenido...",
              })}\n\n`
            )
          );

          // Generate content
          const result = await geminiService.generateContent(url);

          // Send content in chunks to simulate streaming
          const words = result.split(" ");
          let currentChunk = "";

          for (let i = 0; i < words.length; i++) {
            currentChunk += words[i] + " ";

            // Send chunk every 10 words or at the end
            if (i % 10 === 0 || i === words.length - 1) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: currentChunk })}\n\n`
                )
              );
              currentChunk = "";

              // Small delay to simulate real-time generation
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                progress: "¡Completado!",
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("Streaming error:", error);

          let errorMessage = "Falló la generación de contenido";
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: errorMessage,
                details: error instanceof Error ? error.stack : "Unknown error",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate API:", error);

    let errorMessage = "Falló la generación de contenido";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes("API key")) {
        statusCode = 401;
      } else if (error.message.includes("quota")) {
        statusCode = 429;
      } else if (error.message.includes("Network error")) {
        statusCode = 503;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : "Unknown error",
      },
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "La API de Email Genius está funcionando",
  });
}
