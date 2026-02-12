
import { NextResponse } from 'next/server';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req) {
    try {
        const { habitData, timeContext } = await req.json();



        const promptText = `
      You are an advanced, deeply compassionate, and data-driven wellness architect.
      Your goal is to build a "Reset My Life" plan for a user who is feeling stuck, overwhelmed, or in need of a fresh start.
      
      **INPUT DATA (Recent User Habits):**
      ${JSON.stringify(habitData)}
      
      **CONTEXT:**
      Current Time: ${timeContext}
      
      **YOUR TASK:**
      Analyze the input data to identify NEGATIVE patterns (e.g., low sleep, high screen time, negative moods) and POSITIVE sparks.
      Then, generate a "Soft Reset" plan that feels achievable, kind, and restorative. NOT a boot camp. A healing week.
      
      **OUTPUT REQUIREMENTS (Strict JSON):**
      Return a JSON object with this EXACT structure:
      {
        "analysis_summary": "A 1-2 sentence warm observation about their recent struggle (e.g., 'I notice you've been sleeping less than 5 hours lately...')",
        "stop_habits": [
          "Action 1 to pause (gentle phrasing, e.g., 'Pause doomscrolling after 10 PM')",
          "Action 2 to pause",
          "Action 3 to pause"
        ],
        "start_habits": [
          "Action 1 to begin (tiny, 2-minute actions, e.g., 'Drink one glass of water before coffee')",
          "Action 2 to begin",
          "Action 3 to begin"
        ],
        "daily_plan": [
          {
            "day": "Day 1",
            "theme": "Rest & Grounding",
            "action": "A very small physical action",
            "support": "A mental/emotional support tip",
            "affirmation": "A short, powerful affirmation"
          },
          ... (Repeat for Days 2-7)
        ],
        "closing_message": "A warm, encouraging final message reminding them that progress is non-linear."
      }
      
      **GUIDELINES:**
      1. **Personalization is KEY:** If they have low sleep, suggest sleep hygiene. If high stress, suggest breathing. Do NOT give generic advice if the data points elsewhere.
      2. **Tone:** Warm, safe, non-judgmental. Use words like "Nourish," "Gentle," "Pause," "Reclaim."
      3. **Realism:** The "Start" habits must be ridiculously small so they can't fail.
    `;

        const requestBody = {
            contents: [{
                parts: [{ text: promptText }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000,
                response_mime_type: "application/json"
            }
        };

        const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest"];
        let finalData = null;
        let lastError = null;

        for (const modelName of models) {
            try {


                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY4}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestBody)
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`ResetAPI: Model ${modelName} failed: ${response.status} - ${errorText}`);
                    if (response.status === 429) {
                        await delay(2000);
                        continue;
                    }
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) throw new Error("No text returned");

                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                finalData = JSON.parse(jsonStr);

                if (finalData.daily_plan && finalData.stop_habits) {
                    break;
                }

            } catch (e) {
                console.warn(`ResetAPI: Error with ${modelName}:`, e.message);
                lastError = e;
                await delay(1000);
            }
        }

        if (!finalData) {
            throw lastError || new Error("Failed to generate plan");
        }

        return NextResponse.json(finalData);

    } catch (error) {
        console.error("Reset Plan Error:", error);
        return NextResponse.json(
            { error: "Failed to generate reset plan", details: error.message },
            { status: 500 }
        );
    }
}
