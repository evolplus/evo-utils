// index.ts

// Importing necessary components from cache module
import { Cache, LRUCache, DecayCache } from './cache';

// Importing queue implementation
import { Dequeue } from './queue';

// Importing rate limiter utilities from hitrate module
import { RateLimiter, TimeBasedLimiterConfig, TimeBasedLimiter, DecayLimiter } from './hitrate';

// Exporting all imported modules for external use
// Cache: Base interface for cache implementations
// LRUCache: Implementation of Least Recently Used (LRU) caching strategy
// DecayCache: Cache implementation with decay mechanism
// Dequeue: Double-ended queue implementation
// RateLimiter: Interface for rate limiting strategies
// TimeBasedLimiterConfig: Configuration type for time-based limiter
// TimeBasedLimiter: Implementation of a time-based rate limiter
// DecayLimiter: Implementation of a rate limiter with decay mechanism
export {
  Cache, 
  LRUCache, 
  DecayCache, 
  Dequeue, 
  RateLimiter, 
  TimeBasedLimiterConfig, 
  TimeBasedLimiter,
  DecayLimiter
};