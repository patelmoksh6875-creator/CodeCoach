import { FileMap } from '../../types/project';

export function createSandboxBundle(files: FileMap): string {
  const htmlContent = files['index.html']?.content || '<h3>No index.html found</h3>';
  const cssContent = files['styles.css']?.content || '';
  const jsContent = files['app.js']?.content || '';

  const interceptedScript = `
    <script>
      (function() {
        const sendLog = (type, message, lineNumber, colNumber) => {
          window.parent.postMessage({
            type: 'SANDBOX_CONSOLE',
            payload: { type, message: String(message), lineNumber, colNumber }
          }, '*');
        };

        window.onerror = function(message, source, lineno, colno) {
          sendLog('error', message, lineno, colno);
          return false;
        };

        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = function(...args) {
          sendLog('log', args.join(' '));
          originalLog.apply(console, args);
        };

        console.error = function(...args) {
          sendLog('error', args.join(' '));
          originalError.apply(console, args);
        };

        console.warn = function(...args) {
          sendLog('warn', args.join(' '));
          originalWarn.apply(console, args);
        };
      })();
    </script>
  `;

  let processedHtml = htmlContent;

  // Replace external CSS link with inline style block
  processedHtml = processedHtml.replace(
    /<link[^>]*href=["']styles\.css["'][^>]*>/i,
    `<style>\n${cssContent}\n</style>`
  );

  // Replace external JS script with error-reporting wrapper and inline script
  processedHtml = processedHtml.replace(
    /<script[^>]*src=["']app\.js["'][^>]*><\/script>/i,
    `${interceptedScript}\n<script>\n${jsContent}\n</script>`
  );

  // Fallback injection if replacement tags were not matched
  if (!processedHtml.includes('<style>') && cssContent) {
    processedHtml = processedHtml.replace('</head>', `<style>\n${cssContent}\n</style></head>`);
  }

  if (!processedHtml.includes(jsContent) && jsContent) {
    processedHtml = processedHtml.replace('</body>', `${interceptedScript}\n<script>\n${jsContent}\n</script></body>`);
  }

  return processedHtml;
}