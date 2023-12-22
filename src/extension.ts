// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { LWPreview } from './preview'
import { LWFileExport } from './fileexport'

/**
 * extension entry point
 * @param context extension context
 */
export function activate (context: vscode.ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "lightweight-graphviz" is now active!')
  let preview: LWPreview | null

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const previewCommand = vscode.commands.registerCommand('lightweight-graphviz.preview', () => {
    if (preview == null || !preview.IsValid()) {
      preview = new LWPreview()
    }
    preview.Refresh()
  })
  const exportCommand = vscode.commands.registerCommand('lightweight-graphviz.export', () => {
    const fileexport = new LWFileExport()
    fileexport.Save()
  })

  context.subscriptions.push(previewCommand)
  context.subscriptions.push(exportCommand)
}

/**
 * do nothing
 */
export function deactivate (): void { }
