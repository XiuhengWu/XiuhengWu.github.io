export type WordResult = [string, [number, number], [number, number]];

/**
 * Normalize German text by replacing umlauts and ß
 */
export function normalizeGermanText(text: string): string {
  return text
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'SS') // Großbuchstaben, da alles in Großbuchstaben umgewandelt wird
    .replace(/^\s+|\s+$/g, ''); // Entfernt führende und abschließende Leerzeichen
}

/**
 * Find words in a letter matrix.
 * 
 * @param matrix - 2D array of letters (e.g., [['J','E','S','U','S'], ...])
 * @param words - Array of words to search for (all uppercase, no spaces)
 * @param includeDiagonal - Whether to include diagonal directions in the search
 * @returns Array of [word, [startRow, startCol], [endRow, endCol]]
 */
export function findWordsInMatrix(matrix: string[][], words: string[], includeDiagonal: boolean = false): WordResult[] {
  // Make a copy of the matrix to avoid modifying the original
  const normalizedMatrix = matrix.map(row => row.map(cell => normalizeGermanText(cell)));
  
  // Also normalize the words to search for
  const normalizedWords = words.map(word => normalizeGermanText(word));
  
  // Convert word list to set for fast exact matches, and generate all possible prefixes
  const wordSet = new Set(normalizedWords);
  const prefixSet = new Set<string>();
  
  for (const word of normalizedWords) {
    for (let i = 1; i <= word.length; i++) {
      prefixSet.add(word.substring(0, i));
    }
  }
  
  const results: WordResult[] = [];
  const rows = matrix.length;
  const cols = rows > 0 ? matrix[0].length : 0;

  // Define directions (row increment, col increment)
  // First 4 are horizontal and vertical, last 4 are diagonal
  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
    [-1, -1], // up-left
    [-1, 1],  // up-right
    [1, -1],  // down-left
    [1, 1]    // down-right
  ];
  
  // If not including diagonal, use only the first 4 directions
  const searchDirections = includeDiagonal ? directions : directions.slice(0, 4);
  
  // Traverse each starting point
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (const [dr, dc] of searchDirections) {
        let currentStr = "";
        let x = i, y = j;
        
        // Extend in current direction until we reach matrix boundary
        while (x >= 0 && x < rows && y >= 0 && y < cols) {
          currentStr += normalizedMatrix[x][y];
          
          // Prune if current string is not a prefix of any word
          if (!prefixSet.has(currentStr)) {
            break;
          }
          
          // If current string exactly matches a word, record the result
          if (wordSet.has(currentStr)) {
            results.push([currentStr, [i, j], [x, y]]);
          }
          
          x += dr;
          y += dc;
        }
      }
    }
  }
  
  return results;
}
