import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "GEMINI_API_KEY environment variable is not set",
        setup: "Please add your Gemini API key to .env.local",
      },
      { status: 500 }
    );
  }

  if (apiKey === "your_gemini_api_key_here") {
    return NextResponse.json(
      {
        status: "error",
        message: "GEMINI_API_KEY is set to the default placeholder value",
        setup:
          "Please replace with your actual API key from https://makersuite.google.com/app/apikey",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "success",
    message: "API key is configured",
    keyPrefix: `${apiKey.substring(0, 8)}...`,
  });
}
