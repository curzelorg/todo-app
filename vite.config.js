import { defineConfig } from 'vite';

// Sandbox preview only: the preview proxy forwards the request with
// `Host: <port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN`, which Vite would
// otherwise reject. Both variables are absent outside the sandbox, so the
// default Vite host handling is preserved everywhere else.
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: previewMode && sandboxHostDomain ? [`.${sandboxHostDomain}`] : undefined,
  },
});
