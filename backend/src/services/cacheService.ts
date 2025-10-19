import Redis from 'ioredis';
import { env } from '../config/env';

class CacheService {
  private client: Redis | null = null;
  private isEnabled: boolean = false;

  public initialize(): void {
    try {
      // Only initialize if Redis URL is provided
      if (!env.REDIS_URL) {
        console.log('⚠️  Redis URL not provided, caching disabled');
        return;
      }

      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isEnabled = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        this.isEnabled = false;
      });

      this.client.on('close', () => {
        console.log('⚠️  Redis connection closed');
        this.isEnabled = false;
      });
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.isEnabled = false;
    }
  }

  // Get value from cache
  public async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set value in cache with optional TTL (in seconds)
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete key from cache
  public async del(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Delete multiple keys matching a pattern
  public async delPattern(pattern: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Check if key exists
  public async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Set expiration on key
  public async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  // Increment value
  public async incr(key: string): Promise<number | null> {
    if (!this.isEnabled || !this.client) return null;

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error);
      return null;
    }
  }

  // Clear all cache
  public async flushAll(): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // Check if caching is enabled
  public isActive(): boolean {
    return this.isEnabled;
  }

  // Get Redis client
  public getClient(): Redis | null {
    return this.client;
  }

  // Close connection
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isEnabled = false;
    }
  }
}

// Cache key generators for consistency
export const CacheKeys = {
  task: (id: string) => `task:${id}`,
  taskList: (userId: string, filters?: string) => `tasks:user:${userId}${filters ? `:${filters}` : ''}`,
  userTasks: (userId: string) => `tasks:user:${userId}:*`,
  comment: (id: string) => `comment:${id}`,
  taskComments: (taskId: string) => `comments:task:${taskId}`,
  analytics: (userId: string) => `analytics:user:${userId}`,
  userAnalytics: () => `analytics:user:*`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

// Export singleton instance
export const cacheService = new CacheService();
