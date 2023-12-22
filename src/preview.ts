import * as vscode from 'vscode';
import { convertSVG } from './convert';



export class LWPreview extends vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined
    private doing = false;
    private valid = true;

    public constructor() {

        super(() => this.valid = false)

        this.panel = vscode.window.createWebviewPanel(
            "LWPreview",
            "Light-weight Graphviz Preview",
            vscode.ViewColumn.Two
        );
        this.panel.onDidDispose((_e) => this.valid = false)

        vscode.workspace.onDidChangeTextDocument((_e) => {
            this.Refresh();
        });
    }

    public IsValid() {
        return this.valid
    }
    public Refresh() {
        if (this.doing) return;

        this.doing = true;
        if (this.panel) {
            convertSVG((ret, s) => {
                if (ret && this.panel && this.valid) {
                    this.panel.webview.html = s
                }
                this.doing = false;
            })
        } else {
            this.doing = false;
        }
    }
}