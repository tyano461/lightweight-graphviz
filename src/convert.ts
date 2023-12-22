import * as vscode from 'vscode'
import { exec } from 'child_process'
import * as fs from 'fs'

let processing = false
const tmpdir = '/tmp/'
const tmpfilePrefix = 'lw_preview-'

export function IsDotFile (f: string): boolean {
  if (f.length < 5) return false

  const suffix = f.substring(f.length - 4)
  return suffix === '.dot'
}

function getLWTempFileName (): string {
  return tmpdir + tmpfilePrefix + Math.random().toString(36).slice(-16)
}

function getDotPath (): string {
  const path = 'dot'
  const config = vscode.workspace.getConfiguration()
  if (config == null) {
    return path
  }

  const spath: string | undefined = config.get('lightweight.graphviz_path')

  if (spath != null && spath.length > 0) {
    if (fs.existsSync(path)) {
      return spath
    }
  }
  return path
}

export function convertSVG (cb: (err: Error | null, result: string) => void): void {
  const options = { env: {} }
  const editor = vscode.window.activeTextEditor
  const tmpfilename = getLWTempFileName()
  if (editor == null || !IsDotFile(editor.document.fileName)) {
    console.log('active editor is not dot file')
    return
  }

  const dot = getDotPath()
  const s = editor.document.getText()

  if (!processing) {
    processing = true
    fs.writeFile(tmpfilename, s, (err) => {
      if (err != null) {
        cb(new Error(), tmpfilename)
        processing = false
      } else {
        const cmd = dot + ' -Tsvg ' + tmpfilename
        exec(cmd, options, (error, stdout, stderr) => {
          if (error != null) {
            console.log('stderr:' + stderr)
          }
          cb(null, stdout)
          fs.rm(tmpfilename, () => { })
          processing = false
        })
      }
    })
  }
}
