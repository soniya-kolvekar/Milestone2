
import { NextResponse } from 'next/server';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
    try {
        const { habitData, promptContext } = await req.json();

        console.log("Analyzing habit data:", JSON.stringify(habitData));

        const promptText = `
      You are a compassionate, human-centered wellness companion. 
      Analyze the following daily habit data and context:
      ${JSON.stringify(habitData)}
      
      Additional Context: ${promptContext || 'None'}

      Please provide:
      1. A short, supportive insight (approx 2 sentences).
      2. A gentle, actionable suggestion (e.g., breathing, hydration, short walk).
      3. A Life Balance Score (0-100) based on sleep, screen time, productivity, activity, and mood.
      
      Return ONLY the response in strict JSON format without any markdown formatting or code blocks.
      Example format:
      {
        "insight": "Your insight here",
        "suggestion": "Your suggestion here",
        "score": 85
      }
    `;

        const requestBody = {
            contents: [{
                parts: [{ text: promptText }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2500, // Increased to prevent truncation
                // responseMimeType: "application/json" // Removed to avoid potential conflicts
            }
        };

        // Fallback Strategy
        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];
        let finalData = null;
        let lastError = null;

        for (const modelName of models) {
            try {
                console.log(`API: Trying model ${modelName}...`);

                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY2}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`API: Model ${modelName} failed with status ${response.status}: ${errorText}`);
                    if (response.status === 429) {
                        // Rate limited
                        await delay(2000); // Backoff
                        continue;
                    } else if (response.status === 404) {
                        // Model not found
                        continue;
                    }
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) {
                    console.warn(`API: Model ${modelName} returned no text.`);
                    throw new Error("No text content in response");
                }

                console.log(`API: Model ${modelName} responded. Parsing JSON...`);

                // Clean markdown if present
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                try {
                    finalData = JSON.parse(jsonStr);
                } catch (parseError) {
                    console.warn(`API: Model ${modelName} JSON parse failed:`, parseError);
                    console.warn(`API: Invalid JSON string:`, jsonStr);
                    throw new Error("Invalid JSON received");
                }

                if (finalData.insight && finalData.score !== undefined) {
                    console.log(`API: Success with ${modelName}`);
                    break; // Success, exit loop
                } else {
                    console.warn(`API: Model ${modelName} returned incomplete data:`, finalData);
                    throw new Error("Incomplete data received");
                }

            } catch (e) {
                console.warn(`API: Model ${modelName} loop error:`, e.message);
                lastError = e;
                await delay(1000);
            }
        }

        if (!finalData) {
            console.error("API: All models failed. Last error:", lastError);
            throw lastError || new Error("All models failed");
        }

        return NextResponse.json(finalData);

    } catch (error) {
        console.error("Habit Analysis Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze habits", details: error.message },
            { status: 500 }
        );
    }
}
