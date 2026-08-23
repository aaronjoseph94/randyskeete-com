/**
 * Shared site constants used by Netlify Functions.
 * Bump CACHE_VERSION to invalidate cached YouTube playlist JSON in Blobs.
 */
export const PLAYLIST_ID = "PLEHUwFohE59Y-dMNNWFzFn1c7lfNYKzXt";
export const YOUTUBE_REFERER = "https://randyskeete.com/";
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
export const CACHE_VERSION = 3;
export const COOKIE_NAME = "rs_editor";
export const SESSION_MS = 8 * 60 * 60 * 1000;
export const MAX_PREACHING_CHARS = 2000;
export const MAX_BODY_BYTES = 8000;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_ATTEMPTS = 8;
/** Shown in the header when no custom location has been saved yet. */
export const DEFAULT_PREACHING_TEXT = "TBA";
