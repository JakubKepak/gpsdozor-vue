import AIInsightsButton from '@/components/AIInsightsButton.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'

describe('AIInsightsButton', () => {
  it('renders button with label text', () => {
    const wrapper = mountWithPlugins(AIInsightsButton)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('AI Insights')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mountWithPlugins(AIInsightsButton)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies active gradient classes when active=true', () => {
    const wrapper = mountWithPlugins(AIInsightsButton, {
      props: { active: true },
    })
    const btn = wrapper.find('button')
    expect(btn.classes().join(' ')).toContain('from-violet-600!')
  })

  it('applies default gradient classes when active=false', () => {
    const wrapper = mountWithPlugins(AIInsightsButton, {
      props: { active: false },
    })
    const btn = wrapper.find('button')
    const classes = btn.classes().join(' ')
    expect(classes).toContain('from-violet-500!')
    expect(classes).not.toContain('from-violet-600!')
  })
})
