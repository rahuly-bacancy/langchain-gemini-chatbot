# Fitness & Health RAG Chatbot

A **Retrieval-Augmented Generation (RAG) chatbot** built using **Node.js, Express.js, LangChain, Google Gemini, and ChromaDB**.

The chatbot answers fitness, workout, nutrition, and health-related questions using information stored in a custom Markdown knowledge base.

Instead of sending the user's question directly to the LLM, the application first searches the knowledge base for relevant information and then provides that information to Gemini to generate a contextual answer.

---

## Features

* RAG-based question answering
* Custom Markdown knowledge base
* Automatic document loading
* Document chunking
* Gemini embeddings
* ChromaDB vector storage
* Semantic document retrieval
* Google Gemini response generation
* Conversation memory using session IDs
* Configurable Gemini parameters:

  * Temperature
  * Max Output Tokens
  * Top P
  * Top K
* Source information returned with answers
* Clear conversation memory
* Simple responsive chatbot UI
* REST API using Express.js

---

## Architecture

```text
                    Markdown Knowledge Base
                              |
                              v
                       Document Loader
                              |
                              v
                         Text Splitter
                              |
                              v
                      Gemini Embeddings
                              |
                              v
                         ChromaDB
                      knowledge_base
                              |
                              |
                              | Retrieval
                              ^
                              |
User ---> Express API ---> Question Embedding
                              |
                              v
                       ChromaDB Search
                              |
                              v
                       Relevant Documents
                              |
                              v
                    Gemini 2.5 Flash
                              |
                              v
                   Final Answer + Sources
```

---

## How RAG Works

RAG stands for:

**Retrieval-Augmented Generation**

Instead of:

```text
User Question
      |
      v
    Gemini
      |
      v
    Answer
```

this project uses:

```text
User Question
      |
      v
Question Embedding
      |
      v
ChromaDB Search
      |
      v
Relevant Knowledge
      |
      v
Gemini
      |
      v
Final Answer
```

This allows the chatbot to use information from our own knowledge base when generating answers.

---

## Technology Stack

| Technology        | Purpose                       |
| ----------------- | ----------------------------- |
| Node.js           | Backend runtime               |
| Express.js        | REST API                      |
| LangChain         | LLM and embedding integration |
| Google Gemini     | AI response generation        |
| Gemini Embeddings | Convert text into vectors     |
| ChromaDB          | Vector database               |
| JavaScript        | Application logic             |
| HTML/CSS          | Chatbot interface             |
| Markdown          | Knowledge base                |

---

## Project Structure

```text
langchain-gemini-chatbot/
│
├── knowledge/
│   ├── workouts/
│   ├── nutrition/
│   ├── fitness/
│   └── health/
│
├── chroma_data/
│
├── src/
│   ├── server.js
│   ├── ingest.js
│   ├── embeddings.js
│   ├── rag.js
│   └── test-retrieval.js
│
├── public/
│   └── index.html
│
├── .env
├── package.json
└── package-lock.json
```

---

# Knowledge Base

The `knowledge` directory contains the information used by the RAG system.

Example:

```text
knowledge/
├── workouts/
│   ├── beginner-full-body.md
│   └── ...
│
├── fitness/
│   ├── warmup.md
│   ├── recovery.md
│   └── ...
│
├── nutrition/
│   └── ...
│
└── health/
    └── ...
```

Currently, the project contains:

```text
9 Markdown documents
```

You can add additional `.md` files to these directories.

For example:

```text
knowledge/nutrition/protein.md
```

After adding new documents, run the ingestion process again.

---

# Installation

## 1. Clone or create the project

```bash
git clone <repository-url>
cd langchain-gemini-chatbot
```

Or open the existing project directory.

---

## 2. Install dependencies

Install the required packages:

```bash
npm install
```

The project uses packages including:

```text
express
dotenv
chromadb
@langchain/google-genai
@langchain/textsplitters
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
GOOGLE_API_KEY=your_google_ai_studio_api_key
```

Replace:

```text
your_google_ai_studio_api_key
```

with your actual Google AI Studio API key.

Do not commit `.env` to Git.

Add this to `.gitignore`:

```text
.env
node_modules/
chroma_data/
```

---

# Start ChromaDB

The application uses ChromaDB as the vector database.

From the project root, run:

```bash
chroma run --path ./chroma_data
```

Chroma should start on:

```text
http://localhost:8000
```

Keep this terminal running.

---

# Ingest Knowledge Base

Open another terminal.

From the project root:

```bash
node src/ingest.js
```

The ingestion process performs the following steps:

```text
Markdown Files
      |
      v
Load Documents
      |
      v
Split into Chunks
      |
      v
Generate Gemini Embeddings
      |
      v
Store in ChromaDB
```

Expected output:

```text
Documents loaded: 9
Chunks created: 9
Connected to Chroma
Collection ready: knowledge_base
Generating embeddings...
Embeddings generated: 9
Storing chunks in Chroma...
Successfully stored chunks in Chroma.
```

The Chroma collection created by the application is:

```text
knowledge_base
```

---

# Run the Retrieval Test

Before starting the chatbot, you can test whether ChromaDB can retrieve relevant information.

Run:

```bash
node src/test-retrieval.js
```

The test asks a question such as:

```text
What should I do before starting a workout?
```

The application generates an embedding for the question and searches ChromaDB.

Example result:

```text
Question:
What should I do before starting a workout?

--- Result 1 ---
Source: fitness/warmup.md

Content:
...

--- Result 2 ---
Source: workouts/beginner-full-body.md

Content:
...
```

This confirms that the retrieval portion of the RAG pipeline is working.

---

# Start the Chatbot

Start the Express server:

```bash
node src/server.js
```

Expected output:

```text
Server running on http://localhost:3000
```

Open the application in your browser:

```text
http://localhost:3000
```

---

# Chat API

The chatbot exposes the following API:

```text
POST /api/chat
```

Example request:

```json
{
  "question": "What are the benefits of warmup?",
  "sessionId": "abc123",
  "memory": true,
  "temperature": 0.7,
  "maxTokens": 500,
  "topP": 0.95,
  "topK": 40
}
```

Example response:

```json
{
  "answer": "A warm-up helps prepare your body for exercise...",
  "sources": [
    "fitness/warmup.md",
    "workouts/beginner-full-body.md"
  ],
  "sessionId": "abc123",
  "memory": true,
  "settings": {
    "temperature": 0.7,
    "maxTokens": 500,
    "topP": 0.95,
    "topK": 40
  }
}
```

---

# Conversation Memory

The chatbot supports conversation memory.

Each conversation is associated with a:

```text
sessionId
```

For example:

```text
sessionId = abc123
```

A conversation might look like:

```text
User:
What are the benefits of warmup?

Bot:
Warm-up prepares the body for exercise...

User:
How long should I do it?

Bot:
For the warm-up we discussed...
```

The previous messages are passed to the RAG system so Gemini can understand follow-up questions.

---

# Clear Conversation Memory

The application provides:

```text
POST /api/chat/clear-memory
```

Example request:

```json
{
  "sessionId": "abc123"
}
```

This clears the conversation history for that session.

It does **not** delete the ChromaDB knowledge base.

---

# Gemini Configuration

The chatbot allows the following Gemini settings to be configured.

## Temperature

```text
0.0 - 1.0
```

Controls how predictable or creative the response is.

Example:

```text
Temperature = 0.2
```

Generally produces more consistent responses.

```text
Temperature = 0.8
```

Allows more variation.

---

## Max Output Tokens

Controls the maximum length of the generated answer.

Example:

```text
maxTokens = 500
```

---

## Top P

Controls the range of candidate tokens considered during generation.

Example:

```text
topP = 0.95
```

---

## Top K

Controls how many candidate tokens are considered.

Example:

```text
topK = 40
```

---

# RAG Pipeline in Detail

The complete RAG process consists of two major phases.

## Phase 1 — Ingestion

This happens when we run:

```bash
node src/ingest.js
```

### Step 1

Load Markdown files:

```text
knowledge/**/*.md
```

### Step 2

Split documents into smaller chunks.

### Step 3

Generate embeddings using:

```text
gemini-embedding-001
```

### Step 4

Store the following in ChromaDB:

```text
Chunk ID
Embedding
Document content
Source metadata
```

---

# Phase 2 — Question Answering

When the user asks a question:

```text
What are the benefits of warmup?
```

### Step 1

The question is converted into an embedding.

### Step 2

The embedding is sent to ChromaDB.

### Step 3

ChromaDB finds the most relevant documents.

Currently, the application retrieves:

```text
Top 3 results
```

### Step 4

The retrieved documents become the RAG context.

### Step 5

Conversation history is added.

### Step 6

The question, context, and conversation history are sent to Gemini.

### Step 7

Gemini generates the final answer.

### Step 8

The API returns:

```text
Answer
Sources
Session ID
Memory status
Generation settings
```

---

# Important Files

## `src/embeddings.js`

Responsible for configuring Gemini embeddings.

```text
gemini-embedding-001
```

---

## `src/ingest.js`

Responsible for:

* Finding Markdown files
* Loading documents
* Splitting documents
* Generating embeddings
* Storing vectors in ChromaDB

---

## `src/rag.js`

Contains the main RAG logic.

Responsible for:

* Receiving the question
* Generating the question embedding
* Searching ChromaDB
* Building the context
* Including conversation history
* Calling Gemini
* Returning the answer and sources

---

## `src/server.js`

Responsible for:

* Express server
* `/api/chat`
* `/api/chat/clear-memory`
* Conversation sessions
* Gemini settings
* Serving the frontend

---

## `src/test-retrieval.js`

Used to test ChromaDB retrieval independently from the chatbot API.

---

## `public/index.html`

Contains the chatbot user interface.

It provides:

* Chat messages
* User input
* Send button
* Sources
* Memory controls
* Gemini settings
* Clear memory functionality
* Responsive layout

---

# Current Configuration

The current default Gemini settings are:

```json
{
  "temperature": 0.7,
  "maxTokens": 500,
  "topP": 0.95,
  "topK": 40
}
```

The RAG system currently retrieves:

```text
Top 3 documents
```

from:

```text
knowledge_base
```

---

# Running the Complete Application

You need two terminals.

## Terminal 1 — ChromaDB

```bash
chroma run --path ./chroma_data
```

Keep this running.

## Terminal 2 — Node.js

```bash
node src/server.js
```

Then open:

```text
http://localhost:3000
```

If the knowledge base has changed, run ingestion before starting/testing the chatbot:

```bash
node src/ingest.js
```

---

# Example Questions

You can ask questions such as:

```text
What should I do before starting a workout?
```

```text
What are the benefits of warmup?
```

```text
Do I need to perform lighter warmup sets?
```

```text
What should I do after a workout?
```

```text
How can I improve my recovery?
```

The chatbot will retrieve relevant information from the knowledge base and use it to generate the response.

---

# Error Handling

The application validates that a question is provided.

If no question is supplied:

```json
{
  "error": "Question is required."
}
```

If the chatbot encounters an internal error:

```json
{
  "error": "Failed to generate answer."
}
```

The server also logs important information such as:

```text
User question
Memory status
Temperature
Max Tokens
Top P
Top K
Number of previous messages
Retrieved sources
```

---

# Important Notes

### ChromaDB must be running

The Node.js application expects ChromaDB at:

```text
localhost:8000
```

If ChromaDB is not running, the application cannot retrieve the knowledge base.

### Knowledge base must be ingested

After adding or changing Markdown documents, run:

```bash
node src/ingest.js
```

### Gemini API key is required

The `.env` file must contain a valid:

```text
GOOGLE_API_KEY
```

### This is a knowledge-based chatbot

The chatbot should use the retrieved knowledge base when answering questions related to the stored information.

If the knowledge base does not contain enough information, the prompt instructs Gemini to clearly indicate that instead of making up information.

---

# Future Improvements

Possible next improvements include:

* Streaming Gemini responses
* Better conversation-memory management
* Persistent conversation storage using MongoDB/Redis
* Authentication
* User-specific conversations
* Better source citations
* PDF/document ingestion
* Support for DOCX files
* More advanced metadata filtering
* Reranking retrieved documents
* Hybrid search
* Conversation title/history
* Feedback system for answers
* Production deployment
* Docker-based deployment
* Automated knowledge-base ingestion
* Admin interface for managing documents

---

# Project Summary

This project demonstrates how to build a practical RAG application using modern GenAI technologies.

The overall system is:

```text
Custom Knowledge
      +
Embeddings
      +
Vector Database
      +
Retrieval
      +
Gemini
      +
Conversation Memory
      =
RAG Chatbot
```

The main goal is to demonstrate how an LLM can be combined with a custom knowledge base to create a more contextual and useful AI application.
