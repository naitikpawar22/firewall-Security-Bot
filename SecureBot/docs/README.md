# SecureBot - Website Security Guardian

## How to Use

Add this to your website's `<head>`:

```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/SecureBot@main/client/securebot.min.js"></script>
<script>
  // Initialize with options (optional)
  new SecureBot({
    reportUrl: 'https://your-endpoint.com/threats',
    debug: true // Shows warnings in console
  });
</script>
```
