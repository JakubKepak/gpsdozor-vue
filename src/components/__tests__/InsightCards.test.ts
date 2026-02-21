import { ref } from 'vue'
import InsightCards from '@/components/InsightCards.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createInsight } from '@/__tests__/factories'

vi.mock('@/api/composables/useAIInsights', () => ({
  useAIInsights: vi.fn(),
}))

import { useAIInsights } from '@/api/composables/useAIInsights'
const mockUseAIInsights = vi.mocked(useAIInsights)

describe('InsightCards', () => {
  beforeEach(() => {
    mockUseAIInsights.mockReset()
  })

  it('renders nothing when visible=false', () => {
    mockUseAIInsights.mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(null),
    } as any)

    const wrapper = mountWithPlugins(InsightCards, {
      props: { module: 'dashboard', data: { test: true }, visible: false },
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders nothing when data=null', () => {
    mockUseAIInsights.mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(null),
    } as any)

    const wrapper = mountWithPlugins(InsightCards, {
      props: { module: 'dashboard', data: null, visible: true },
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders loading skeletons when isLoading', () => {
    mockUseAIInsights.mockReturnValue({
      data: ref(null),
      isLoading: ref(true),
      error: ref(null),
    } as any)

    const wrapper = mountWithPlugins(InsightCards, {
      props: { module: 'dashboard', data: { test: true }, visible: true },
    })

    // 2 skeleton cards are rendered during loading
    const skeletons = wrapper.findAllComponents({ name: 'ASkeleton' })
    expect(skeletons.length).toBe(2)
  })

  it('renders error alert when fetch fails', () => {
    mockUseAIInsights.mockReturnValue({
      data: ref(null),
      isLoading: ref(false),
      error: ref(new Error('fail')),
    } as any)

    const wrapper = mountWithPlugins(InsightCards, {
      props: { module: 'dashboard', data: { test: true }, visible: true },
    })

    expect(wrapper.text()).toContain('AI insights temporarily unavailable')
  })

  it('renders insight cards with titles and descriptions', () => {
    const insights = [
      createInsight({ title: 'High Fuel', description: 'Fuel consumption is above average', severity: 'warning' }),
      createInsight({ title: 'Good Health', description: 'Fleet is in good shape', severity: 'positive' }),
    ]

    mockUseAIInsights.mockReturnValue({
      data: ref({ insights }),
      isLoading: ref(false),
      error: ref(null),
    } as any)

    const wrapper = mountWithPlugins(InsightCards, {
      props: { module: 'dashboard', data: { test: true }, visible: true },
    })

    expect(wrapper.text()).toContain('High Fuel')
    expect(wrapper.text()).toContain('Fuel consumption is above average')
    expect(wrapper.text()).toContain('Good Health')
    expect(wrapper.text()).toContain('Fleet is in good shape')
  })

  it('renders recommendations as list items', () => {
    const insights = [
      createInsight({ recommendations: ['Fix X', 'Check Y'] }),
    ]

    mockUseAIInsights.mockReturnValue({
      data: ref({ insights }),
      isLoading: ref(false),
      error: ref(null),
    } as any)

    const wrapper = mountWithPlugins(InsightCards, {
      props: { module: 'dashboard', data: { test: true }, visible: true },
    })

    const listItems = wrapper.findAll('li')
    expect(listItems.length).toBe(2)
    expect(listItems[0].text()).toContain('Fix X')
    expect(listItems[1].text()).toContain('Check Y')
  })
})
