'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const os = require("os");
const fs = require("fs");
//import {Trace} from 'vscode-jsonrpc';
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
let lc;
function activate(context) {
    // The server is a locally installed in src/mydsl
    let launcher = os.platform() === 'win32' ? 'start-ls-itlingo.bat' : 'start-ls-itlingo';
    let script = context.asAbsolutePath(path.join('src', 'mydsl', 'bin', launcher));
    console.log("SCRIPT");
    console.log(script);
    fs.chmod(script, "001", () => {
        let serverOptions = {
            run: { command: script, transport: node_1.TransportKind.socket },
            debug: { command: script, args: [], options: { env: createDebugEnv() } }
        };
        let clientOptions = {
            documentSelector: ['itlang'],
            synchronize: {
                fileEvents: vscode_1.workspace.createFileSystemWatcher('**/*.*')
            }
        };
        // Create the language client and start the client.
        lc = new node_1.LanguageClient('Xtext Server', serverOptions, clientOptions);
        var disposable2 = vscode_1.commands.registerCommand("itlang.a.proxy", () => __awaiter(this, void 0, void 0, function* () {
            let activeEditor = vscode_1.window.activeTextEditor;
            if (!activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'itlang') {
                return;
            }
            if (activeEditor.document.uri instanceof vscode_1.Uri) {
                vscode_1.commands.executeCommand("itlang.a", activeEditor.document.uri.toString());
            }
        }));
        context.subscriptions.push(disposable2);
        // enable tracing (.Off, .Messages, Verbose)
        //lc.trace = Trace.Verbose;
        lc.start();
        // Push the disposable to the context's subscriptions so that the 
        // client can be deactivated on extension deactivation
        //context.subscriptions.push(disposable);
    });
}
exports.activate = activate;
function deactivate() {
    if (!lc) {
        return undefined;
    }
    return lc.stop();
}
exports.deactivate = deactivate;
function createDebugEnv() {
    return Object.assign({
        JAVA_OPTS: "-Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n,quiet=y"
    }, process.env);
}
