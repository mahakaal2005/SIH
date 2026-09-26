export const config = {
  dataSource: (import.meta.env.VITE_DATA_SOURCE ?? 'mock') as 'mock' | 'http',
  useGoogleMaps: import.meta.env.VITE_USE_GOOGLE_MAPS === 'true',
  mockLatency: { min: 200, max: 500 },
  showDevTools: import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_TOOLS === 'true',
}
