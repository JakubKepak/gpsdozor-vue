import LineChartCard from '@/components/LineChartCard.vue'
import { mount } from '@vue/test-utils'

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    props: ['option', 'autoresize'],
    template: '<div class="v-chart-stub"><slot /></div>',
  },
}))

describe('LineChartCard', () => {
  const defaultData = [
    { date: '2025-01-15', value: 10 },
    { date: '2025-01-16', value: 20 },
  ]

  it('renders the title in an h3 element', () => {
    const wrapper = mount(LineChartCard, {
      props: { title: 'Fuel Trend', data: defaultData },
    })

    const h3 = wrapper.find('h3')
    expect(h3.exists()).toBe(true)
    expect(h3.text()).toBe('Fuel Trend')
  })

  it('renders VChart stub', () => {
    const wrapper = mount(LineChartCard, {
      props: { title: 'Test Chart', data: defaultData },
    })

    expect(wrapper.find('.v-chart-stub').exists()).toBe(true)
  })

  it('applies custom height via style', () => {
    const wrapper = mount(LineChartCard, {
      props: { title: 'Test', data: defaultData, height: 300 },
    })

    const chart = wrapper.find('.v-chart-stub')
    expect(chart.attributes('style')).toContain('height: 300px')
  })

  it('applies default height of 260px', () => {
    const wrapper = mount(LineChartCard, {
      props: { title: 'Test', data: defaultData },
    })

    const chart = wrapper.find('.v-chart-stub')
    expect(chart.attributes('style')).toContain('height: 260px')
  })
})
