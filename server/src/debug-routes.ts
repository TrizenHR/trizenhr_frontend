import { Application } from 'express';

export function listRoutes(app: Application): void {
  const routes: string[] = [];

  function extractRoutes(stack: any[], prefix = ''): void {
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        const path = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\$/g, '');
        extractRoutes(layer.handle.stack, prefix + path);
      }
    });
  }

  extractRoutes(app._router.stack);

  console.log('\n📋 Registered Routes:');
  console.log('─────────────────────────────────────────');
  routes.forEach((route) => console.log(`  ${route}`));
  console.log('─────────────────────────────────────────\n');
}
