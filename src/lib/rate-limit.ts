export class RateLimiter {
    private timestamps: Map<string, number[]>;
    private limit: number;
    private windowMs: number;

    constructor(limit: number = 5, windowMs: number = 60000) {
        this.timestamps = new Map();
        this.limit = limit;
        this.windowMs = windowMs;
    }

    check(identifier: string): { success: boolean; headers: Record<string, string> } {
        const now = Date.now();
        const userTimestamps = this.timestamps.get(identifier) || [];
        
        // Remove timestamps older than the window
        const validTimestamps = userTimestamps.filter((ts) => now - ts < this.windowMs);

        if (validTimestamps.length >= this.limit) {
            return {
                success: false,
                headers: {
                    'X-RateLimit-Limit': this.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': Math.ceil(this.windowMs / 1000).toString(),
                },
            };
        }

        validTimestamps.push(now);
        this.timestamps.set(identifier, validTimestamps);

        return {
            success: true,
            headers: {
                'X-RateLimit-Limit': this.limit.toString(),
                'X-RateLimit-Remaining': (this.limit - validTimestamps.length).toString(),
            },
        };
    }
}
