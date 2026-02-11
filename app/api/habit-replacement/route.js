import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY3;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req) {
    try {
        const { habit } = await req.json();

        if (!habit) {
            return NextResponse.json(
                { error: "Habit is required" },
                { status: 400 }
            );
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are a habit replacement expert.
      For the negative habit: "${habit}", suggest:
      1. An easy replacement habit.
      2. A gradual improvement plan (3 distinct steps).
      3. 3 daily micro-steps to get started.

      Return ONLY valid JSON in this format:
      {
        "replacement": "Short description of replacement habit",
        "plan": ["Step 1 description", "Step 2 description", "Step 3 description"],
        "microSteps": ["Micro-step 1", "Micro-step 2", "Micro-step 3"]
      }
    `;

        console.log("Generating content for habit:", habit);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response:", text);


        const cleanJson = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(cleanJson);

        return NextResponse.json(data);

    } catch (error) {
        console.error("Habit Replacement API Error:", error);


        return NextResponse.json(
            {
                replacement: "Unable to generate specific advice (AI Error)",
                plan: ["Check API Key", "Check Console Logs", "Try again later"],
                microSteps: ["Step 1", "Step 2", "Step 3"]
            },
            { status: 200 }
        );
    }
}
