import * as vscode from 'vscode'
import { convertSVG } from './convert'

/**
 * provide graphviz preview to side column
 */
export class LWPreview extends vscode.Disposable {
  private readonly panel: vscode.WebviewPanel | undefined
  private doing = false
  private valid = true

  /**
   * Set parameters to respond when the preview window is closed
   */
  public constructor () {
    super(() => { })
    this.panel = vscode.window.createWebviewPanel(
      'LWPreview',
      'Light-weight Graphviz Preview',
      vscode.ViewColumn.Two
    )
    this.panel.onDidDispose((_e) => {
      console.log('disposed')
      this.valid = false
    })

    vscode.workspace.onDidChangeTextDocument((_e) => {
      this.Refresh()
    })
    this.valid = true
    console.log('valid:' + this.valid)
  }

  /**
   * whether preview window is available
   * @returns available or not
   */
  public IsValid (): boolean {
    return this.valid
  }

  /**
   * Update Preview Window
   * @returns void
   */
  public Refresh (): void {
    if (this.doing) {
      console.log('doing')
      return
    }
    if (!this.valid) {
      console.log('valid:' + this.valid)
      return
    }

    this.doing = true
    if (this.panel != null) {
      convertSVG((err, s) => {
        if (err == null && this.panel != null && this.valid) {
          this.panel.webview.html = s
        } else {
          console.log('err:' + err?.message + ' v:' + this.valid)
        }
        this.doing = false
      })
    } else {
      console.log('panel is null')
      this.doing = false
    }
  }
}
