const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('smart-xml-sorter.sortActiveEditor', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Kein aktiver Editor geöffnet.');
            return;
        }

        const document = editor.document;
        // Verify it is XML
        if (document.languageId !== 'xml') {
            vscode.window.showWarningMessage('Das aktuelle Dokument ist keine XML-Datei.');
            return;
        }

        const xmlText = document.getText();
        if (!xmlText.trim()) {
            vscode.window.showWarningMessage('Das XML-Dokument ist leer.');
            return;
        }

        const pythonScriptPath = path.join(__dirname, 'xml_sorter.py');

        // Fetch user configurations
        const config = vscode.workspace.getConfiguration('xmlSorter');
        const indent = config.get('indent', 4);
        const sortKeys = config.get('sortKeys', 'id,name,key');

        const args = [
            pythonScriptPath,
            '-', // Read from stdin
            '--indent', indent.toString(),
            '--sort-keys', sortKeys
        ];

        // Spawn Python process
        const process = cp.spawn('python3', args);

        let sortedXml = '';
        let errorMsg = '';

        process.stdout.on('data', (data) => {
            sortedXml += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorMsg += data.toString();
        });

        process.on('error', (err) => {
            vscode.window.showErrorMessage(
                `Konnte das Python-Skript nicht ausführen. Bitte stellen Sie sicher, dass Python 3 ('python3') auf Ihrem System installiert und im PATH verfügbar ist. Fehler: ${err.message}`
            );
        });

        process.on('close', (code) => {
            if (code === 0) {
                // Apply the sorted XML back to the active editor
                editor.edit((editBuilder) => {
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(xmlText.length)
                    );
                    editBuilder.replace(fullRange, sortedXml);
                }).then((success) => {
                    if (success) {
                        vscode.window.showInformationMessage('XML erfolgreich sortiert und formatiert.');
                    } else {
                        vscode.window.showErrorMessage('Fehler beim Aktualisieren des Editors.');
                    }
                });
            } else {
                vscode.window.showErrorMessage(`Fehler beim Sortieren des XML: ${errorMsg || 'Unbekannter Python-Fehler.'}`);
            }
        });

        // Write active document content to Python's stdin
        process.stdin.write(xmlText);
        process.stdin.end();
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
