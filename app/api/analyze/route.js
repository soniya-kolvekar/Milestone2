import { NextResponse } from "next/server";
export async function POST(req) {
  try {
    const { habit } = await req.json();

    const requestBody = {
      contents: [{
        parts: [{ text: `Provide a short, punchy, and concise analysis of the long-term impact of this habit: ${habit}. The response should be brief, high-impact, and limited to a maximum of 5 sentences. Cover the most important physiological and psychological effects quickly.` }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500
      }
    };


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Status:", response.status, response.statusText);
      console.error("API Error Body:", errorText);
      return NextResponse.json({ result: `Error: ${response.status} ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();


    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      console.error("Unexpected API response structure:", data);
      return NextResponse.json({ result: "No detailed response received from AI." }, { status: 500 });
    }

    return NextResponse.json({
      result: resultText
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ result: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
