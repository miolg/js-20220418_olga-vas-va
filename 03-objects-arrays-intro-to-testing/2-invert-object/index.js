/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj && Object.keys(obj)) {
    return Object.fromEntries(Object.entries(obj).map(([item1, item2]) => [item2, item1]));
  }
}
