import { NextRequest, NextResponse } from "next/server";
import { VertexAIService } from "@/lib/vertexai";

// Initialize Vertex AI service
const vertexAIService = new VertexAIService();

export async function POST(request: NextRequest) {
  try {
    const { imageConcept } = await request.json();

    if (!imageConcept) {
      return NextResponse.json(
        {
          error: "imageConcept is required",
        },
        { status: 400 }
      );
    }

    const imageDataUrl = await vertexAIService.generateImage(imageConcept);

    return NextResponse.json({ imageUrl: imageDataUrl });
  } catch (error) {
    console.error("Error in image generation API:", error);

    let errorMessage = "Failed to generate image";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (
        error.message.includes("authentication") ||
        error.message.includes("token")
      ) {
        statusCode = 401;
      } else if (
        error.message.includes("quota") ||
        error.message.includes("limit")
      ) {
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
  return NextResponse.json({ message: "Image Generation API is running" });
}
