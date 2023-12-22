import * as vscode from 'vscode'

import { IsDotFile, convertSVG } from './convert'
import * as fs from 'fs'
import { basename, dirname } from 'path'
import * as path from 'path'

export class LWFileExport {
  private saving = false

  public Save (): void {
    const editor = vscode.window.activeTextEditor
    if (editor == null) {
      console.log('not exists active editor')
      this.saving = false
      return
    }

    const fname = editor.document.fileName
    if (!IsDotFile(fname)) {
      console.log('not graphviz file')
      this.saving = false
      return
    }

    if (this.saving) {
      return
    }
    this.saving = true
    convertSVG((err, svg) => {
      if (err == null) {
        const outfname = path.join(this.ofdir(fname), this.ofname(fname))
        fs.writeFile(outfname, svg, (err) => {
          if (err != null) {
            console.log('write file failed: ' + outfname)
          } else {
            void vscode.window.showInformationMessage('write to: ' + outfname)
          }
          this.saving = false
        })
      } else {
        console.log('convert error occured.')
        this.saving = false
      }
    })
  }

  private ofdir (fname: string): string {
    const config = vscode.workspace.getConfiguration()
    let want = '../images/'
    let absolute = false
    if (config != null) {
      const srel: string | undefined = config.get('lightweight.output_directory')
      if (srel != null && srel.length > 0) {
        absolute = path.isAbsolute(srel)
        if (absolute) {
          want = srel
        }
      }
    }
    if (absolute) return want

    const d = path.join(dirname(fname), want)
    if (!fs.existsSync(d)) {
      fs.mkdir(d, { recursive: true }, (err) => {
        if (err != null) {
          console.log('mkdir failed: ' + d)
        }
      })
    }

    return d
  }

  private ofname (fname: string): string {
    return basename(fname, '.dot') + '.svg'
  }
}
