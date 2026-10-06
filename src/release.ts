export const playtestBuild=import.meta.env.MODE==='playtest';
export const buildId='Trinity · '+(import.meta.env.VITE_BUILD_REVISION?.slice(0,7)??'local');
