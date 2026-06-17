export const ablyChannels = {
  threadMessages: (threadId: string) => `chat:thread:${threadId}`,
  threadTyping: (threadId: string) => `chat:thread:${threadId}:typing`,
  userNotifications: (userId: string) => `chat:user:${userId}:notifications`,
} as const;
