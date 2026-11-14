# Smart XML Sorter – CLI Usage & Development Guide

This document covers standalone command-line usage of `xml_sorter.py` as well as building and testing the VS Code / Antigravity extension from source.

## Standalone CLI Usage

You can use the bundled `xml_sorter.py` script directly from the terminal without the IDE extension:

```bash
# Sort a file and print to stdout
python3 xml_sorter.py input.xml

# Sort a file in-place
python3 xml_sorter.py input.xml --in-place

# Sort to a new output file with custom indentation and sort keys
python3 xml_sorter.py input.xml -o output.xml --indent 2 --sort-keys "key,id,name"

# Read from stdin and write to stdout
cat input.xml | python3 xml_sorter.py -
```

### CLI Options

| Option | Default | Description |
| :--- | :--- | :--- |
| `input_file` | `-` (stdin) | Input XML file path (or `-` to read from `stdin`). |
| `-o`, `--output <file>` | `stdout` | Write sorted XML to the specified file path. |
| `--in-place` | `false` | Modify the input file in-place (cannot be used with `stdin`). |
| `-i`, `--indent <int>` | `4` | Number of spaces used for indentation. |
| `--sort-keys <keys>` | `"id,name,key"` | Comma-separated priority list of attributes used to break ties between identical tags. |

## Building & Testing from Source

### Prerequisites

* **Python 3** (`python3` in system `PATH`)
* **Node.js** (v22+) and npm

### Running Unit Tests

```bash
npm test
```

### Packaging the VSIX Extension

```bash
npm install
npm run package
```

This synchronizes the `## Changelog` section in `README.md` from `CHANGELOG.md` and generates `dist/smart-xml-sorter.vsix`.
