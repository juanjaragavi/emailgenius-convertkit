import { GoogleAuth } from "google-auth-library";

interface ImageGenerationResponse {
  predictions: Array<{
    mimeType: string;
    bytesBase64Encoded: string;
  }>;
}

export class VertexAIService {
  private readonly auth: GoogleAuth;
  private readonly projectId: string;
  private readonly locationId: string;
  private readonly modelId: string;
  private readonly endpoint: string;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    this.projectId = "absolute-brook-452020-d5";
    this.locationId = "us-central1";
    this.modelId = "imagen-4.0-generate-preview-06-06";
    this.endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.locationId}/publishers/google/models/${this.modelId}:predict`;
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      // Get access token
      const client = await this.auth.getClient();
      const token = await client.getAccessToken();

      if (!token.token) {
        throw new Error("Failed to get access token");
      }

      // Prepare request body (matches the working curl command format)
      const requestBody = {
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          aspectRatio: "16:9",
          sampleCount: 1,
          negativePrompt:
            "Disfigurements, six fingers per hand, low realism, lack of coherence, low-resolution images, grainy textures, lack of detail, abnormal appearances, illegible text, and grammatical and syntax errors, non-coherent situations, distorted human and/or animal bodies, figures, and objects; devices with more than one screen; screens popping out of devices, such as laptops and mobile phones; and people belonging to only one ethnicity.",
          enhancePrompt: false,
          personGeneration: "allow_all",
          safetySetting: "block_few",
          addWatermark: false,
          includeRaiReason: true,
          language: "auto",
        },
      };

      // Make request to Vertex AI
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Vertex AI request failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result: ImageGenerationResponse = await response.json();

      if (!result.predictions || result.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = result.predictions[0];
      if (!prediction.bytesBase64Encoded) {
        throw new Error("No image data returned from Vertex AI");
      }

      // Return base64 encoded image with data URL prefix
      return `data:${prediction.mimeType};base64,${prediction.bytesBase64Encoded}`;
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }
}
