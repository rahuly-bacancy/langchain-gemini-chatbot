import "dotenv/config";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChromaClient } from "chromadb";

import { embeddings } from "./embeddings.js";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false
});

export async function askQuestion(
  question,
  history = [],
  options = {}
) {
  // --------------------------------
  // Gemini settings
  // --------------------------------

  const temperature =
    options.temperature ?? 0.7;

  const maxTokens =
    options.maxTokens ?? 500;

  const topP =
    options.topP ?? 0.95;

  const topK =
    options.topK ?? 40;

  // --------------------------------
  // Create Gemini model
  // --------------------------------

  const model =
    new ChatGoogleGenerativeAI({
      model: "gemini-3.6-flash",

      temperature,

      maxOutputTokens:
        maxTokens,

      topP,

      topK
    });

  // --------------------------------
  // 1. Connect to Chroma
  // --------------------------------

  const collection =
    await chroma.getCollection({
      name: "knowledge_base"
    });

  // --------------------------------
  // 2. Convert question to embedding
  // --------------------------------

  const queryVector =
    await embeddings.embedQuery(question);

  // --------------------------------
  // 3. Search Chroma
  // --------------------------------

  const results =
    await collection.query({
      queryEmbeddings: [queryVector],
      nResults: 3
    });

  // --------------------------------
  // 4. Get retrieved documents
  // --------------------------------

  const documents =
    results.documents?.[0] || [];

  const metadatas =
    results.metadatas?.[0] || [];

  // --------------------------------
  // 5. Build RAG context
  // --------------------------------

  const context = documents
    .map((document, index) => {
      const source =
        metadatas[index]?.source ||
        "unknown";

      return `
Source: ${source}

${document}
`;
    })
    .join("\n---\n");

  // --------------------------------
  // 6. Build conversation history
  // --------------------------------

  const conversationHistory =
    history
      .map((message) => {
        return `${message.role}: ${message.content}`;
      })
      .join("\n");

  // --------------------------------
  // 7. Create prompt
  // --------------------------------

  const prompt = `
You are a helpful AI assistant.

You have access to a knowledge base.

IMPORTANT RULES:

1. Use the provided knowledge base context
   when answering questions related to it.

2. Do not make up information.

3. If the knowledge base does not contain
   enough information, clearly say that.

4. Conversation history can be used to
   understand follow-up questions.

5. Answer naturally and clearly.

Knowledge Base Context:
${context}

Conversation History:
${conversationHistory || "No previous conversation."}

Current User Question:
${question}
`;

  // --------------------------------
  // 8. Send to Gemini
  // --------------------------------

  const response =
    await model.invoke(prompt);

  // --------------------------------
  // 9. Return result
  // --------------------------------

  return {
    answer: response.content,
    sources: metadatas.map(
      (metadata) =>
        metadata?.source || "unknown"
    )
  };
}

