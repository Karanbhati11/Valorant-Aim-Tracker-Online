/**
 * Exercise Definitions
 * 5 Core Exercises - Tuned for 3D Room Z=-45
 */

const EXERCISES = {
  CORE: {
    category: "Core Training",
    icon: "🏆",
    exercises: [
      {
        id: "static_grid",
        name: "1. Static Grid (Warmup)",
        description: "Classic gridshot. Rapidly clicking static targets.",
        difficulty: 1,
        duration: 60,
        mechanics: {
          targetSpawns: 3,
          targetSize: 2.2,
          targetStatic: true,
          gridBased: true,
          respawnDelay: 150,
        },
        scoringRules: { hitReward: 100, misspenalty: 20 },
        stats: ["Click Timing", "Muscle Memory"],
      },
      {
        id: "micro_adjust",
        name: "2. Micro Corrections (Precision)",
        description: "Tiny targets spawn near center.",
        difficulty: 3,
        duration: 60,
        mechanics: {
          targetSpawns: 1,
          targetSize: 0.8,
          targetStatic: true,
          minDistance: 0.5,
          maxDistance: 6.0,
          respawnDelay: 200,
        },
        scoringRules: { hitReward: 150, misspenalty: 50 },
        stats: ["Micro-Flicking", "Precision"],
      },
      {
        id: "pop_up_reflex",
        name: "3. Pop-Up Reflex (Holding)",
        description: "Targets appear randomly and disappear quickly.",
        difficulty: 2,
        duration: 60,
        mechanics: {
          targetSpawns: 1,
          targetSize: 2.5,
          targetStatic: true,
          reflexMode: true,
          reflexTime: 800,
          respawnDelay: 700,
        },
        scoringRules: { hitReward: 200, misspenalty: 0 },
        stats: ["Reaction Time", "Focus"],
      },
      {
        id: "strafe_track",
        name: "4. Strafe Tracking (Pistol)",
        description: "Track a target moving erratically.",
        difficulty: 2,
        duration: 60,
        mechanics: {
          targetSpawns: 1,
          targetSize: 2.2,
          targetStatic: false,
          pathSpeed: 0.35,
          respawnDelay: 300,
        },
        scoringRules: { hitReward: 50, misspenalty: 0 },
        stats: ["Smoothness", "Reading Movement"],
      },
      {
        id: "dynamic_flicks",
        name: "5. Dynamic Flicks (Rifle)",
        description: "Targets spawn at random distances wide on screen.",
        difficulty: 2,
        duration: 60,
        mechanics: {
          targetSpawns: 2,
          targetSize: 2.0,
          targetStatic: true,
          minDistance: 4,
          maxDistance: 28,
          respawnDelay: 250,
        },
        scoringRules: { hitReward: 120, misspenalty: 30 },
        stats: ["Flick Speed", "Stopping Power"],
      },
    ],
  },
};

function getExerciseById(id) {
  for (const cat of Object.values(EXERCISES)) {
    const ex = cat.exercises.find((e) => e.id === id);
    if (ex) return ex;
  }
  return null;
}
