import type { RouteOfAdmin } from '@/types';

const ROUTE_LABELS: Record<RouteOfAdmin, string> = {
  oral: 'oral',
  IV: 'IV',
  IM: 'IM',
  SC: 'SC',
  ID: 'ID',
  topical: 'topical',
  inhalation: 'inhalation',
  sublingual: 'sublingual',
  rectal: 'Suppo',
  ophthalmic: 'ophthalmic',
  other: 'other',
};

export function getRouteLabel(route: RouteOfAdmin): string {
  return ROUTE_LABELS[route] ?? route;
}

export function formatRouteList(routes: RouteOfAdmin[]): string {
  return routes.map(getRouteLabel).join(', ');
}
