const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

const MESSAGES = {
    en: {
        noActiveEditor: 'No active editor open.',
        notXmlDocument: 'The current document is not an XML file.',
        emptyXmlDocument: 'The XML document is empty.',
        noPythonFound:
            'No Python interpreter found in system PATH. Please install Python 3 and ensure it is available in your PATH, or configure the path in settings ("xmlSorter.pythonPath").',
        processExitedWithCode: (code) => `Process exited with code ${code}`,
        sortSuccess: 'XML successfully sorted and formatted.',
        editorUpdateError: 'Failed to update the editor.',
        sortError: (msg) => `Error sorting XML: ${msg || 'Unknown Python error.'}`
    },
    de: {
        noActiveEditor: 'Kein aktiver Editor geöffnet.',
        notXmlDocument: 'Das aktuelle Dokument ist keine XML-Datei.',
        emptyXmlDocument: 'Das XML-Dokument ist leer.',
        noPythonFound:
            'Kein Python-Interpreter im System-PATH gefunden. Bitte installieren Sie Python 3 und stellen Sie sicher, dass es in Ihrem PATH verfügbar ist oder konfigurieren Sie den Pfad in den Einstellungen ("xmlSorter.pythonPath").',
        processExitedWithCode: (code) => `Prozess beendet mit Code ${code}`,
        sortSuccess: 'XML erfolgreich sortiert und formatiert.',
        editorUpdateError: 'Fehler beim Aktualisieren des Editors.',
        sortError: (msg) => `Fehler beim Sortieren des XML: ${msg || 'Unbekannter Python-Fehler.'}`
    }
};

function getMessages() {
    const lang = (vscode.env && vscode.env.language) ? vscode.env.language.toLowerCase() : 'en';
    return lang.startsWith('de') ? MESSAGES.de : MESSAGES.en;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('smart-xml-sorter.sortActiveEditor', () => {
        const msg = getMessages();
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage(msg.noActiveEditor);
            return;
        }

        const document = editor.document;
        // Verify it is XML
        if (document.languageId !== 'xml') {
            vscode.window.showWarningMessage(msg.notXmlDocument);
            return;
        }

        const xmlText = document.getText();
        if (!xmlText.trim()) {
            vscode.window.showWarningMessage(msg.emptyXmlDocument);
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
                    return reject(new Error(msg.noPythonFound));
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

                childProcess.stdout.setEncoding('utf8');
                childProcess.stderr.setEncoding('utf8');

                let stdout = '';
                let stderr = '';
                let isFallbackTriggered = false;

                childProcess.stdout.on('data', (data) => {
                    stdout += data;
                });

                childProcess.stderr.on('data', (data) => {
                    stderr += data;
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
                        const errMsg = stderr.trim() || msg.processExitedWithCode(code);
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
                        vscode.window.showInformationMessage(msg.sortSuccess);
                    } else {
                        vscode.window.showErrorMessage(msg.editorUpdateError);
                    }
                });
            })
            .catch((err) => {
                vscode.window.showErrorMessage(msg.sortError(err.message));
            });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
