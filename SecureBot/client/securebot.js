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
      this.logIntro(); // Console message
      this.startDOMObserver();
      this.hookNetworkRequests();
      this.checkEnvironment?.(); // Optional if not implemented yet
      setInterval(() => this.runSecurityScan(), this.config.scanInterval);
    }

    logIntro() {
      console.log(`%cSecurity implemented by Naitik's Security Bot`, 'color: green; font-weight: bold; font-size: 16px;');
    }

    startDOMObserver() {
      new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            this.analyzeNode(node);  // ✅ Now matches the correct method
          });
        });
      }).observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }

    analyzeNode(node) {
      // Implement security checks here
      if (node.nodeType === 1 && /script|iframe/i.test(node.tagName)) {
        this.detectThreat('SuspiciousElement', { element: node });
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
        timestamp: new Date(),
        page: window.location.href
      };

      if (this.config.debug) console.warn('[SecureBot] Threat:', threat);

      if (this.config.reportUrl) {
        this.reportThreat(threat);
      }
    }

    reportThreat(threat) {
      navigator.sendBeacon(this.config.reportUrl, JSON.stringify(threat));
    }

    runSecurityScan() {
      this.checkLoadedScripts?.(); // Optional chaining in case not implemented
      this.checkCookies?.();       // Optional chaining
    }
  }

  // Auto-initialize if included via script tag
  if (typeof window !== 'undefined') {
    window.SecureBot = SecureBot;
    if (window.SecureBotAutoInit !== false) {
      new SecureBot();
    }
  }

})(window, document);
