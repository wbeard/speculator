import { encode } from '@toon-format/toon';

/**
 * Format data as TOON for CLI output
 * @param {any} data - JavaScript object or array to encode
 * @returns {string} TOON-formatted string
 */
export function formatOutput(data) {
  return encode(data);
}
