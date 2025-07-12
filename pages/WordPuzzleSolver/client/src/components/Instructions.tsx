import { useState } from 'react';

export default function Instructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">Anleitung</h3>
        <span className={`material-icons transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </div>
      <div className={`mt-2 overflow-hidden transition-all duration-300 ${isOpen ? 'h-auto' : 'h-0'}`}>
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            Dieses Tool hilft Ihnen, Wörter in einem Buchstabenraster zu finden, ähnlich wie bei einem Wortsuchrätsel.
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Geben Sie das Buchstabenraster ein - jeder Buchstabe getrennt durch Leerzeichen, jede Zeile in einer neuen Zeile.</li>
            <li>Fügen Sie die Wörter hinzu, die Sie suchen möchten - getrennt durch Kommas oder Zeilenumbrüche.</li>
            <li>Sie können auch die Option "Diagonale Suche einschließen" aktivieren, um Wörter in diagonalen Richtungen zu finden.</li>
            <li>Klicken Sie auf "Wörter finden", um die Suche zu starten.</li>
            <li>Die gefundenen Wörter werden im Raster farblich hervorgehoben und in der Ergebnisliste angezeigt.</li>
          </ol>
          <p>
            <strong>Hinweis:</strong> Standardmäßig unterstützt die Suche nur horizontale und vertikale Richtungen. Aktivieren Sie die Checkbox, um auch diagonale Richtungen einzubeziehen.
          </p>
        </div>
      </div>
    </>
  );
}
