import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Instructions from "@/components/Instructions";

interface InputFormProps {
  gridInput: string;
  wordsInput: string;
  error: string;
  onGridChange: (value: string) => void;
  onWordsChange: (value: string) => void;
  onSolve: () => void;
  onClear: () => void;
  onLoadExample: () => void;
}

export default function InputForm({
  gridInput,
  wordsInput,
  error,
  onGridChange,
  onWordsChange,
  onSolve,
  onClear,
  onLoadExample
}: InputFormProps) {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Eingaben</h2>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
          {error}
        </div>
      )}
      
      {/* Grid Input */}
      <div className="mb-6">
        <label htmlFor="gridInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Buchstabenraster:
        </label>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Geben Sie ein Buchstabenraster ein. Trennen Sie die Buchstaben mit Leerzeichen, jede Zeile in einer neuen Zeile.
        </div>
        <Textarea 
          id="gridInput" 
          value={gridInput}
          onChange={(e) => onGridChange(e.target.value)}
          placeholder="J E S U S J O E L B H I O B T U M N
O H R E C D A V I D L Ö N F S F A A
N O R E D M O S E Ö H O S E A S T H
A J A K O B U S U S F L U N C T E M"
          rows={4}
          className="w-full font-mono"
        />
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium mb-1"><span className="material-icons text-sm align-middle mr-1">lightbulb</span> Tipp: KI-Tools nutzen</p>
          <p className="mb-2">Sie können ChatGPT oder andere KI-Tools verwenden, um den Raster aus einem Bild zu extrahieren. Hier ein Beispielprompt:</p>
          <div className="bg-white dark:bg-gray-800 p-2 border border-blue-200 dark:border-blue-900 rounded font-mono text-xs overflow-auto">
            Im folgenden Bild findest du ein Worträtsel. Deine Aufgabe besteht darin, ausschließlich den Text des Worträtsels zu extrahieren. Achte darauf, dass die Buchstaben innerhalb derselben Zeile jeweils durch ein Leerzeichen getrennt sind. Gib das Ergebnis in einem Codeblock im folgenden Format zurück:<br/>
            ```<br/>
            J E S U S J O E L B H I O B T U M N<br/>
            O H R E C D A V I D L Ö N F S F A A<br/>
            N O R E D M O S E Ö H O S E A S T H<br/>
            ```
          </div>
        </div>
      </div>
      
      {/* Words Input */}
      <div className="mb-6">
        <label htmlFor="wordsInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Zu suchende Wörter:
        </label>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Geben Sie die zu suchenden Wörter ein, getrennt durch Kommas oder Zeilenumbrüche.
        </div>
        <Textarea 
          id="wordsInput" 
          value={wordsInput}
          onChange={(e) => onWordsChange(e.target.value)}
          placeholder="JESUS, JOEL, DAVID, MOSE, HOSEA, JAKOBUS"
          rows={3}
          className="w-full"
        />
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium mb-1"><span className="material-icons text-sm align-middle mr-1">lightbulb</span> Tipp: KI-Tools nutzen</p>
          <p className="mb-2">Sie können ChatGPT oder andere KI-Tools verwenden, um die gesuchten Wörter aus einem Bild zu extrahieren. Hier ein Beispielprompt:</p>
          <div className="bg-white dark:bg-gray-800 p-2 border border-blue-200 dark:border-blue-900 rounded font-mono text-xs overflow-auto">
            Im folgenden Bild findest du alle Wörter, die im Worträtsel gesucht werden müssen. Gib mir am Ende alle gesuchten Wörter in einem Codeblock aus, getrennt durch Kommas. Verwende dabei folgendes Format:<br/>
            ```<br/>
            JESUS, JOEL, DAVID, MOSE, HOSEA, JAKOBUS<br/>
            ```
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={onSolve}
          className="bg-primary hover:bg-primary/80 text-white"
        >
          <span className="material-icons text-sm mr-1">search</span> Wörter finden
        </Button>
        <Button 
          onClick={onClear}
          variant="outline"
          className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <span className="material-icons text-sm mr-1">clear</span> Zurücksetzen
        </Button>
        <Button 
          onClick={onLoadExample}
          variant="outline"
          className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <span className="material-icons text-sm mr-1">lightbulb</span> Beispiel laden
        </Button>
      </div>
      
      {/* Instructions */}
      <div className="mt-8 border-t pt-4">
        <Instructions />
      </div>
    </div>
  );
}
