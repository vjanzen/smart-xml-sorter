# Smart XML Sorter

A powerful IDE extension for Antigravity (VS Code) that recursively sorts XML files by tags and attributes while preserving comments (`<!-- ... -->`), XML declarations, namespaces, and formatting.

## Features

* **Recursive Sorting:** Recursively sorts all child elements alphabetically by their XML tag names (case-insensitive primary sort with case-sensitive tie-breaking).
* **Secondary Sort Keys:** For elements with identical tag names, sorting is resolved using configurable priority attributes (e.g., `id`, `name`, `key`), falling back to all sorted attributes.
* **Alphabetical Attributes:** Alphabetically sorts the attributes within each XML element.
* **Comment Preservation:** Comments remain bound to their succeeding elements and move with them during sorting (trailing comments stay at the end of their parent block).
* **Adjustable Indentation:** Pretty-printing with configurable indentation depth.
* **Works In-Place:** Directly updates the active editor window, allowing full undo/redo support.

## System Requirements

* **Python 3** (`python3` available in your system `PATH`)

## Installation

1. Download `smart-xml-sorter.vsix` from the [`dist/`](dist/smart-xml-sorter.vsix) directory or the [GitHub Releases](https://github.com/vjanzen/smart-xml-sorter/releases) page.
2. In Antigravity / VS Code, open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
3. Run **"Extensions: Install from VSIX..."** and select the `.vsix` file.

## Usage

1. Open any XML file.
2. Trigger the sorting using one of the following methods:
   * **Context Menu:** Right-click in the editor and select **"Smart XML Sorter: Sort XML"** (or **"Smart XML Sorter: XML sortieren"** in a German IDE locale).
   * **Keyboard Shortcut:** Press `Cmd+Alt+X` (macOS) or `Ctrl+Alt+X` (Windows/Linux).
   * **Command Palette:** Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for **"Smart XML Sorter: Sort XML"** (or **"Smart XML Sorter: XML sortieren"**).

## Example

### Before

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <zebra z="1" a="2"/>
    <!-- User B comment -->
    <item role="admin" id="b">
        <setting name="theme" value="dark"/>
        <setting name="lang" value="en"/>
    </item>
    <!-- User A comment -->
    <item id="a" role="user"/>
    <apple/>
</configuration>
```

### After

```xml
<?xml version='1.0' encoding='utf-8'?>
<configuration>
    <apple />
    <!-- User A comment -->
    <item id="a" role="user" />
    <!-- User B comment -->
    <item id="b" role="admin">
        <setting name="lang" value="en" />
        <setting name="theme" value="dark" />
    </item>
    <zebra a="2" z="1" />
</configuration>
```

## Configuration

You can customize the following settings in your VS Code (fork) settings:

* `xmlSorter.indent`: Number of spaces for indentation (Default: `4`).
* `xmlSorter.sortKeys`: A comma-separated priority list of attributes used to distinguish identical tags (Default: `"id,name,key"`).
* `xmlSorter.pythonPath`: Optional path to the Python interpreter (e.g., `/usr/bin/python3` or `C:\Python\python.exe`). When empty, Python is automatically searched in the system `PATH`.

## Changelog

### [1.2.1](https://github.com/vjanzen/smart-xml-sorter/compare/v1.2.0...v1.2.1) (2026-11-14)

#### Bug Fixes

* configure Gemini as co-author and committer for automated releases ([cabadf2](https://github.com/vjanzen/smart-xml-sorter/commit/cabadf2f6a1c1aaf0d1faae2219198f0e375ca27))

### [1.2.0](https://github.com/vjanzen/smart-xml-sorter/compare/v1.1.0...v1.2.0) (2026-11-14)

#### Features

* add bilingual localization (EN/DE), unit tests, and automated VSIX packaging ([d35df9d](https://github.com/vjanzen/smart-xml-sorter/commit/d35df9dd8c1f8fea9db222da877e920207c9752d))

### [1.1.0](https://github.com/vjanzen/smart-xml-sorter/compare/v1.0.0...v1.1.0) (2026-06-16)

#### Features

* add custom python path configuration and improve robust cross-platform execution with UTF-8 encoding support ([e064e4c](https://github.com/vjanzen/smart-xml-sorter/commit/e064e4c05505535db1ec80899c4374dd150b58e))

### 1.0.0 (2026-05-28)

#### Bug Fixes

* clarify that configuration applies to the fork in README ([39af09c](https://github.com/vjanzen/smart-xml-sorter/commit/39af09c111aa00587a61834775c9e43af07a8d27))

### 0.0.1 (2026-05-27)

#### Features

* Initial release of Smart XML Sorter.
* Recursive XML sorting by tags and attributes with configurable secondary sort keys (`id,name,key`).
* Preservation of XML comments and namespace prefixes.

## CLI & Development

For standalone command-line usage (`xml_sorter.py`) and instructions on building and testing from source, see [DEVELOPMENT.md](DEVELOPMENT.md).

## License

MIT License
