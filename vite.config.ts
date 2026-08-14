import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

function generateSitemapPlugin() {
  return {
    name: 'generate-sitemap-plugin',
    buildStart() {
      try {
        execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
      } catch (err) {
        console.error('[Sitemap Plugin] Error running generate-sitemap.js:', err);
      }
    }
  };
}

function contactApiDevPlugin() {
  return {
    name: 'contact-api-dev-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/contact', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Allow', 'POST');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let bodyRaw = '';
        req.on('data', (chunk: any) => {
          bodyRaw += chunk;
        });

        req.on('end', async () => {
          try {
            req.body = bodyRaw ? JSON.parse(bodyRaw) : {};
          } catch {
            req.body = {};
          }

          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          try {
            const { default: handler } = await import('./api/contact.ts');
            await handler(req, res);
          } catch (err) {
            console.error('[Vite Dev API Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: "Sorry, we couldn't send your request. Please call us directly."
            }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [generateSitemapPlugin(), contactApiDevPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
