'use strict';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

//import {Trace} from 'vscode-jsonrpc';
import { commands, window, workspace, ExtensionContext, Uri } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let lc: LanguageClient;

export function activate(context: ExtensionContext) {
    // The server is a locally installed in src/mydsl
    
    let launcher = os.platform() === 'win32' ? 'start-ls-itlingo.bat' : 'start-ls-itlingo';
    let script = context.asAbsolutePath(path.join('src', 'mydsl', 'bin', launcher));
    console.log("SCRIPT");
    console.log(script);
    fs.chmod(script, "001", () => {
        let serverOptions: ServerOptions = {
            run : { command: script, transport: TransportKind.socket },
            debug: { command: script, args: [], options: { env: createDebugEnv() } }
        };
        
        let clientOptions: LanguageClientOptions = {
            documentSelector: ['itlang'],
            synchronize: {
                fileEvents: workspace.createFileSystemWatcher('**/*.*')
            }
        };
        
        // Create the language client and start the client.
        lc = new LanguageClient('Xtext Server', serverOptions, clientOptions);
        
        var disposable2 =commands.registerCommand("itlang.a.proxy", async () => {
            let activeEditor = window.activeTextEditor;
            if (!activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'itlang') {
                return;
            }
    
            if (activeEditor.document.uri instanceof Uri) {
                commands.executeCommand("itlang.a", activeEditor.document.uri.toString());
            }
        })
        context.subscriptions.push(disposable2);
        
        // enable tracing (.Off, .Messages, Verbose)
        //lc.trace = Trace.Verbose;
        
        lc.start();
        
        // Push the disposable to the context's subscriptions so that the 
        // client can be deactivated on extension deactivation
        //context.subscriptions.push(disposable);
    });

}

export function deactivate(): Thenable<void> | undefined {
    if (!lc) {
      return undefined;
    }
    return lc.stop();
}


function createDebugEnv() {
    return Object.assign({
        JAVA_OPTS:"-Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n,quiet=y"
    }, process.env)
}