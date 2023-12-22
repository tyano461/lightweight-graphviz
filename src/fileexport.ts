import * as vscode from 'vscode'

import { IsDotFile, convertSVG } from "./convert";
import * as fs from 'fs'
import { basename, dirname } from 'path';

const FILESEPARATOR = "/"

export class LWFileExport {

    private saving = false
    public Save() {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.log("not exists active editor")
            this.saving = false
            return;
        }

        let fname = editor.document.fileName
        if (!IsDotFile(fname)) {
            console.log("not graphviz file")
            this.saving = false
            return;
        }

        if (this.saving) {
            return;
        }
        this.saving = true
        convertSVG((ret, svg) => {
            if (ret) {
                let outfname = this.ofdir(fname) + FILESEPARATOR + this.ofname(fname)
                fs.writeFile(outfname, svg, (err) => {
                    if (err) {
                        console.log("write file failed: " + outfname)
                    } else {
                        vscode.window.showInformationMessage("write to: " + outfname)
                    }
                    this.saving = false
                })
            } else {
                console.log("convert error occured.")
                this.saving = false
            }
        })
    }

    private ofdir(fname: string): string {
        let d = dirname(fname) + FILESEPARATOR + "images"
        if (!fs.existsSync(d)) {
            fs.mkdir(d, (err) => {
                console.log("mkdir failed: " + d)
            })
        }

        return d;
    }
    private ofname(fname: string): string {
        return basename(fname, ".dot") + ".svg"
    }
}