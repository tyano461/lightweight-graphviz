import * as vscode from 'vscode'
import { IsDotFile, convertSVG } from './convert'
import * as fs from 'fs'
import { basename, dirname } from 'path'
import * as path from 'path'

/**
 * Provide File Exporting
 */
export class LWFileExport {
  private saving = false

  /**
   * Convert content written in graphviz format to SVG file and save it
   * @returns void
   */
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

  /**
   * get directory path for output
   * @param fname graphviz file path
   * @returns directory path to export
   */
  private ofdir (fname: string): string {
    const config = vscode.workspace.getConfiguration()
    let want = '../images/'
    let absolute = false
    if (config != null) {
      const srel: string | undefined = config.get('lightweight.output_directory')
      console.log('lightweight.output_directory:' + srel)
      if (srel != null && srel.length > 0) {
        absolute = path.isAbsolute(srel)
        want = srel
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
    console.log('out:' + d)

    return d
  }

  /**
   * get file name for export
   * @param fname graphviz file path
   * @returns output file name
   */
  private ofname (fname: string): string {
    return basename(fname, '.dot') + '.svg'
  }
}
