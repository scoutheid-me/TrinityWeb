export const playtestBuild=import.meta.env.MODE==='playtest';
export const buildId='trinity-cavern-2026-10-04 · '+(import.meta.env.VITE_BUILD_REVISION?.slice(0,7)??'local');
