import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
const apiKey = process.env.GEMINI_API_KEY3 || "AIzaSyB9RQYngQsh7bOAGkqYty9oqWGJwIuciXU";
const genAI = new GoogleGenerativeAI(apiKey);
export async function POST(req) {
  try {
    const { activity } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Analyze risk of: ${activity}. Return ONLY JSON: {"riskLevel": "Low/Med/High", "shortTerm": [], "longTerm": [], "healthScore": 0-100}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Gemini Error:", error.message);
    return NextResponse.json({
      riskLevel: "Unknown",
      shortTerm: ["Check API Key in .env.local"],
      longTerm: ["Restart npm run dev"],
      healthScore: 50
    });
  }
}