/**
 * Enhanced Vector Search Service for Ashval Content
 * รองรับการค้นหาแบบ semantic และ AI-powered content recommendations
 */

// Note: ChromaDB import will be available after installing enhanced dependencies
// import { ChromaClient, Collection } from 'chromadb';
import { notion } from './notion.js';

// Temporary interface for development
interface Collection {
  add: (data: any) => Promise<any>;
  query: (data: any) => Promise<any>;
}

interface ChromaClient {
  getOrCreateCollection: (config: any) => Promise<Collection>;
}

interface ContentVector {
  id: string;
  type: 'character' | 'scene' | 'location' | 'world_rule' | 'story_arc';
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

interface SearchResult {
  id: string;
  type: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export class VectorSearchService {
  private chroma: ChromaClient | null = null;
  private collections: Map<string, Collection> = new Map();
  private isInitialized = false;

  constructor() {
    // Initialize ChromaDB client only if the dependency is available
    try {
      // This will be available after running install-enhancements.sh
      // const { ChromaClient } = require('chromadb');
      // this.chroma = new ChromaClient({
      //   path: process.env.CHROMADB_URL || "http://localhost:8000"
      // });
      console.log('🔧 VectorSearchService: ChromaDB will be available after installing enhanced dependencies');
    } catch (error) {
      console.log('⚠️ ChromaDB not installed. Run ./scripts/install-enhancements.sh to enable vector search');
    }
  }

  /**
   * Initialize vector collections for different content types
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔧 Initializing Vector Search Service...');

      if (!this.chroma) {
        console.log('⚠️ ChromaDB not available. Vector search features will be disabled.');
        console.log('💡 Run ./scripts/install-enhancements.sh to enable vector search');
        this.isInitialized = true;
        return;
      }

      // Create collections for different content types
      const contentTypes = ['characters', 'scenes', 'locations', 'world_rules', 'story_arcs'];

      for (const type of contentTypes) {
        try {
          const collection = await this.chroma.getOrCreateCollection({
            name: `ashval_${type}`,
            metadata: { type, created: new Date().toISOString() }
          });
          this.collections.set(type, collection);
          console.log(`✅ Collection '${type}' initialized`);
        } catch (error) {
          console.error(`❌ Failed to initialize collection '${type}':`, error);
        }
      }

      this.isInitialized = true;
      console.log('🎉 Vector Search Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Vector Search Service:', error);
      throw error;
    }
  }

  /**
   * Index character data into vector database
   */
  async indexCharacter(characterData: any): Promise<void> {
    await this.ensureInitialized();

    const collection = this.collections.get('characters');
    if (!collection) throw new Error('Characters collection not found');

    const content = this.buildCharacterContent(characterData);
    const metadata = {
      id: characterData.id,
      name: characterData.properties?.Name?.title?.[0]?.text?.content || 'Unknown',
      type: 'character',
      indexed_at: new Date().toISOString()
    };

    try {
      await collection.add({
        documents: [content],
        metadatas: [metadata],
        ids: [characterData.id]
      });

      console.log(`✅ Indexed character: ${metadata.name}`);
    } catch (error) {
      console.error(`❌ Failed to index character ${metadata.name}:`, error);
      throw error;
    }
  }

  /**
   * Index scene data into vector database
   */
  async indexScene(sceneData: any): Promise<void> {
    await this.ensureInitialized();

    const collection = this.collections.get('scenes');
    if (!collection) throw new Error('Scenes collection not found');

    const content = this.buildSceneContent(sceneData);
    const metadata = {
      id: sceneData.id,
      title: sceneData.properties?.Title?.title?.[0]?.text?.content || 'Unknown Scene',
      type: 'scene',
      characters: sceneData.properties?.Characters?.multi_select?.map((c: any) => c.name) || [],
      location: sceneData.properties?.Location?.select?.name || null,
      indexed_at: new Date().toISOString()
    };

    try {
      await collection.add({
        documents: [content],
        metadatas: [metadata],
        ids: [sceneData.id]
      });

      console.log(`✅ Indexed scene: ${metadata.title}`);
    } catch (error) {
      console.error(`❌ Failed to index scene ${metadata.title}:`, error);
      throw error;
    }
  }

  /**
   * Semantic search across all content types
   */
  async semanticSearch(
    query: string, 
    contentTypes: string[] = ['characters', 'scenes', 'locations'],
    limit: number = 10
  ): Promise<SearchResult[]> {
    await this.ensureInitialized();

    if (!this.chroma) {
      // Return mock results when ChromaDB is not available
      return [{
        id: 'demo-result',
        type: 'info',
        content: 'Vector search พร้อมใช้งานหลังจากติดตั้ง enhanced dependencies',
        similarity: 1.0,
        metadata: {
          name: 'Vector Search Demo',
          message: 'รัน ./scripts/install-enhancements.sh เพื่อเปิดใช้งาน semantic search'
        }
      }];
    }

    const allResults: SearchResult[] = [];

    for (const type of contentTypes) {
      const collection = this.collections.get(type);
      if (!collection) continue;

      try {
        const results = await collection.query({
          queryTexts: [query],
          nResults: Math.ceil(limit / contentTypes.length)
        });

        // Process results
        if (results.documents && results.metadatas && results.distances) {
          for (let i = 0; i < results.documents[0].length; i++) {
            allResults.push({
              id: results.ids?.[0]?.[i] || '',
              type,
              content: results.documents[0][i],
              similarity: 1 - (results.distances[0][i] || 1), // Convert distance to similarity
              metadata: results.metadatas[0][i] as Record<string, any>
            });
          }
        }
      } catch (error) {
        console.error(`❌ Search failed for type ${type}:`, error);
      }
    }

    // Sort by similarity and return top results
    return allResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Find similar characters based on personality, traits, or description
   */
  async findSimilarCharacters(
    referenceCharacterId: string, 
    limit: number = 5
  ): Promise<SearchResult[]> {
    await this.ensureInitialized();

    // Get reference character content
    const characterData = await notion.pages.retrieve({ page_id: referenceCharacterId });
    const referenceContent = this.buildCharacterContent(characterData);

    return this.semanticSearch(referenceContent, ['characters'], limit + 1)
      .then(results => results.filter(r => r.id !== referenceCharacterId).slice(0, limit));
  }

  /**
   * Find scenes that might have continuity issues
   */
  async findPotentialPlotHoles(projectId?: string): Promise<SearchResult[]> {
    await this.ensureInitialized();

    const collection = this.collections.get('scenes');
    if (!collection) return [];

    // Look for scenes with similar content but different outcomes
    const inconsistencyQuery = "conflict resolution outcome different result contradiction";
    
    return this.semanticSearch(inconsistencyQuery, ['scenes'], 10);
  }

  /**
   * Get content recommendations based on current writing context
   */
  async getContentRecommendations(
    currentContent: string,
    contentType: 'character' | 'scene' | 'location' = 'scene'
  ): Promise<SearchResult[]> {
    await this.ensureInitialized();

    // Extract key themes and elements from current content
    const recommendations = await this.semanticSearch(
      currentContent, 
      [contentType === 'character' ? 'characters' : contentType === 'location' ? 'locations' : 'scenes'],
      5
    );

    return recommendations.filter(r => r.similarity > 0.7); // High similarity threshold
  }

  /**
   * Batch index all existing Notion content
   */
  async indexAllContent(): Promise<void> {
    await this.ensureInitialized();

    console.log('🔄 Starting batch indexing of all content...');

    try {
      // Index characters
      if (process.env.NOTION_CHARACTERS_DB_ID) {
        const characters = await notion.databases.query({
          database_id: process.env.NOTION_CHARACTERS_DB_ID
        });

        for (const character of characters.results) {
          await this.indexCharacter(character);
        }
        console.log(`✅ Indexed ${characters.results.length} characters`);
      }

      // Index scenes
      if (process.env.NOTION_SCENES_DB_ID) {
        const scenes = await notion.databases.query({
          database_id: process.env.NOTION_SCENES_DB_ID
        });

        for (const scene of scenes.results) {
          await this.indexScene(scene);
        }
        console.log(`✅ Indexed ${scenes.results.length} scenes`);
      }

      console.log('🎉 Batch indexing completed successfully');
    } catch (error) {
      console.error('❌ Batch indexing failed:', error);
      throw error;
    }
  }

  /**
   * Health check for vector service
   */
  async healthCheck(): Promise<{ status: string; collections: string[]; error?: string }> {
    try {
      await this.ensureInitialized();
      
      const collectionsStatus = Array.from(this.collections.keys());
      
      return {
        status: 'healthy',
        collections: collectionsStatus
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        collections: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private buildCharacterContent(characterData: any): string {
    const props = characterData.properties || {};
    
    const parts = [
      props.Name?.title?.[0]?.text?.content || '',
      props.Description?.rich_text?.map((t: any) => t.text?.content).join(' ') || '',
      props.Personality?.rich_text?.map((t: any) => t.text?.content).join(' ') || '',
      props.Background?.rich_text?.map((t: any) => t.text?.content).join(' ') || '',
      props.Abilities?.rich_text?.map((t: any) => t.text?.content).join(' ') || '',
      props.Role?.select?.name || '',
      props.Faction?.select?.name || ''
    ].filter(Boolean);

    return parts.join(' ');
  }

  private buildSceneContent(sceneData: any): string {
    const props = sceneData.properties || {};
    
    const parts = [
      props.Title?.title?.[0]?.text?.content || '',
      props.Description?.rich_text?.map((t: any) => t.text?.content).join(' ') || '',
      props.Summary?.rich_text?.map((t: any) => t.text?.content).join(' ') || '',
      props.Location?.select?.name || '',
      props.Characters?.multi_select?.map((c: any) => c.name).join(' ') || '',
      props.Mood?.select?.name || '',
      props.Type?.select?.name || ''
    ].filter(Boolean);

    return parts.join(' ');
  }
}

// Export singleton instance
export const vectorSearchService = new VectorSearchService();