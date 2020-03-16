// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// Importing reuired modules. Unirest for API calling and Clipboardy for copy results in clipboard.
const unirest = require("unirest");
const clipboardy = require('clipboardy');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Jaspex" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let generateApexFromSelectedText = vscode.commands.registerCommand('extension.generateapex', function() {

        const editor = vscode.window.activeTextEditor; // Getting selected Text JSON 
        const jsonBody = editor.document.getText(editor.selection);
        getJsonFromJASPEX(jsonBody, false);

    });

    let generateApexFromCopiedText = vscode.commands.registerCommand('extension.generateapexfromcopy', function() {
        vscode.env.clipboard.readText().then((text) => {
            getJsonFromJASPEX(text, false);
        });
    });

    let generateApexFromSelectedQuotedText = vscode.commands.registerCommand('extension.generateapexfromquotedjson', function() {
        const editor = vscode.window.activeTextEditor; // Getting selected Text JSON 
        const jsonBody = editor.document.getText(editor.selection);
        getJsonFromJASPEX(jsonBody, true);
    });

    let generateApexFromCopiedQuotedText = vscode.commands.registerCommand('extension.generateapexfromcopiedquotedjson', function() {
        vscode.env.clipboard.readText().then((text) => {
            getJsonFromJASPEX(text, true);
        });
    });

    context.subscriptions.push(generateApexFromSelectedText,
        generateApexFromCopiedText,
        generateApexFromSelectedQuotedText,
        generateApexFromCopiedQuotedText);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function getJsonFromJASPEX(jsonBody, quoted) {
    // Setting Endpoint to JASPEX api.
    var req = unirest("GET", "https://jaspex.herokuapp.com/api/generateApexAPI")

    req.headers({
        "cache-control": "no-cache",
        "Content-Type": "application/json"
    });

    // Setting API Body with the copied JSON response
    req.send({ "Body": jsonBody, "quoted": quoted })

    // Progress showing notification
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Creating APEX code.",
        cancellable: false
    }, () => {

        var p = new Promise(resolve => {
            req.end(function(res) {
                if (res.error) throw new Error(res.error)
                const msg = res.body;
                if (msg == 'Error in Json decoding, please check.') {
                    vscode.window.showErrorMessage(msg); // IF failed set the Error msg.
                } else {
                    clipboardy.writeSync(msg); // If success copy the API returned code in
                    vscode.window.showInformationMessage('Apex generator created successfully \n and copied to clip board.');
                }
                resolve(); // Return resolve after api Calling.
            })
        });
        return p;
    });

}
module.exports = {
    activate,
    deactivate
}