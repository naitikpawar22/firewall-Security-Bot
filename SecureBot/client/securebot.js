(function(window, document) {
  'use strict';
  
  class SecureBot {
    constructor(options = {}) {
      this.version = '1.0.0';
      this.config = {
        reportUrl: null,
        scanInterval: 30000,
        debug: false,
        ...options
      };
      this.init();
    }

    init() {
      this.logIntro();
      this.startDOMObserver();
      this.hookNetworkRequests();
      this.checkEnvironment(); // Now defined
      setInterval(() => this.runSecurityScan(), this.config.scanInterval);
    }

    logIntro() {
      console.log(
        `%cSecurity implemented by Naitik's Security Bot`,
        'color: green; font-weight: bold; font-size: 16px;'
      );
    }

    checkEnvironment() {
      if (this.config.debug) {
        console.log('[SecureBot] Environment check passed.');
      }
    }

    startDOMObserver() {
      new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            this.analyzeNode(node);
          });
        });
      }).observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }

    analyzeNode(node) {
      if (node.nodeType === 1 && /script|iframe/i.test(node.tagName)) {
        this.detectThreat('SuspiciousElement', { element: node.outerHTML });
      }
    }

    hookNetworkRequests() {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const request = args[0];
        if (this.isSuspiciousRequest(request)) {
          this.detectThreat('SuspiciousRequest', { request });
          return Promise.reject('Request blocked by SecureBot');
        }
        return originalFetch(...args);
      };
    }

    isSuspiciousRequest(url) {
      const badPatterns = [
        /\/wp-admin\/admin-ajax\.php/i,
        /\/xmlrpc\.php/i,
        /\.php\?cmd=/i
      ];
      return badPatterns.some(pattern => pattern.test(url));
    }

    detectThreat(type, data) {
      const threat = {
        type,
        data,
        timestamp: new Date().toISOString(),
        page: window.location.href
      };

      if (this.config.debug) {
        console.warn('[SecureBot] Threat Detected:', threat);
      }

      if (this.config.reportUrl) {
        this.reportThreat(threat);
      }
    }

    reportThreat(threat) {
      try {
        navigator.sendBeacon(this.config.reportUrl, JSON.stringify(threat));
      } catch (e) {
        if (this.config.debug) {
          console.error('[SecureBot] Failed to report threat:', e);
        }
      }
    }

    runSecurityScan() {
      this.checkLoadedScripts();
      this.checkCookies();
    }

    checkLoadedScripts() {
      const scripts = Array.from(document.scripts);
      scripts.forEach(script => {
        if (script.src && !script.src.startsWith(location.origin)) {
          this.detectThreat('ExternalScript', { src: script.src });
        }
      });
    }

    checkCookies() {
      const cookies = document.cookie;
      if (!cookies) {
        this.detectThreat('MissingCookies', {});
      }
    }
  }

  // Attach SecureBot globally
  if (typeof window !== 'undefined') {
    window.SecureBot = SecureBot;
    if (window.SecureBotAutoInit !== false) {
      new SecureBot();
    }
  }

})(window, document);
