import redis

redis_webpush = redis.Redis.from_url('redis://localhost:6379')