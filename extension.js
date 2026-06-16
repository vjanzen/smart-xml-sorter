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
        const pythonPath = config.get('pythonPath', '');

        const args = [
            pythonScriptPath,
            '-', // Read from stdin
            '--indent', indent.toString(),
            '--sort-keys', sortKeys
        ];

        // Determine list of commands to try
        let commandsToTry = [];
        if (pythonPath && pythonPath.trim()) {
            commandsToTry.push(pythonPath.trim());
        }
        if (process.platform === 'win32') {
            commandsToTry.push('python', 'python3', 'py');
        } else {
            commandsToTry.push('python3', 'python');
        }

        function trySpawnPython(commands) {
            return new Promise((resolve, reject) => {
                if (commands.length === 0) {
                    return reject(new Error('Kein Python-Interpreter im System-PATH gefunden. Bitte installieren Sie Python 3 und stellen Sie sicher, dass es in Ihrem PATH verfügbar ist oder konfigurieren Sie den Pfad in den Einstellungen ("xmlSorter.pythonPath").'));
                }

                const cmd = commands[0];
                let childProcess;
                try {
                    childProcess = cp.spawn(cmd, args, {
                        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
                    });
                } catch (err) {
                    // Try next command immediately if synchronous launch fails
                    return resolve(trySpawnPython(commands.slice(1)));
                }

                let stdout = '';
                let stderr = '';
                let isFallbackTriggered = false;

                childProcess.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                childProcess.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                childProcess.on('error', (err) => {
                    if (err.code === 'ENOENT') {
                        isFallbackTriggered = true;
                        resolve(trySpawnPython(commands.slice(1)));
                    } else {
                        reject(err);
                    }
                });

                childProcess.on('close', (code) => {
                    if (isFallbackTriggered) {
                        return;
                    }
                    if (code === 0) {
                        resolve(stdout);
                    } else {
                        const errMsg = stderr.trim() || `Prozess beendet mit Code ${code}`;
                        reject(new Error(errMsg));
                    }
                });

                childProcess.stdin.on('error', (err) => {
                    if (!isFallbackTriggered) {
                        console.error('Python stdin error:', err);
                    }
                });

                try {
                    childProcess.stdin.write(xmlText);
                    childProcess.stdin.end();
                } catch (err) {
                    if (!isFallbackTriggered) {
                        reject(err);
                    }
                }
            });
        }

        trySpawnPython(commandsToTry)
            .then((sortedXml) => {
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
            })
            .catch((err) => {
                vscode.window.showErrorMessage(`Fehler beim Sortieren des XML: ${err.message}`);
            });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
