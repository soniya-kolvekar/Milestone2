import { NextResponse } from "next/server";

export async function POST(req) {
  const { habit } = await req.json();

  const requestBody = {
    contents: [{
      parts: [{ text: `Explain the long-term impact of this habit: ${habit}` }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300
    }
  };

  console.log("Habit received:", habit);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    }
  );

  const data = await response.json();
  console.log("API response:", JSON.stringify(data, null, 2));

  return NextResponse.json({
    result: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
  });
}
