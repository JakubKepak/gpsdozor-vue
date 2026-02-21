import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import type { Component } from 'vue'
import en from '@/i18n/en.json'

/** Lightweight i18n for tests — English only, missing keys return the key itself */
export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en },
    missingWarn: false,
    fallbackWarn: false,
  })
}

/** Memory-history router for tests */
export function createTestRouter(routes: { path: string; component: Component }[] = []) {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes.length ? routes : [{ path: '/', component: { template: '<div />' } }],
  })
}

/** Create the shared test plugins (i18n, router, VueQuery) */
export function createTestPlugins(router?: ReturnType<typeof createTestRouter>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const i18n = createTestI18n()
  const r = router ?? createTestRouter()
  return [i18n, r, [VueQueryPlugin, { queryClient }]] as const
}

/** Pre-configured mount with i18n, router, and VueQuery plugins */
export function mountWithPlugins<T extends Component>(
  component: T,
  options: MountingOptions<any> = {},
): VueWrapper {
  const plugins = createTestPlugins()

  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [...plugins, ...(options.global?.plugins ?? [])],
      stubs: {
        ...options.global?.stubs,
      },
      provide: {
        ...options.global?.provide,
      },
    },
  })
}

/** Async mount with a custom router — use when the component reads route params */
export async function mountWithRouter<T extends Component>(
  component: T,
  routes: { path: string; component: Component }[],
  initialPath: string,
  options: MountingOptions<any> = {},
): Promise<VueWrapper> {
  const router = createTestRouter(routes)
  await router.push(initialPath)
  await router.isReady()

  const plugins = createTestPlugins(router)

  return mount(component, {
    ...options,
    global: {
      ...options.global,
      plugins: [...plugins, ...(options.global?.plugins ?? [])],
      stubs: {
        ...options.global?.stubs,
      },
      provide: {
        ...options.global?.provide,
      },
    },
  })
}
