import "dotenv/config";
import fs from "fs/promises";
import path from "path";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChromaClient } from "chromadb";

import { embeddings } from "./embeddings.js";

const KNOWLEDGE_DIR = path.join(
  process.cwd(),
  "knowledge"
);

// ------------------------------------
// Get all Markdown files recursively
// ------------------------------------
async function getMarkdownFiles(directory) {
  const entries = await fs.readdir(directory, {
    withFileTypes: true
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      files.push(
        ...(await getMarkdownFiles(fullPath))
      );
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// ------------------------------------
// Load Markdown files
// ------------------------------------
async function loadMarkdownFiles() {
  const files = await getMarkdownFiles(
    KNOWLEDGE_DIR
  );

  const documents = [];

  for (const file of files) {
    const content = await fs.readFile(
      file,
      "utf-8"
    );

    documents.push({
      pageContent: content,
      metadata: {
        source: path.relative(
          KNOWLEDGE_DIR,
          file
        )
      }
    });
  }

  return documents;
}

// ------------------------------------
// Text splitter
// ------------------------------------
const splitter =
  new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });

// ------------------------------------
// Main ingestion process
// ------------------------------------
async function main() {
  // Step 3: Load Markdown files
  const documents =
    await loadMarkdownFiles();

  console.log(
    "Documents loaded:",
    documents.length
  );

  // Step 4: Split documents into chunks
  const chunks =
    await splitter.splitDocuments(
      documents
    );

  console.log(
    "Chunks created:",
    chunks.length
  );

  // Step 5: Connect to Chroma
  const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false
  });

  console.log("Connected to Chroma");

  // ------------------------------------
  // Create / get Chroma collection
  // ------------------------------------
  const collection =
    await chroma.getOrCreateCollection({
      name: "knowledge_base"
    });

  console.log(
    "Collection ready: knowledge_base"
  );

  // ------------------------------------
  // Generate Gemini embeddings
  // ------------------------------------
  console.log(
    "Generating embeddings..."
  );

  const texts = chunks.map(
    (chunk) => chunk.pageContent
  );

  const vectors =
    await embeddings.embedDocuments(
      texts
    );

  console.log(
    "Embeddings generated:",
    vectors.length
  );

  // ------------------------------------
  // Prepare Chroma records
  // ------------------------------------

  const ids = chunks.map(
    (_, index) => `chunk-${index}`
  );

  // Chroma metadata values must be
  // primitive values. LangChain may add
  // nested metadata such as "loc", so
  // only store the source here.
  const metadatas = chunks.map(
    (chunk) => ({
      source: String(
        chunk.metadata?.source || ""
      )
    })
  );

  // ------------------------------------
  // Store chunks in Chroma
  // ------------------------------------
  console.log(
    "Storing chunks in Chroma..."
  );

  await collection.add({
    ids,
    embeddings: vectors,
    documents: texts,
    metadatas
  });

  console.log(
    "Successfully stored chunks in Chroma."
  );
}

// ------------------------------------
// Handle errors
// ------------------------------------
main().catch((error) => {
  console.error(
    "Ingestion failed:",
    error
  );

  process.exit(1);
});