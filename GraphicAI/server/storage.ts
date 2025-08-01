import { users, generations, type User, type InsertUser, type Generation, type InsertGeneration } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lt, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGenerationsByUserId(userId: number | null): Promise<Generation[]>;
  getRecentGenerations(userId: number | null, limit?: number): Promise<Generation[]>;
  getUserUsageCount(userId: number | null, month: number, year: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const [generation] = await db
      .insert(generations)
      .values(insertGeneration)
      .returning();
    return generation;
  }

  async getGenerationsByUserId(userId: number | null): Promise<Generation[]> {
    const results = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt));
    return results;
  }

  async getRecentGenerations(userId: number | null, limit: number = 5): Promise<Generation[]> {
    const results = await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt))
      .limit(limit);
    return results;
  }

  async getUserUsageCount(userId: number | null, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    
    const results = await db
      .select()
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          gte(generations.createdAt, startDate),
          lt(generations.createdAt, endDate)
        )
      );
    return results.length;
  }
}

export const storage = new DatabaseStorage();
