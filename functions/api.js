import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import serverless from "serverless-http"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log("User asked:", userMessage);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are Manastava, an intelligent and helpful AI Doctor Robot. Provide short, concise, and helpful answers in English."
                },
                {
                    role: "user",
                    content: userMessage,
                },
            ],
            model: "llama-3.3-70b-versatile", 
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Sorry, I could not understand.";
        res.json({ reply: reply });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "Server Error" });
    }
});
app.use("/.netlify/functions/api", router);
export const handler = serverless(app);