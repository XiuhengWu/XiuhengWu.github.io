import { Card } from "@/components/ui/card";
import type { WordResult } from "@/pages/WordSearchSolver";

// Color classes for highlighting words
const colorClasses = [
  'highlight-red',
  'highlight-orange',
  'highlight-green',
  'highlight-blue',
  'highlight-purple',
  'highlight-teal'
];

interface ResultsDisplayProps {
  grid: string[][];
  results: WordResult[];
  notFoundWords?: string[];
  searchTime?: number | null;
}

export default function ResultsDisplay({ grid, results, notFoundWords = [], searchTime }: ResultsDisplayProps) {
  // Create color mapping for the grid cells
  const colorMapping: Record<string, string> = {};
  
  results.forEach((item, index) => {
    const [word, [r0, c0], [r1, c1]] = item;
    const colorClass = colorClasses[index % colorClasses.length];
    
    if (r0 === r1) {  // Horizontal
      const step = c1 >= c0 ? 1 : -1;
      for (let c = c0; step > 0 ? c <= c1 : c >= c1; c += step) {
        colorMapping[`${r0},${c}`] = colorClass;
      }
    } else if (c0 === c1) {  // Vertical
      const step = r1 >= r0 ? 1 : -1;
      for (let r = r0; step > 0 ? r <= r1 : r >= r1; r += step) {
        colorMapping[`${r},${c0}`] = colorClass;
      }
    } else {  // Diagonal
      const stepR = r1 >= r0 ? 1 : -1;
      const stepC = c1 >= c0 ? 1 : -1;
      let r = r0;
      let c = c0;
      while ((stepR > 0 ? r <= r1 : r >= r1) && (stepC > 0 ? c <= c1 : c >= c1)) {
        colorMapping[`${r},${c}`] = colorClass;
        r += stepR;
        c += stepC;
      }
    }
  });

  // Format search time
  const formattedTime = searchTime !== null && searchTime !== undefined
    ? searchTime < 1
      ? searchTime * 1000 <= 50
        ? `≤ 50 Mikrosekunden`
        : `${Math.round(searchTime * 1000)} Mikrosekunden`
      : `${searchTime.toFixed(2)} Millisekunden`
    : null;
  
  return (
    <>
      <Card className="p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">Ergebnisraster</h2>
        <div className="flex justify-center">
          {grid.length > 0 ? (
            <div 
              className="letter-grid overflow-x-auto pb-2" 
              style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}
            >
              {grid.map((row, rowIndex) => 
                row.map((cell, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`letter-cell ${colorMapping[`${rowIndex},${colIndex}`] || ''}`}
                  >
                    {cell}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 italic text-sm md:text-base">
              Das Ergebnisraster wird hier angezeigt, nachdem Sie die Suche gestartet haben.
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">Gefundene Wörter</h2>
        {results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">
              {results.length} Wort{results.length !== 1 ? 'e' : ''} gefunden:
            </p>
            <ul className="space-y-1 text-sm md:text-base">
              {results.map(([word, start, end], index) => (
                <li key={`${word}-${index}`} className="flex items-center">
                  <span className={`inline-block w-3 h-3 md:w-4 md:h-4 mr-2 ${colorClasses[index % colorClasses.length]}`}></span>
                  <span>{word}: ({start[0]},{start[1]}) - ({end[0]},{end[1]})</span>
                </li>
              ))}
            </ul>
            
            {formattedTime && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <p>Suchzeit: {formattedTime}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 italic text-sm md:text-base">
            Die gefundenen Wörter werden hier aufgelistet, nachdem Sie die Suche gestartet haben.
          </div>
        )}
      </Card>
      
      {notFoundWords.length > 0 && (
        <Card className="p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4 text-amber-600 dark:text-amber-500">Nicht gefundene Wörter</h2>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">
              {notFoundWords.length} Wort{notFoundWords.length !== 1 ? 'e' : ''} nicht gefunden:
            </p>
            <ul className="space-y-1 text-sm md:text-base list-disc pl-5">
              {notFoundWords.map((word, index) => (
                <li key={`${word}-not-found-${index}`}>{word}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Bitte stellen Sie sicher, dass Buchstaben wie ß, ä, ö und ü richtig verarbeitet werden. 
              Ersetzungen: ä→ae, ö→oe, ü→ue, ß→ss.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
