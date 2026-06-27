import { getDatabase } from "@/lib/mongo";
import { COLLECTIONS } from "@/lib/db/setup";

export interface ChallengeData {
  urlCode: string;
  exerciseId: string;
  challengerId: string;
  challengerScore: number;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Looks up a challenge by its URL code.
 * Returns null if the challenge doesn't exist, has expired, or a DB error occurs.
 */
export async function getChallengeData(code: string): Promise<ChallengeData | null> {
  try {
    const db = await getDatabase();
    const collection = db.collection(COLLECTIONS.CHALLENGE_LINKS);

    const challenge = await collection.findOne({ urlCode: code });

    if (!challenge) {
      return null;
    }

    // Check if expired
    const now = new Date();
    if (new Date(challenge.expiresAt) < now) {
      return null;
    }

    return {
      urlCode: challenge.urlCode,
      exerciseId: challenge.exerciseId,
      challengerId: challenge.challengerId,
      challengerScore: challenge.challengerScore,
      createdAt: challenge.createdAt,
      expiresAt: challenge.expiresAt,
    };
  } catch {
    return null;
  }
}
