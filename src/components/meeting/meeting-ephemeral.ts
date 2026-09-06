export const REACTION_TOPIC = "nexmeet.reactions.v1";
export const HAND_RAISED_ATTRIBUTE = "nexmeet.handRaised";

export const REACTIONS = ["👍", "❤️", "😂", "👏", "🎉"] as const;
export type ReactionType = (typeof REACTIONS)[number];

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === "string" && (REACTIONS as readonly string[]).includes(value);
}
