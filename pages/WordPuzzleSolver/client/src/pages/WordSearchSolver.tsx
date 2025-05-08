import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import InputForm from "@/components/InputForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { findWordsInMatrix, normalizeGermanText } from "@/lib/wordSearchUtils";

// Example data
const EXAMPLE_GRID = `K E R Z E S T I R N V D S K G U
U E B E R G I E ß T A R U I E C
L I C H T C H R I S T I E R W H
R E I N I G E N D E E D N C A K
O L I V E N O E L I R E D H N E
T A U F B A L S A M E W E E D L
E L I E B E G O T T E S R D E C
N B A W I R E M P F A N G E N H
G E B W P S A N Z U E N D E N S
S L W E F A O A H E L L E T K P
Y E A I A L T M E S G E U L R R
M B S S R B G E S A L B T E A I
B E C S R T I N T A U F E E F C
O N H B E T E L E B E N T K T H
L D E I R N T A E U F L I N G T
E E N S O H N D E W A N G E N R`;

const EXAMPLE_WORDS =
  "KERZE, ANZUENDEN, DEUTET, WANGEN, STIRN, SALBT, SOHN, WEISS, VATER, NAMEN, SPRICHT, TAEUFLING, UEBERGIEßT, PFARRER, BALSAM, LEBEN, LICHTCHRISTI, EMPFANGEN, GESALBTE, SUENDE, ABWASCHEN, KRAFT, BELEBENDE, REINIGENDE, LIEBEGOTTES, SYMBOLE, OLIVENOEL, HELL, TAUFE, KIRCHE, KELCH, GEWAND";

export type WordResult = [string, [number, number], [number, number]];

export default function WordSearchSolver() {
  const { theme, setTheme } = useTheme();
  const [gridInput, setGridInput] = useState("");
  const [wordsInput, setWordsInput] = useState("");
  const [results, setResults] = useState<WordResult[]>([]);
  const [notFoundWords, setNotFoundWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [error, setError] = useState("");
  const [includeDiagonal, setIncludeDiagonal] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const parseGrid = (input: string): string[][] => {
    const grid: string[][] = [];
    const lines = input.trim().split("\n");

    for (const line of lines) {
      const row = line
        .trim()
        .split(/\s+/)
        .filter((char) => char !== "");
      if (row.length > 0) {
        grid.push(row);
      }
    }

    return grid;
  };

  // Wir nutzen die gemeinsame Funktion aus wordSearchUtils

  const parseWords = (input: string): string[] => {
    return input
      .trim()
      .split(/[,\n]+/)
      .map((word) => {
        const trimmedWord = word.trim();
        if (trimmedWord === "") return "";
        // Erst in Großbuchstaben umwandeln, dann normalisieren
        return normalizeGermanText(trimmedWord.toUpperCase());
      })
      .filter((word) => word !== "");
  };

  const handleSolve = () => {
    setError("");
    setSearchTime(null);

    if (!gridInput.trim() || !wordsInput.trim()) {
      setError(
        "Bitte geben Sie sowohl das Buchstabenraster als auch die zu suchenden Wörter ein.",
      );
      return;
    }

    const parsedGrid = parseGrid(gridInput);
    const words = parseWords(wordsInput);

    if (parsedGrid.length === 0 || words.length === 0) {
      setError(
        "Die Eingaben konnten nicht korrekt verarbeitet werden. Bitte überprüfen Sie das Format.",
      );
      return;
    }

    // Check if grid is rectangular
    const firstRowLength = parsedGrid[0].length;
    for (let i = 1; i < parsedGrid.length; i++) {
      if (parsedGrid[i].length !== firstRowLength) {
        setError(
          "Das Buchstabenraster muss rechteckig sein (alle Zeilen müssen die gleiche Länge haben).",
        );
        return;
      }
    }

    // Measure search time
    const startTime = performance.now();
    const found = findWordsInMatrix(parsedGrid, words, includeDiagonal);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    // Find words that were not found in the grid
    const foundWords = found.map((result) => result[0]);
    const notFound = words.filter((word) => !foundWords.includes(word));

    setResults(found);
    setNotFoundWords(notFound);
    setGrid(parsedGrid);
    setSearchTime(timeTaken);
  };

  const handleClear = () => {
    setGridInput("");
    setWordsInput("");
    setResults([]);
    setNotFoundWords([]);
    setGrid([]);
    setError("");
    setSearchTime(null);
  };

  const handleLoadExample = () => {
    setGridInput(EXAMPLE_GRID);
    setWordsInput(EXAMPLE_WORDS);
    setResults([]);
    setNotFoundWords([]);
    setGrid([]);
    setError("");
    setSearchTime(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="text-center mb-6 md:mb-8">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            className="rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? (
              <span className="material-icons">light_mode</span>
            ) : (
              <span className="material-icons">dark_mode</span>
            )}
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          Worträtsel-Löser
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
          Finden Sie Wörter in einem Buchstabenraster horizontal, vertikal{" "}
          {includeDiagonal && "und diagonal"}
        </p>
      </header>

      <div className="mb-4 flex items-center justify-center space-x-2">
        <Checkbox
          id="includeDiagonal"
          checked={includeDiagonal}
          onCheckedChange={(checked) => setIncludeDiagonal(!!checked)}
        />
        <Label htmlFor="includeDiagonal" className="text-sm cursor-pointer">
          Diagonale Suche einschließen
        </Label>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Input Form */}
        <Card className="p-4 md:p-6 order-1">
          <InputForm
            gridInput={gridInput}
            wordsInput={wordsInput}
            error={error}
            onGridChange={setGridInput}
            onWordsChange={setWordsInput}
            onSolve={handleSolve}
            onClear={handleClear}
            onLoadExample={handleLoadExample}
          />
        </Card>

        {/* Results */}
        <div className="order-2">
          <ResultsDisplay
            grid={grid}
            results={results}
            notFoundWords={notFoundWords}
            searchTime={searchTime}
          />
        </div>
      </div>
      <footer className="text-center mt-8 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <a
          href="https://github.com/XiuhengWu/XiuhengWu.github.io/blob/main/pages/WordPuzzleSolver/wordPuzzle.py"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Original Python Script by Xiuheng Wu
        </a>
      </footer>
    </div>
  );
}
