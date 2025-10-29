const globalForSessions = globalThis as unknown as {
  sessions?: Map<string, string>;
};

export const sessions =
  globalForSessions.sessions ||
  (globalForSessions.sessions = new Map<string, string>());

export function createSession(token: string, sessionId: string) {
  sessions.set(token, sessionId);
}

export function hasSession(token: string): boolean {
  return sessions.has(token);
}
