# Smart XML Sorter

A powerful IDE extension for Antigravity (VS Code) that recursively sorts XML files by tags and attributes while preserving comments (`<!-- ... -->`) and original formatting.

## Features

* **Recursive Sorting:** Recursively sorts all child elements alphabetically by their XML tag names.
* **Secondary Sort Keys:** For elements with identical tag names, sorting is resolved using configurable priority attributes (e.g., `id`, `name`, `key`).
* **Alphabetical Attributes:** Alphabetically sorts the attributes within each XML element.
* **Comment Preservation:** Comments remain bound to their succeeding elements and are moved with them during sorting.
* **Adjustable Indentation:** Pretty-printing with configurable indentation depth.
* **Works In-Place:** Directly updates the active editor window, allowing full undo/redo support.

## System Requirements

This extension requires **Python 3** (`python3` in system PATH).

## Usage

1. Open any XML file.
2. Trigger the sorting using one of the following methods:
   * **Context Menu:** Right-click in the editor and select **"Smart XML Sorter: Sort XML"**.
   * **Keyboard Shortcut:** Press `Cmd+Alt+X` (macOS) or `Ctrl+Alt+X` (Windows/Linux).
   * **Command Palette:** Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for **"Smart XML Sorter: Sort XML"**.

## Configuration

You can customize the following settings in your VS Code (fork) settings:

* `xmlSorter.indent`: Number of spaces for indentation (Default: `4`).
* `xmlSorter.sortKeys`: A comma-separated priority list of attributes used to distinguish identical tags (Default: `"id,name,key"`).

## License

MIT License
