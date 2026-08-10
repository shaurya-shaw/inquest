/**
 * Investigation phase timing constants.
 * These are shared between the timer logic and the client HUD.
 */

/** Minimum investigation time in seconds. Ready button is hidden until this elapses. */
export const MIN_INVESTIGATION_TIME = 60; // 1 minute

/** Maximum investigation time in seconds. Investigation auto-ends when this expires. */
export const MAX_INVESTIGATION_TIME = 300; // 5 minutes
