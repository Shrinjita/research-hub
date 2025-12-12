/**
 * Extension Messaging Stubs for Taskoscope
 * 
 * This module provides:
 * 1. Simulated extension messaging for prototype demos
 * 2. Real extension contract documentation for future implementation
 * 
 * Communication Channel: "taskoscope-extension"
 */

// Message Types
export const MESSAGE_TYPES = {
  SEND_PAGE: 'SEND_PAGE',
  CAPTURE_CITATION: 'CAPTURE_CITATION',
  TAB_LIST: 'TAB_LIST',
  PING: 'PING',
  PONG: 'PONG',
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

// Message Interfaces
export interface SendPageMessage {
  type: typeof MESSAGE_TYPES.SEND_PAGE;
  payload: {
    url: string;
    title: string;
    html: string;
    favicon?: string;
  };
}

export interface CaptureCitationMessage {
  type: typeof MESSAGE_TYPES.CAPTURE_CITATION;
  payload: {
    url: string;
    selectionText?: string;
    title?: string;
  };
}

export interface TabListMessage {
  type: typeof MESSAGE_TYPES.TAB_LIST;
  payload: {
    tabs: Array<{
      id: number;
      title: string;
      url: string;
      favicon?: string;
    }>;
  };
}

export type ExtensionMessage = SendPageMessage | CaptureCitationMessage | TabListMessage;

// Stub implementation for demo
class ExtensionStub {
  private listeners: Map<MessageType, ((message: ExtensionMessage) => void)[]> = new Map();
  
  /**
   * Register a listener for extension messages
   */
  onMessage(type: MessageType, callback: (message: ExtensionMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }
  
  /**
   * Remove a listener
   */
  offMessage(type: MessageType, callback: (message: ExtensionMessage) => void) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  /**
   * Simulate sending a message (for demo purposes)
   */
  private emit(message: ExtensionMessage) {
    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(message));
    }
  }
  
  /**
   * Demo: Simulate sending current page to Research Mode
   */
  simulateSendCurrentPage() {
    const message: SendPageMessage = {
      type: MESSAGE_TYPES.SEND_PAGE,
      payload: {
        url: 'https://en.wikipedia.org/wiki/Machine_learning',
        title: 'Machine learning - Wikipedia',
        html: '<html><body>Machine learning (ML) is a field devoted to understanding and building methods...</body></html>',
        favicon: 'https://www.wikipedia.org/favicon.ico',
      },
    };
    this.emit(message);
    console.log('[ExtensionStub] Simulated SEND_PAGE:', message.payload.title);
    return message;
  }
  
  /**
   * Demo: Simulate citation capture request
   */
  simulateCaptureCitation(selectionText?: string) {
    const message: CaptureCitationMessage = {
      type: MESSAGE_TYPES.CAPTURE_CITATION,
      payload: {
        url: window.location.href,
        selectionText: selectionText || 'Selected text from the page would appear here.',
        title: document.title,
      },
    };
    this.emit(message);
    console.log('[ExtensionStub] Simulated CAPTURE_CITATION');
    return message;
  }
  
  /**
   * Demo: Simulate tab list from extension
   */
  simulateTabList() {
    const message: TabListMessage = {
      type: MESSAGE_TYPES.TAB_LIST,
      payload: {
        tabs: [
          { id: 1, title: 'Google Scholar', url: 'https://scholar.google.com', favicon: 'https://scholar.google.com/favicon.ico' },
          { id: 2, title: 'arXiv.org', url: 'https://arxiv.org', favicon: 'https://arxiv.org/favicon.ico' },
          { id: 3, title: 'Nature', url: 'https://www.nature.com', favicon: 'https://www.nature.com/favicon.ico' },
        ],
      },
    };
    this.emit(message);
    console.log('[ExtensionStub] Simulated TAB_LIST with', message.payload.tabs.length, 'tabs');
    return message;
  }
}

// Singleton instance
export const extensionStub = new ExtensionStub();

/**
 * Real Extension Contract
 * 
 * When implementing the actual browser extension, use these patterns:
 * 
 * Content Script (content.js):
 * ```javascript
 * // Listen for messages from the extension popup
 * chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
 *   if (message.type === 'GET_PAGE_INFO') {
 *     sendResponse({
 *       url: window.location.href,
 *       title: document.title,
 *       html: document.documentElement.outerHTML,
 *     });
 *   }
 * });
 * 
 * // Send selected text to Taskoscope
 * document.addEventListener('mouseup', () => {
 *   const selection = window.getSelection().toString();
 *   if (selection && selection.length > 10) {
 *     window.postMessage({
 *       channel: 'taskoscope-extension',
 *       type: 'CAPTURE_CITATION',
 *       payload: { url: window.location.href, selectionText: selection }
 *     }, '*');
 *   }
 * });
 * ```
 * 
 * Web App Listener:
 * ```javascript
 * window.addEventListener('message', (event) => {
 *   if (event.data?.channel === 'taskoscope-extension') {
 *     handleExtensionMessage(event.data);
 *   }
 * });
 * ```
 */

// Helper to check if real extension is installed
export function isExtensionInstalled(): boolean {
  // Check for extension-injected element or global
  return !!(window as any).__TASKOSCOPE_EXTENSION__;
}

// Export default for convenience
export default extensionStub;
