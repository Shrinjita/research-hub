// src/services/extensionBridge.ts
interface ExtensionMessage {
  type: 'PAGE_CAPTURE' | 'STATUS_UPDATE';
  payload: any;
}

export class ExtensionBridge {
  private isExtensionInstalled: boolean = false;

  constructor() {
    this.checkExtension();
  }

  private async checkExtension() {
    // Check if extension is available
    try {
      // This would be the actual extension ID in production
      this.isExtensionInstalled = false; // TODO: Implement actual check
    } catch {
      this.isExtensionInstalled = false;
    }
  }

  async captureCurrentPage(): Promise<{
    title: string;
    url: string;
    content: string;
    html?: string;
  } | null> {
    if (!this.isExtensionInstalled) {
      console.warn('Extension not installed');
      return null;
    }

    // In a real implementation, this would communicate with the extension
    // For now, return mock data
    return {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText.substring(0, 5000),
      html: document.documentElement.innerHTML
    };
  }

  listenForExtensionMessages(callback: (message: ExtensionMessage) => void) {
    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      if (event.source === window && event.data.type?.startsWith('TASKOSCOPE_')) {
        callback(event.data);
      }
    });
  }

  sendToExtension(message: ExtensionMessage) {
    window.postMessage(message, '*');
  }
}

export const extensionBridge = new ExtensionBridge();