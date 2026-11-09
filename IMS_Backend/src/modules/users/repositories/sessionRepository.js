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

  _userIndexKey(userId) {
    return `${PREFIX}user:${userId}`;
  }

  async _getUserSessionIds(userId) {
    const stored = await redis.get(this._userIndexKey(userId));
    if (!stored) return [];
    try {
      const ids = JSON.parse(stored);
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  }

  /**
   * Save session data
   * We store the permissions array HERE to avoid hitting Postgres on every request
   */
  async create(sessionId, data) {
    const key = this._key(sessionId);
    // Redis stores strings, so we JSON.stringify complex objects
    await redis.set(key, JSON.stringify(data), 'EX', SESSION_TTL);
    const userId = data.userId || data.user_id;
    if (userId) {
      const sessionIds = await this._getUserSessionIds(userId);
      if (!sessionIds.includes(sessionId)) sessionIds.push(sessionId);
      await redis.set(this._userIndexKey(userId), JSON.stringify(sessionIds), 'EX', SESSION_TTL);
    }
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
    const session = await this.findById(sessionId);
    await redis.del(key);
    const userId = session?.userId || session?.user_id;
    if (userId) {
      const sessionIds = (await this._getUserSessionIds(userId)).filter((id) => id !== sessionId);
      if (sessionIds.length) {
        await redis.set(this._userIndexKey(userId), JSON.stringify(sessionIds), 'EX', SESSION_TTL);
      } else {
        await redis.del(this._userIndexKey(userId));
      }
    }
  }

  async deleteUserSessions(userId) {
    const sessionIds = await this._getUserSessionIds(userId);
    await Promise.all(sessionIds.map((sessionId) => redis.del(this._key(sessionId))));
    await redis.del(this._userIndexKey(userId));
    return sessionIds.length;
  }
}

export default new SessionRepository();
