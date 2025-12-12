// src/services/extensionBridge.ts
interface ExtensionMessage {
  type: 'PAGE_CAPTURE' | 'STATUS_UPDATE' | 'GET_RESEARCH_MODE_STATUS' | 'RESEARCH_MODE_TOGGLE' | 'PAGE_CAPTURE_REQUEST' | 'PAGE_CAPTURE_RESPONSE' | 'EXTENSION_TEST' | 'EXTENSION_TEST_RESPONSE';
  payload: any;
}

export class ExtensionBridge {
  private isExtensionInstalled: boolean = false;
  private extensionId?: string;

  constructor(extensionId?: string) {
    this.extensionId = extensionId;
    this.checkExtension();
  }

  private async checkExtension() {
    try {
      this.isExtensionInstalled = await this.testExtensionConnection();
    } catch {
      this.isExtensionInstalled = false;
    }
  }

  private async testExtensionConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const testMessage = { type: 'EXTENSION_TEST' };
      const responseHandler = (event: MessageEvent) => {
        if (event.source === window && 
            event.data.type === 'EXTENSION_TEST_RESPONSE') {
          window.removeEventListener('message', responseHandler);
          resolve(true);
        }
      };

      window.addEventListener('message', responseHandler);
      window.postMessage(testMessage, '*');

      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve(false);
      }, 500);
    });
  }

  async captureCurrentPage(): Promise<{
    title: string;
    url: string;
    content: string;
    html?: string;
  } | null> {
    if (!this.isExtensionInstalled) {
      return this.captureLocalPage();
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();
      const message: ExtensionMessage = {
        type: 'PAGE_CAPTURE_REQUEST',
        payload: { requestId }
      };

      const responseHandler = (event: MessageEvent) => {
        if (event.source === window && 
            event.data.type === 'PAGE_CAPTURE_RESPONSE' &&
            event.data.payload?.requestId === requestId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.payload.data);
        }
      };

      window.addEventListener('message', responseHandler);
      this.sendToExtension(message);

      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve(this.captureLocalPage());
      }, 2000);
    });
  }

  private captureLocalPage() {
    return {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText.substring(0, 5000),
      html: document.documentElement.innerHTML
    };
  }

  listenForExtensionMessages(callback: (message: ExtensionMessage) => void) {
    window.addEventListener('message', (event) => {
      if (event.source === window && 
          event.data.type &&
          (event.data.type.startsWith('TASKOSCOPE_') || event.data.type.endsWith('_RESPONSE') || event.data.type === 'RESEARCH_MODE_TOGGLE')) {
        callback(event.data);
      }
    });
  }

  sendToExtension(message: ExtensionMessage) {
    window.postMessage({
      ...message,
      source: 'taskoscope-webpage'
    }, '*');
  }

  async checkResearchModeStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      const requestId = Date.now().toString();
      const message: ExtensionMessage = {
        type: 'GET_RESEARCH_MODE_STATUS',
        payload: { requestId }
      };

      const responseHandler = (event: MessageEvent) => {
        if (event.source === window && 
            event.data.type === 'RESEARCH_MODE_STATUS' &&
            event.data.payload?.requestId === requestId) {
          window.removeEventListener('message', responseHandler);
          resolve(event.data.payload.active);
        }
      };

      window.addEventListener('message', responseHandler);
      this.sendToExtension(message);

      setTimeout(() => {
        window.removeEventListener('message', responseHandler);
        resolve(false);
      }, 1000);
    });
  }
}

export const extensionBridge = new ExtensionBridge();

export function listenForResearchModeToggle(callback: (active: boolean) => void) {
  window.addEventListener('message', (event) => {
    if (event.source === window && event.data.type === 'RESEARCH_MODE_TOGGLE') {
      callback(event.data.payload.active);
    }
  });

  extensionBridge.checkResearchModeStatus().then(callback);
}
