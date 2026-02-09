import { NextResponse } from "next/server";

export async function POST(req) {
  const { habit } = await req.json();

  const requestBody = {
    prompt: { text: `Explain the long-term impact of this habit: ${habit}` },
    temperature: 0.7,
    max_output_tokens: 300
  };

  console.log("Habit received:", habit);
  console.log("Request body:", requestBody);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    }
  );

  const data = await response.json();
  console.log("API response:", data);

  return NextResponse.json({
    result: data?.candidates?.[0]?.output || "No response"
  });
}
