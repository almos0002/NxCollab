import { Rest } from "ably";

let ablyRest: Rest | null = null;

export function getAblyRest() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    throw new Error("ABLY_API_KEY must be set.");
  }

  ablyRest ??= new Rest({ key: apiKey });
  return ablyRest;
}

export async function publishAblyEvent(channelName: string, eventName: string, data: unknown) {
  await getAblyRest().channels.get(channelName).publish(eventName, data);
}
