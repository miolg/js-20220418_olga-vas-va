/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let currentSymbolCount = 1;
  let prevSymbol;

  function checkSymbols(result, current) {
    if (!prevSymbol) {
      prevSymbol = result;
    }

    if (prevSymbol !== current) {
      prevSymbol = current;
      currentSymbolCount = 1;
      return result + current;
    }

    currentSymbolCount++;
    if (currentSymbolCount > size) {
      return result;
    }

    return result + current;
  }

  return ((size !== 0) && string && [...string].reduce((prev, current) => checkSymbols(prev, current))) || '';
}