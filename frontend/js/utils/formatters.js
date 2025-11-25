// Conectores que no se capitalizan (excepto si son la primera palabra)
const LOWERCASE_WORDS = ['of', 'the', 'and', 'in', 'on', 'at', 'to', 'a', 'an', 'for', 'with'];

/**
 * Capitaliza texto inteligentemente (respetando conectores)
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export function smartCapitalize(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !LOWERCASE_WORDS.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}