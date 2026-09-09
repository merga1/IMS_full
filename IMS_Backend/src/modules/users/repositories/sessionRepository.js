import redis from '../../../config/redis.js';

// Key prefix to avoid collisions
const PREFIX = 'session:';
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

class SessionRepository {
  /**
   * Format key
   */
  _key(sessionId) {
    return `${PREFIX}${sessionId}`;
  }

  /**
   * Save session data
   * We store the permissions array HERE to avoid hitting Postgres on every request
   */
  async create(sessionId, data) {
    const key = this._key(sessionId);
    // Redis stores strings, so we JSON.stringify complex objects
    await redis.set(key, JSON.stringify(data), 'EX', SESSION_TTL);
    return data;
  }

  /**
   * Get session
   */
  async findById(sessionId) {
    const key = this._key(sessionId);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Update session (e.g. for rotation or last activity)
   * This resets the TTL (keeps session alive)
   */
  async update(sessionId, updates) {
    const current = await this.findById(sessionId);
    if (!current) return null;

    const updatedData = { ...current, ...updates };
    await this.create(sessionId, updatedData); // Overwrite with new data & reset TTL
    return updatedData;
  }

  /**
   * Delete session (Logout / Blacklist)
   */
  async delete(sessionId) {
    const key = this._key(sessionId);
    await redis.del(key);
  }
}

export default new SessionRepository();