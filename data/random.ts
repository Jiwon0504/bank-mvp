// Deterministic seeded PRNG so mock data is stable across server restarts
// (important for a demo: numbers on screen shouldn't shuffle on every reload).

export function createRng(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickMany<T>(
  rng: () => number,
  arr: readonly T[],
  count: number
): T[] {
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export function intBetween(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function floatBetween(
  rng: () => number,
  min: number,
  max: number,
  decimals = 1
): number {
  const val = rng() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
}

export function dateDaysAgo(baseIso: string, daysAgo: number): string {
  const base = new Date(baseIso);
  base.setDate(base.getDate() - daysAgo);
  return base.toISOString().slice(0, 10);
}
