import { mount } from '@vue/test-utils'
import StatCard from '@/components/StatCard.vue'

describe('StatCard', () => {
  it('renders label and value', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active Vehicles',
        value: 5,
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-50',
      },
    })

    expect(wrapper.text()).toContain('Active Vehicles')
    expect(wrapper.text()).toContain('5')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active',
        value: 5,
        subtitle: 'Moving now',
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-50',
      },
    })

    expect(wrapper.text()).toContain('Moving now')
  })

  it('does not render subtitle element when not provided', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active',
        value: 5,
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-50',
      },
    })

    expect(wrapper.find('.text-gray-400.text-xs.mt-0\\.5').exists()).toBe(false)
  })

  it('renders #icon slot content', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active',
        value: 5,
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-50',
      },
      slots: {
        icon: '<span class="test-icon">I</span>',
      },
    })

    expect(wrapper.find('.test-icon').exists()).toBe(true)
  })

  it('applies compact styling when compact=true', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active',
        value: 5,
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-50',
        compact: true,
      },
    })

    const valueDiv = wrapper.find('.text-lg.font-bold')
    expect(valueDiv.exists()).toBe(true)
  })

  it('applies non-compact styling by default', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active',
        value: 5,
        colorClass: 'text-green-500',
        bgColorClass: 'bg-green-50',
      },
    })

    const valueDiv = wrapper.find('.text-2xl.font-bold')
    expect(valueDiv.exists()).toBe(true)
  })

  it('applies color classes to icon wrapper', () => {
    const wrapper = mount(StatCard, {
      props: {
        label: 'Active',
        value: 5,
        colorClass: 'text-status-active',
        bgColorClass: 'bg-severity-positive-bg',
      },
    })

    const iconWrapper = wrapper.find('.rounded-lg.shrink-0')
    expect(iconWrapper.classes()).toContain('text-status-active')
    expect(iconWrapper.classes()).toContain('bg-severity-positive-bg')
  })
})
