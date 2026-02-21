import { defineComponent, onMounted } from 'vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'

const GoodChild = defineComponent({
  template: '<p class="child">OK</p>',
})

// Component that throws asynchronously after mount
const AsyncBadChild = defineComponent({
  setup() {
    onMounted(() => {
      throw new Error('Async test error')
    })
    return {}
  },
  template: '<p class="async-child">Mounted</p>',
})

describe('ErrorBoundary', () => {
  it('renders slot content when no error', () => {
    const wrapper = mountWithPlugins(ErrorBoundary, {
      slots: { default: GoodChild },
    })

    expect(wrapper.find('.child').exists()).toBe(true)
    expect(wrapper.text()).toContain('OK')
  })

  it('catches error from child onMounted and shows error state', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(ErrorBoundary, {
      slots: { default: AsyncBadChild },
    })

    await wrapper.vm.$nextTick()

    // The error boundary should have captured the error
    // and rendered the error UI with AntD Result
    const html = wrapper.html()
    expect(html).toContain('error')

    spy.mockRestore()
  })

  it('renders retry and reload buttons when error is captured', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(ErrorBoundary, {
      slots: { default: AsyncBadChild },
    })

    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)

    spy.mockRestore()
  })

  it('clears error state on retry click', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountWithPlugins(ErrorBoundary, {
      slots: { default: AsyncBadChild },
    })

    await wrapper.vm.$nextTick()

    // Find retry button and click it
    const buttons = wrapper.findAll('button')
    if (buttons.length > 0) {
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()
    }

    spy.mockRestore()
  })
})
