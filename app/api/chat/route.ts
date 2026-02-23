import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const dynamic = "force-dynamic";

// HARDCODED KEY: Bypasses Windows .env issues completely
const groq = createGroq({ 
  apiKey: "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" 
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // We use llama3-8b because it is the fastest and least likely to timeout
    const result = await streamText({
      model: groq("llama3-8b-8192") as any,
      messages,
      system: "You are a professional assistant for MPS Dental. Ground your answers in dental clinic data.",
    });

    return (result as any).toDataStreamResponse();
  } catch (error: any) {
    // This logs the REAL error to your terminal so you can see it
    console.error("DEBUG:", error.message);
    return new Response(error.message, { status: 500 });
  }
}