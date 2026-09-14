import "dotenv/config";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { askQuestion } from "./rag.js";

const app = express();

const PORT = 3000;

// --------------------------------
// ESM __dirname
// --------------------------------

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

// --------------------------------
// Middleware
// --------------------------------

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "../public")
  )
);

// --------------------------------
// Conversation Memory
// --------------------------------
//
// Memory is stored in Node.js memory.
//
// sessionId -> messages
//
// Example:
//
// abc123 -> [
//   { role: "user", content: "..." },
//   { role: "assistant", content: "..." }
// ]
//

const conversations = new Map();

// --------------------------------
// Default settings
// --------------------------------

const DEFAULT_SETTINGS = {
  temperature: 0.7,
  maxTokens: 500,
  topP: 0.95,
  topK: 40
};

// --------------------------------
// POST /api/chat
// --------------------------------

app.post("/api/chat", async (req, res) => {
  try {
    const {
      question,
      sessionId = "default",
      memory = true,
      temperature = DEFAULT_SETTINGS.temperature,
      maxTokens = DEFAULT_SETTINGS.maxTokens,
      topP = DEFAULT_SETTINGS.topP,
      topK = DEFAULT_SETTINGS.topK
    } = req.body;

    // --------------------------------
    // Validate question
    // --------------------------------

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        error: "Question is required."
      });
    }

    const cleanQuestion =
      question.trim();

    // --------------------------------
    // Get conversation history
    // --------------------------------

    let history = [];

    if (memory) {
      history =
        conversations.get(sessionId) || [];
    }

    // --------------------------------
    // Log request
    // --------------------------------

    console.log(
      "\n=============================="
    );

    console.log(
      "User:",
      cleanQuestion
    );

    console.log(
      "Memory:",
      memory
    );

    console.log(
      "Temperature:",
      temperature
    );

    console.log(
      "Max Tokens:",
      maxTokens
    );

    console.log(
      "Top P:",
      topP
    );

    console.log(
      "Top K:",
      topK
    );

    console.log(
      "Previous messages:",
      history.length
    );

    // --------------------------------
    // Run RAG
    // --------------------------------

    const result =
      await askQuestion(
        cleanQuestion,
        history,
        {
          temperature,
          maxTokens,
          topP,
          topK
        }
      );

    // --------------------------------
    // Update memory
    // --------------------------------

    if (memory) {
      const updatedHistory = [
        ...history,

        {
          role: "user",
          content: cleanQuestion
        },

        {
          role: "assistant",
          content: result.answer
        }
      ];

      conversations.set(
        sessionId,
        updatedHistory
      );
    }

    // --------------------------------
    // Log response
    // --------------------------------

    console.log(
      "Sources:",
      result.sources
    );

    console.log(
      "=============================="
    );

    // --------------------------------
    // Return response
    // --------------------------------

    res.json({
      answer: result.answer,

      sources: result.sources,

      sessionId,

      memory,

      settings: {
        temperature,
        maxTokens,
        topP,
        topK
      }
    });

  } catch (error) {
    console.error(
      "Chat API error:",
      error
    );

    res.status(500).json({
      error:
        "Failed to generate answer."
    });
  }
});

// --------------------------------
// Clear conversation memory
// --------------------------------

app.post(
  "/api/chat/clear-memory",
  (req, res) => {
    const {
      sessionId = "default"
    } = req.body;

    conversations.delete(
      sessionId
    );

    res.json({
      message:
        "Conversation memory cleared.",
      sessionId
    });
  }
);

// --------------------------------
// Start server
// --------------------------------

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);
