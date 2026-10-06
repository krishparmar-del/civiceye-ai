import { Problem } from '../types';

// Calculate Haversine distance in meters
export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Tokenize text for simple Jaccard similarity
function getTokens(str: string): Set<string> {
  const words = str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const s1 = getTokens(text1);
  const s2 = getTokens(text2);
  if (s1.size === 0 || s2.size === 0) return 0;
  let intersection = 0;
  for (const token of s1) {
    if (s2.has(token)) intersection++;
  }
  const union = new Set([...s1, ...s2]).size;
  return union === 0 ? 0 : intersection / union;
}

export interface DuplicateMatch {
  problemId: string;
  problemTitle: string;
  distanceMeters: number;
  categoryMatch: boolean;
  textSimilarity: number;
  confidence: number; // 0-100
}

export function findPotentialDuplicates(
  target: {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    block: string;
  },
  existingProblems: Problem[],
  excludeId?: string
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const p of existingProblems) {
    if (excludeId && p.id === excludeId) continue;
    if (p.status === 'Closed') continue;

    const distance = getDistanceInMeters(
      target.latitude,
      target.longitude,
      p.latitude,
      p.longitude
    );

    const isSameCategory =
      target.category.toLowerCase() === p.category.toLowerCase() ||
      (target.category === 'Road' && p.category === 'Pothole') ||
      (target.category === 'Pothole' && p.category === 'Road');

    const textSim = calculateTextSimilarity(
      `${target.title} ${target.description}`,
      `${p.title} ${p.description}`
    );

    // If within 300 meters and same category, high probability
    let confidence = 0;
    if (distance <= 50) {
      confidence += 60;
    } else if (distance <= 150) {
      confidence += 45;
    } else if (distance <= 300) {
      confidence += 25;
    }

    if (isSameCategory) {
      confidence += 25;
    }

    if (textSim >= 0.4) {
      confidence += 20;
    } else if (textSim >= 0.2) {
      confidence += 10;
    }

    // Proximity in same block name
    if (target.block && p.block && target.block.toLowerCase() === p.block.toLowerCase()) {
      confidence += 5;
    }

    confidence = Math.min(98, confidence);

    if (confidence >= 60 || (distance <= 120 && isSameCategory)) {
      matches.push({
        problemId: p.id,
        problemTitle: p.title,
        distanceMeters: Math.round(distance),
        categoryMatch: isSameCategory,
        textSimilarity: Math.round(textSim * 100),
        confidence: Math.max(60, confidence),
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}
