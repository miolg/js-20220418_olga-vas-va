/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const getter = function(object) {
    if (!Object.keys(object)) {
      return;
    }
    const dotIndex = path.indexOf('.');
    if (~dotIndex) {
      const nestedObject = object[path.slice(0, dotIndex)];
      path = path.slice(dotIndex + 1);
      return nestedObject && getter(nestedObject);
    } else {
      return object[path];
    }
  };

  return getter;
}
