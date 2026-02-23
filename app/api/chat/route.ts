import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const dynamic = "force-dynamic";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      messages,
      system:
        "You are a professional assistant for MPS Dental. Ground your answers in dental clinic data.",
    });

    // ✅ correct method name for current AI SDK
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("DEBUG:", error);
    return new Response(
      typeof error?.message === "string" ? error.message : "Server error",
      { status: 500 }
    );
  }
}