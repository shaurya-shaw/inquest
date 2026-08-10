/**
 * Investigation phase timing constants (client-side mirror of server config).
 * Must stay in sync with server/src/investigation-config.ts.
 */

/** Minimum investigation time in seconds. Ready button hidden until this elapses. */
export const MIN_INVESTIGATION_TIME = 60; // 1 minute

/** Maximum investigation time in seconds. Investigation auto-ends at this point. */
export const MAX_INVESTIGATION_TIME = 300; // 5 minutes
