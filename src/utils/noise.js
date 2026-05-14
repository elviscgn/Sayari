export function hash2D(x, z, seed) {
  let h = seed + x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) & 0x7FFFFFFF) / 2147483647;
}

export function fbm1D(x, seed) {
  const ix = Math.floor(x);
  const fx = x - ix;
  const sx = fx * fx * (3 - 2 * fx);
  const v0 = hash2D(ix, 0, seed);
  const v1 = hash2D(ix + 1, 0, seed);
  return v0 + (v1 - v0) * sx;
}

export function makeRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) | 0; return (s >>> 0) / 4294967296; };
}
