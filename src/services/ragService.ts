import { ChromaClient } from "chromadb";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let vectorStore: Chroma | null = null;

export async function initializeRAG() {
  console.log("🚀 Initializing RAG service...");

  const vaultPath = path.resolve(__dirname, "../../../ROF");
  console.log(`📂 Loading documents from: ${vaultPath}`);

  const loader = new DirectoryLoader(
    vaultPath,
    {
      ".md": (path: string) => new TextLoader(path),
    },
    true,
    undefined
  );

  try {
    const docs = await loader.load();
    console.log(`📚 Loaded ${docs.length} documents.`);

    if (docs.length === 0) {
      console.warn("⚠️ No documents found in the ROF vault. RAG will be inactive.");
      return;
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`✂️ Split into ${splitDocs.length} chunks.`);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "embedding-001",
    });

    console.log("🧠 Creating vector store with ChromaDB...");
    vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
      collectionName: "ashval-rof-vault",
    });

    console.log("✅ RAG service initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize RAG service:", error);
  }
} // Closing bracket for initializeRAG

export async function queryRAG(query: string): Promise<any[]> {
  if (!vectorStore) {
    console.warn("RAG service not initialized. Attempting to initialize now...");
    await initializeRAG();
    if (!vectorStore) {
      console.error("Failed to initialize RAG on the fly. Returning empty results.");
      return [];
    }
  }

  const k = 5;
  let results: any[] = [];
  if (typeof (vectorStore as any).similaritySearch === "function") {
    results = await (vectorStore as any).similaritySearch(query, k);
  } else if (typeof (vectorStore as any).similaritySearchVectorWithScore === "function") {
    results = await (vectorStore as any).similaritySearchVectorWithScore(query, k);
  } else {
    console.error("No similarity search method found on vectorStore.");
    return [];
  }
  console.log(`✨ Found ${results.length} relevant documents.`);
  return results;
}
