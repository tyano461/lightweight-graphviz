import * as vscode from 'vscode';
import { exec } from 'child_process'
import * as fs from 'fs'

let processing = false
const tmpdir = "/tmp/"
const tmpfile_prefix = "lw_preview-"

export function IsDotFile(f: string): Boolean {
    if (!f) return false
    if (f.length < 5) return false

    let suffix = f.substring(f.length - 4)
    return suffix == ".dot"
}

function getLWTempFileName(): string {
    return tmpdir + tmpfile_prefix + Math.random().toString(36).slice(-16);
}

export function convertSVG(cb: (success: Boolean, result: string) => void) {
    const options = { env: {} };
    let editor = vscode.window.activeTextEditor
    const tmpfilename = getLWTempFileName()
    if (!editor || !IsDotFile(editor.document.fileName)) {
        console.log("active editor is not dot file");
        return
    }
    let s = editor.document.getText()
    if (!processing) {
        processing = true;
        fs.writeFile(tmpfilename, s, (err) => {
            if (err) {
                cb(false, "")
                processing = false
            } else {
                let cmd = "dot -Tsvg " + tmpfilename
                exec(cmd, options, (error, stdout, stderr) => {
                    cb(true, stdout)
                    fs.rm(tmpfilename, () => { })
                    processing = false
                });
            }
        })
    }
}