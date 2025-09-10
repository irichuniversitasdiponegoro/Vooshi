// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

async function getCurrentFunction(editor: vscode.TextEditor): Promise<{name: string, content: string} | null> {
    const document = editor.document;
    const position = editor.selection.active;
    
    // Ask VS Code for all symbols (functions, classes, etc.) in the file
    const symbols = await vscode.commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri
    ) as vscode.DocumentSymbol[] | undefined;
    
    if (!symbols || symbols.length === 0) {
        return null; // No symbols found
    }
    
    // Find which function contains our cursor
    const containingFunction = findContainingSymbol(symbols, position);
    
    if (!containingFunction) {
        return null; // Cursor is not inside any function
    }
    
    // Check if function is reasonable size (not too big)
    const functionLines = containingFunction.range.end.line - containingFunction.range.start.line;
    if (functionLines > 50) {
        console.log(`Function ${containingFunction.name} is too big (${functionLines} lines), skipping`);
        return null;
    }
    
    // Get the function content
    const functionContent = document.getText(containingFunction.range);
    
    return {
        name: containingFunction.name,
        content: functionContent
    };
}

// Helper: Find which symbol (function) contains the cursor position
function findContainingSymbol(symbols: vscode.DocumentSymbol[], position: vscode.Position): vscode.DocumentSymbol | null {
    for (const symbol of symbols) {
        // Check if position is inside this symbol's range
        if (symbol.range.contains(position)) {
            
            // If this symbol has children (like a class with methods), check them first
            if (symbol.children && symbol.children.length > 0) {
                const childSymbol = findContainingSymbol(symbol.children, position);
                if (childSymbol) {
                    return childSymbol; // Return the most specific (inner) symbol
                }
            }
            
            // Only return functions/methods, not classes or variables
            if (symbol.kind === vscode.SymbolKind.Function || 
                symbol.kind === vscode.SymbolKind.Method) {
                return symbol;
            }
        }
    }
    return null;
}

async function send_context() {
	console.log('Vooshi: polling');
	vscode.window.showInformationMessage('Vooshi: polling');

	const editor = vscode.window.activeTextEditor;
	if (!editor) {return;}

	const doc = editor.document;
	const cursor = editor.selection.active;

	const functionContent = await getCurrentFunction(editor)
	const startLine = Math.max(cursor.line - 3, 0);
	const endLine = Math.min(cursor.line + 3, doc.lineCount - 1);

	let snippet
	let isFunction

	// Is inside a function ?
	if (functionContent) {
		// yes -> sned
		snippet = functionContent.content
		isFunction = true
	} else {
	// --- Step 1: get the context ---
	// For simplicity get +/- 3 lines
		snippet = doc.getText(
			new vscode.Range(startLine, 0, endLine, doc.lineAt(endLine).text.length));
		isFunction = false
	}
	// Relative cursor
	const relativeCursor = {
		line: cursor.line - startLine,
		character: cursor.character,
	};

	// --- Step 2: Send to endpoint ---
	fetch("http://localhost:3000/analyze", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			filename: doc.fileName,
			snippet,
			relativeCursor,
			isFunction,
		}),
	}).catch(err => console.error("Failed to send snippet:", err));

	console.log(doc.fileName)
	console.log(snippet)
	console.log(relativeCursor)
	console.log("isFunction : ", isFunction)
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once whenc your extension is activated
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
