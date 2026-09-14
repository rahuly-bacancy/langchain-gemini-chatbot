import "dotenv/config";

import { ChromaClient } from "chromadb";
import { embeddings } from "./embeddings.js";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false
});

async function main() {
  // Connect to existing collection
  const collection =
    await chroma.getCollection({
      name: "knowledge_base"
    });

  console.log("Connected to knowledge_base");

  // Test question
  const question =
    "What should I do before starting a workout?";

  console.log("\nQuestion:");
  console.log(question);

  // Convert question into embedding
  const queryVector =
    await embeddings.embedQuery(question);

  console.log("\nQuery embedding generated.");

  // Search Chroma
  const results =
    await collection.query({
      queryEmbeddings: [queryVector],
      nResults: 3
    });

  console.log("\nSearch results:");

  for (let i = 0; i < results.documents[0].length; i++) {
    console.log(`\n--- Result ${i + 1} ---`);

    console.log(
      "Source:",
      results.metadatas[0][i]?.source
    );

    console.log(
      "Content:",
      results.documents[0][i]
    );

    console.log(
      "Distance:",
      results.distances?.[0]?.[i]
    );
  }
}

main().catch((error) => {
  console.error(
    "Retrieval test failed:",
    error
  );

  process.exit(1);
});