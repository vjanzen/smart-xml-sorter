# Smart XML Sorter

Eine leistungsstarke IDE-Erweiterung für Antigravity (VS Code), die XML-Dateien rekursiv nach Tags und Attributen sortiert, während Kommentare (`<!-- ... -->`) und ursprüngliche Einrückungen erhalten bleiben.

## Funktionen

* **Rekursive Sortierung:** Sortiert alle Kindelemente rekursiv alphabetisch nach ihren XML-Tag-Namen.
* **Sekundäre Sortierschlüssel:** Bei gleichen Tag-Namen wird nach konfigurierbaren Schlüsselattributen (z. B. `id`, `name`, `key`) sortiert.
* **Alphabetische Attribute:** Sortiert die Attribute innerhalb jedes XML-Elements alphabetisch.
* **Kommentarerhalt:** Kommentare bleiben fest an ihre nachfolgenden Elemente gekoppelt und werden beim Sortieren mitverschoben.
* **Einstellbare Einrückung:** Pretty-Printing mit konfigurierbarer Einrückungstiefe.
* **Arbeitet in-place:** Aktualisiert das aktive Editor-Fenster direkt, was vollständigen Undo/Redo-Support ermöglicht.

## Systemvoraussetzungen

Diese Erweiterung benötigt **Python 3** (`python3` im System-PATH).

## Benutzung

1. Öffnen Sie eine beliebige XML-Datei.
2. Führen Sie die Sortierung auf einem der folgenden Wege aus:
   * **Kontextmenü:** Klicken Sie mit der rechten Maustaste in den Editor und wählen Sie **"Smart XML Sorter: XML sortieren"**.
   * **Tastaturkurzbefehl:** Drücken Sie `Cmd+Alt+X` (macOS) oder `Ctrl+Alt+X` (Windows/Linux).
   * **Befehlspalette:** Öffnen Sie die Befehlspalette (`Cmd+Shift+P` / `Ctrl+Shift+P`) und suchen Sie nach **"Smart XML Sorter: XML sortieren"**.

## Konfiguration

Sie können folgende Einstellungen in den VS Code-Einstellungen anpassen:

* `xmlSorter.indent`: Anzahl der Leerzeichen für die Einrückung (Standard: `4`).
* `xmlSorter.sortKeys`: Kommagetrennte Prioritätsliste von Attributen zur Unterscheidung gleicher Tags (Standard: `"id,name,key"`).

## Lizenz

MIT Lizenz
