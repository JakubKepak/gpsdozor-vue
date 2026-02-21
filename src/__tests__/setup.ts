import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Global stubs for components that rely on canvas/WebGL APIs not available in happy-dom.
// NOTE: These stubs use component-name matching. Components that import vue-echarts
// directly (e.g. LineChartCard) bypass this stub — use vi.mock('vue-echarts') instead.
config.global.stubs = {
  VChart: { template: '<div class="v-chart-stub"><slot /></div>' },
  GoogleMap: { template: '<div class="google-map-stub"><slot /></div>' },
  Marker: { template: '<div class="marker-stub" />' },
  CustomMarker: { template: '<div class="custom-marker-stub"><slot /></div>' },
  Polyline: { template: '<div class="polyline-stub" />' },
  InfoWindow: { template: '<div class="info-window-stub"><slot /></div>' },
}

// Mock env vars
// @ts-expect-error Vite types DEV as boolean, but vi.stubEnv expects string
vi.stubEnv('DEV', 'true')
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')
vi.stubEnv('VITE_API_USERNAME', 'test')
vi.stubEnv('VITE_API_PASSWORD', 'test')
