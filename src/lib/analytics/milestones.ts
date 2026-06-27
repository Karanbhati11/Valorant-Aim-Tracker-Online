/**
 * Milestone notification system for MAU threshold detection.
 * Detects when monthly active users cross defined thresholds (10k, 25k, 50k, 100k)
 * and sends an email notification to the site owner.
 *
 * Validates: Requirements 16.4
 */

import * as nodemailer from 'nodemailer';
import { getDatabase } from '../mongo';
import { COLLECTIONS } from '../db/setup';

/** MAU thresholds that trigger milestone notifications */
export const MAU_THRESHOLDS = [10_000, 25_000, 50_000, 100_000] as const;

export type MauThreshold = (typeof MAU_THRESHOLDS)[number];

/** Represents a recorded milestone in the database */
export interface MilestoneRecord {
  threshold: MauThreshold;
  reachedAt: Date;
  notifiedAt: Date | null;
  mauAtTime: number;
}

/** The MongoDB collection name for storing milestone state */
export const MILESTONES_COLLECTION = COLLECTIONS.MILESTONES;

/**
 * Calculates the current monthly active users count.
 * MAU is defined as distinct sessions (unique sessionId) within the last 30 days.
 */
export async function getCurrentMAU(): Promise<number> {
  const db = await getDatabase();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db
    .collection(COLLECTIONS.ANALYTICS_EVENTS)
    .aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$sessionId',
        },
      },
      {
        $count: 'uniqueSessions',
      },
    ])
    .toArray();

  return result.length > 0 ? result[0].uniqueSessions : 0;
}

/**
 * Retrieves all milestones that have already been reached (to avoid duplicate notifications).
 */
export async function getReachedMilestones(): Promise<MilestoneRecord[]> {
  const db = await getDatabase();
  const milestones = await db
    .collection<MilestoneRecord>(MILESTONES_COLLECTION)
    .find({})
    .toArray();
  return milestones;
}

/**
 * Determines which thresholds have been newly crossed given the current MAU
 * and previously reached milestones.
 */
export function detectNewMilestones(
  currentMAU: number,
  reachedThresholds: MauThreshold[]
): MauThreshold[] {
  return MAU_THRESHOLDS.filter(
    (threshold) => currentMAU >= threshold && !reachedThresholds.includes(threshold)
  );
}

/**
 * Records a milestone as reached in the database.
 */
async function recordMilestone(
  threshold: MauThreshold,
  mauAtTime: number,
  notifiedAt: Date | null
): Promise<void> {
  const db = await getDatabase();
  await db.collection<MilestoneRecord>(MILESTONES_COLLECTION).updateOne(
    { threshold },
    {
      $set: {
        threshold,
        reachedAt: new Date(),
        notifiedAt,
        mauAtTime,
      },
    },
    { upsert: true }
  );
}

/**
 * Creates a nodemailer transporter using SMTP environment variables.
 * Required env vars:
 *   SMTP_HOST - SMTP server hostname
 *   SMTP_PORT - SMTP server port (defaults to 587)
 *   SMTP_USER - SMTP username
 *   SMTP_PASS - SMTP password
 *   SMTP_FROM - Sender email address
 *   OWNER_EMAIL - Site owner email to receive notifications
 */
function createEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Sends a milestone notification email to the site owner.
 * Returns true if the email was sent successfully, false otherwise.
 */
export async function sendMilestoneEmail(
  threshold: MauThreshold,
  currentMAU: number
): Promise<boolean> {
  const transporter = createEmailTransporter();
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transporter || !ownerEmail) {
    console.warn(
      '[Milestones] Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and OWNER_EMAIL env vars.'
    );
    return false;
  }

  const formattedThreshold = threshold.toLocaleString();
  const formattedMAU = currentMAU.toLocaleString();

  try {
    await transporter.sendMail({
      from: fromEmail,
      to: ownerEmail,
      subject: `🎉 AimTrainerPro Milestone: ${formattedThreshold} MAU Reached!`,
      text: [
        `Congratulations! AimTrainerPro has crossed the ${formattedThreshold} monthly active users milestone.`,
        '',
        `Current MAU: ${formattedMAU}`,
        `Threshold: ${formattedThreshold}`,
        `Date: ${new Date().toISOString()}`,
        '',
        'Keep up the great work!',
      ].join('\n'),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">🎉 Milestone Reached!</h1>
          <p>AimTrainerPro has crossed the <strong>${formattedThreshold}</strong> monthly active users milestone.</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 16px; border: 1px solid #e5e7eb; font-weight: bold;">Current MAU</td>
              <td style="padding: 8px 16px; border: 1px solid #e5e7eb;">${formattedMAU}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px; border: 1px solid #e5e7eb; font-weight: bold;">Threshold</td>
              <td style="padding: 8px 16px; border: 1px solid #e5e7eb;">${formattedThreshold}</td>
            </tr>
            <tr>
              <td style="padding: 8px 16px; border: 1px solid #e5e7eb; font-weight: bold;">Date</td>
              <td style="padding: 8px 16px; border: 1px solid #e5e7eb;">${new Date().toISOString()}</td>
            </tr>
          </table>
          <p style="color: #6b7280;">Keep up the great work!</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Milestones] Failed to send email notification:', error);
    return false;
  }
}

/**
 * Main entry point: checks current MAU against thresholds and sends
 * notifications for any newly crossed milestones.
 *
 * This function is idempotent — it reads milestone state from the database
 * to avoid duplicate notifications. Safe to call on every analytics update.
 *
 * Returns the list of newly crossed thresholds (empty if none).
 */
export async function checkAndNotifyMilestones(): Promise<MauThreshold[]> {
  const currentMAU = await getCurrentMAU();
  const reached = await getReachedMilestones();
  const reachedThresholds = reached.map((r) => r.threshold);

  const newMilestones = detectNewMilestones(currentMAU, reachedThresholds);

  for (const threshold of newMilestones) {
    const emailSent = await sendMilestoneEmail(threshold, currentMAU);
    await recordMilestone(threshold, currentMAU, emailSent ? new Date() : null);

    console.log(
      `[Milestones] Threshold ${threshold.toLocaleString()} reached (MAU: ${currentMAU}). Email sent: ${emailSent}`
    );
  }

  return newMilestones;
}
