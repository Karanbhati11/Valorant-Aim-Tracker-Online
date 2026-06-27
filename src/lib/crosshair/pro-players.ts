/**
 * Pro player crosshair database.
 * Used for dynamic SEO-rich pro player profile pages.
 * Targets keywords: "tenz crosshair code", "aspas crosshair", "demon1 crosshair", etc.
 */

export type ProPlayer = {
  slug: string;
  name: string;
  team: string;
  role: string;
  region: string;
  crosshairCode: string;
  dpi: number;
  sensitivity: number;
  edpi: number;
  scopedSensitivity: number;
  resolution: string;
  monitor: string;
  mouse: string;
  mousepad: string;
  description: string;
  keywords: string[];
};

export const PRO_PLAYERS: ProPlayer[] = [
  {
    slug: "tenz",
    name: "TenZ",
    team: "Sentinels",
    role: "Duelist",
    region: "NA",
    crosshairCode: "0;P;c;5;o;1;d;1;z;3;0b;0;1b;0",
    dpi: 800,
    sensitivity: 0.4,
    edpi: 320,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "ASUS ROG Swift 360Hz",
    mouse: "Finalmouse UltralightX",
    mousepad: "Artisan Zero Soft XL",
    description: "TenZ is one of the most iconic Valorant pro players, known for his crisp flick aim and flashy plays. His crosshair is a small cyan dot — clean and minimal for precise headshot tracking.",
    keywords: ["tenz crosshair", "tenz crosshair code", "tenz valorant crosshair", "tenz settings", "sentinels crosshair"],
  },
  {
    slug: "aspas",
    name: "aspas",
    team: "LOUD",
    role: "Duelist",
    region: "BR",
    crosshairCode: "0;P;c;1;o;1;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0",
    dpi: 800,
    sensitivity: 0.3,
    edpi: 240,
    scopedSensitivity: 1.0,
    resolution: "1280x960 (Stretched)",
    monitor: "Zowie XL2546K 240Hz",
    mouse: "Zowie EC2-CW",
    mousepad: "Zowie G-SR-SE",
    description: "aspas is a Brazilian superstar known for aggressive entry fragging. His crosshair features short green inner lines with slight offset for quick flick acquisition.",
    keywords: ["aspas crosshair", "aspas crosshair code", "aspas valorant settings", "loud crosshair"],
  },
  {
    slug: "demon1",
    name: "Demon1",
    team: "Evil Geniuses",
    role: "Duelist",
    region: "NA",
    crosshairCode: "0;P;c;5;o;1;d;1;z;1;0b;0;1b;0",
    dpi: 1600,
    sensitivity: 0.17,
    edpi: 272,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "BenQ Zowie XL2566K",
    mouse: "Logitech G Pro X Superlight 2",
    mousepad: "Artisan Hien Soft XL",
    description: "Demon1 burst onto the scene with insane mechanical skill. He uses a tiny cyan dot crosshair for pixel-perfect aiming at any range.",
    keywords: ["demon1 crosshair", "demon1 crosshair code", "demon1 settings", "eg crosshair valorant"],
  },
  {
    slug: "yay",
    name: "yay",
    team: "Cloud9",
    role: "Duelist / Chamber",
    region: "NA",
    crosshairCode: "0;P;c;5;h;0;0l;4;0o;2;0a;1;0f;0;1b;0",
    dpi: 800,
    sensitivity: 0.27,
    edpi: 216,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "ASUS ROG Swift 360Hz",
    mouse: "Lamzu Atlantis Mini",
    mousepad: "Lethal Gaming Gear Saturn",
    description: "Known as 'El Diablo', yay is one of the most consistent aimers in Valorant. His crosshair uses cyan inner lines with no dot for clean visibility across all maps.",
    keywords: ["yay crosshair", "yay crosshair code", "yay valorant settings", "el diablo crosshair"],
  },
  {
    slug: "s0m",
    name: "s0m",
    team: "Sentinels",
    role: "Smoker / IGL",
    region: "NA",
    crosshairCode: "0;P;c;1;o;1;d;1;z;1;0b;0;1b;0",
    dpi: 800,
    sensitivity: 0.36,
    edpi: 288,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "ASUS ROG Swift 360Hz",
    mouse: "Finalmouse UltralightX",
    mousepad: "Artisan Zero Soft XL",
    description: "s0m brings versatility to Sentinels with sharp crosshair placement. He uses a small green dot for clean one-tap potential.",
    keywords: ["s0m crosshair", "s0m crosshair code", "s0m settings valorant", "sentinels s0m"],
  },
  {
    slug: "chronicle",
    name: "Chronicle",
    team: "Fnatic",
    role: "Controller",
    region: "EMEA",
    crosshairCode: "0;P;c;1;o;1;0t;1;0l;2;0o;3;0a;1;0f;0;1b;0",
    dpi: 800,
    sensitivity: 0.32,
    edpi: 256,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "BenQ Zowie XL2546K",
    mouse: "Logitech G Pro X Superlight",
    mousepad: "Artisan Hien Mid XL",
    description: "Chronicle anchors Fnatic with stellar utility usage and clutch aim. His crosshair features short green lines with offset.",
    keywords: ["chronicle crosshair", "fnatic crosshair", "chronicle valorant settings"],
  },
  {
    slug: "leo",
    name: "Leo",
    team: "Fnatic",
    role: "Initiator",
    region: "EMEA",
    crosshairCode: "0;P;c;1;h;0;0t;2;0l;3;0o;2;0a;1;0f;0;1b;0",
    dpi: 800,
    sensitivity: 0.35,
    edpi: 280,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "BenQ Zowie XL2546K",
    mouse: "Logitech G Pro X Superlight 2",
    mousepad: "Artisan Zero Soft XL",
    description: "Leo is one of the best initiators in the world. His crosshair is a classic green plus for all-around visibility.",
    keywords: ["leo crosshair", "leo fnatic crosshair", "leo valorant settings"],
  },
  {
    slug: "derke",
    name: "Derke",
    team: "Fnatic",
    role: "Duelist",
    region: "EMEA",
    crosshairCode: "0;P;c;1;o;1;d;1;z;3;0b;0;1b;0",
    dpi: 400,
    sensitivity: 0.55,
    edpi: 220,
    scopedSensitivity: 1.0,
    resolution: "1280x960 (Stretched)",
    monitor: "BenQ Zowie XL2566K",
    mouse: "Logitech G Pro X Superlight",
    mousepad: "Artisan Hien Soft XL",
    description: "Derke is Fnatic's star fragger with incredible Op and rifle skills. He uses a green dot crosshair at low sensitivity for surgeon-like precision.",
    keywords: ["derke crosshair", "derke crosshair code", "derke fnatic settings", "derke valorant"],
  },
  {
    slug: "something",
    name: "something",
    team: "DRX",
    role: "Duelist",
    region: "KR",
    crosshairCode: "0;P;c;5;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1t;0;1l;0;1o;0;1a;0;1m;0;1f;0",
    dpi: 800,
    sensitivity: 0.31,
    edpi: 248,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "BenQ Zowie XL2546K",
    mouse: "Logitech G Pro X Superlight 2",
    mousepad: "Artisan Zero Soft XL",
    description: "something is DRX's star player who helped win Champions 2022. His cyan inner-line crosshair provides clean sightlines at distance.",
    keywords: ["something crosshair", "drx crosshair", "something valorant settings"],
  },
  {
    slug: "cned",
    name: "cNed",
    team: "Natus Vincere",
    role: "Duelist",
    region: "EMEA",
    crosshairCode: "0;P;c;4;h;0;d;1;z;4;0t;1;0l;3;0o;1;0a;1;0f;0;1b;0",
    dpi: 800,
    sensitivity: 0.35,
    edpi: 280,
    scopedSensitivity: 1.0,
    resolution: "1920x1080",
    monitor: "BenQ Zowie XL2566K",
    mouse: "Zowie EC2-CW",
    mousepad: "Artisan Hien Mid XL",
    description: "cNed is the first Valorant Champions MVP, known for Jett mastery and Op plays. His yellow crosshair with inner lines and dot is instantly recognizable.",
    keywords: ["cned crosshair", "cned crosshair code", "cned valorant settings", "navi crosshair"],
  },
];

export function getProPlayer(slug: string): ProPlayer | undefined {
  return PRO_PLAYERS.find((p) => p.slug === slug);
}

export function getAllProSlugs(): string[] {
  return PRO_PLAYERS.map((p) => p.slug);
}
