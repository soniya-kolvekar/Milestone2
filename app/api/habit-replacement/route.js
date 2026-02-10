import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Use the key that is known to work in other modules, or fallback to the hardcoded one found in risk module
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyB9RQYngQsh7bOAGkqYty9oqWGJwIuciXU";
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

        // Use a model that is likely to exist. gemini-1.5-flash is good, but let's try gemini-pro or flash-latest if that fails.
        // Alignment with risk module: risk uses "gemini-flash-latest"
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

        // Clean markdown if present
        const cleanJson = text.replace(/```json|```/g, "").trim();

        const data = JSON.parse(cleanJson);

        return NextResponse.json(data);

    } catch (error) {
        console.error("Habit Replacement API Error:", error);

        // Fallback if API fails, but try to make it obvious it's a fallback or error
        return NextResponse.json(
            {
                replacement: "Unable to generate specific advice (AI Error)",
                plan: ["Check API Key", "Check Console Logs", "Try again later"],
                microSteps: ["Step 1", "Step 2", "Step 3"]
            },
            { status: 200 } // Return 200 so UI doesn't crash, but shows error info
        );
    }
}
