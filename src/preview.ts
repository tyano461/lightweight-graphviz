import * as vscode from 'vscode'
import { convertSVG } from './convert'

const prefix: string = `
<script>
    document.addEventListener('DOMContentLoaded', () => {
        let isDragging = false;
        let startDragX = 0;
        let startDragY = 0;
        let currentY = 0;
        let currentX = 0;
        let ow = 0;
        let oh = 0;
        let width = 0;
        let height = 0;
        let zoom = 1;

        const margin = 20;
        const currentSvg = document.querySelector('svg');
        const viewBox = currentSvg.getAttribute('viewBox') || '0 0 100 100';
        const [x, y, w, h] = viewBox.split(' ').map(Number);
        width = w;
        height = h;
        ow = width;
        oh = height;

        document.addEventListener('mousedown', (e) => {
            isDragging = true;
            startDragX = e.clientX;
            startDragY = e.clientY;
            const viewBox2 = currentSvg.getAttribute('viewBox') || '0 0 100 100';
            const [x2, y2, w2, h2] = viewBox2.split(' ').map(Number);
            currentX = -1 * x2;
            currentY = -1 * y2;
            console.log("cx/cy:"+ currentX + "/" + currentY);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = (e.clientX - startDragX);
                const deltaY = (e.clientY - startDragY);
//                console.log("dx/dy:" + deltaX + "/" + deltaY);
                let y = deltaY + currentY;
                let x = deltaX + currentX;
                if (y < (-1 * height * zoom) + margin) {
                    y = (-1 * height * zoom) + margin;
                }
                if (y > (height * zoom) - margin) {
                    y = (height * zoom) - margin;
                }
                if (x < (-1 * width * zoom) + margin) {
                    x = (-1 * width * zoom) + margin;
                }
                if (x > (width * zoom) - margin) {
                    x = (width * zoom) - margin;
                }
                currentSvg.setAttribute('viewBox', "" + (-1 * x / zoom) + " " + (-1 * y / zoom) + " " + width + " " + height)
            }
        });

        document.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                if (e.deltaY < 0) {
                    zoom += 0.1;
                    if (zoom > 2.0) zoom = 2;
                    //console.log("zoom in:"+  e.deltaY);
                } else {
                    //console.log("zoom out:"+ e.deltaY);
                    zoom -= 0.1;
                    if (zoom < 0.5) zoom = 0.5;
                }
                currentSvg.setAttribute("width", "" + Math.floor(width * zoom) + "pt");
                currentSvg.setAttribute("height", "" + Math.floor(height * zoom) + "pt");
                vscode.postMessage({ command: "" + Math.floor(width * zoom) + "pt" });
            }
        });
    });
</script>
`

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
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    )
    this.panel.onDidDispose((_e) => {
      console.log('disposed')
      this.valid = false
    })

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        console.log('msg:' + message)
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
          this.panel.webview.html = prefix + s
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
