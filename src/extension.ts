// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function send_context() {
	console.log('Vooshi: polling');
	vscode.window.showInformationMessage('Vooshi: polling');

	const editor = vscode.window.activeTextEditor;
	if (!editor) {return;}

	const doc = editor.document;
	const cursor = editor.selection.active;

	// --- Step 1: get the context ---
	// For simplicity get +/- 3 lines
	const startLine = Math.max(cursor.line - 3, 0);
	const endLine = Math.min(cursor.line + 3, doc.lineCount - 1);

	const snippet = doc.getText(
		new vscode.Range(startLine, 0, endLine, doc.lineAt(endLine).text.length)
	);

	// Relative cursor
	const relativeCursor = {
		line: cursor.line - startLine,
		character: cursor.character,
	};

	// --- Step 2: Send to endpoint ---
	fetch("http://localhost:5000/analyze", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			filename: doc.fileName,
			snippet,
			relativeCursor,
		}),
	}).catch(err => console.error("Failed to send snippet:", err));
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Vooshi is now active, configure your config file first to make this extension works!');

	// Poll every 20 seconds
	const interval = setInterval(() => {

	}, 5000);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vooshi.sendSnippet', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		send_context();
	});

	

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
