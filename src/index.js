import "dotenv/config";
import { ChatGoogle } from "@langchain/google";

const llm = new ChatGoogle({
  model: "gemini-3.6-flash",
});

const response = await llm.invoke(
  "What is LangChain? Explain in simple terms."
);

console.log(response.text);