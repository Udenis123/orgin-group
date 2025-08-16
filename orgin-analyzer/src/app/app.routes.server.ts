import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'dashboard/projects/submitted/details/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => []
  },
  {
    path: 'dashboard/projects/add-analytics/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => []
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
