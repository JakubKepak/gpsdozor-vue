import ChatBlocks from '@/views/ai/ChatBlocks.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import {
  createTextBlock,
  createVehicleCardBlock,
  createActionBlock,
} from '@/__tests__/factories'

describe('ChatBlocks', () => {
  it('renders text block with whitespace-pre-wrap', () => {
    const wrapper = mountWithPlugins(ChatBlocks, {
      props: { block: createTextBlock('Hello\nWorld') },
    })

    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.text()).toContain('World')
    expect(wrapper.find('.whitespace-pre-wrap').exists()).toBe(true)
  })

  it('renders vehicleCard block with vehicle details', () => {
    const wrapper = mountWithPlugins(ChatBlocks, {
      props: { block: createVehicleCardBlock() },
    })

    expect(wrapper.text()).toContain('Skoda Octavia')
    expect(wrapper.text()).toContain('1A2 3456')
    expect(wrapper.text()).toContain('150k km')
  })

  it('renders vehicleCard with speed tag when speed > 0', () => {
    const wrapper = mountWithPlugins(ChatBlocks, {
      props: { block: createVehicleCardBlock() },
    })

    expect(wrapper.text()).toContain('60 km/h')
  })

  it('renders vehicleCard with Idle tag when speed=0 and isActive', () => {
    const block = {
      type: 'vehicleCard' as const,
      vehicles: [
        { name: 'Test Car', spz: 'ABC 123', code: 'V1', odometer: 100000, speed: 0, isActive: true },
      ],
    }
    const wrapper = mountWithPlugins(ChatBlocks, {
      props: { block },
    })

    expect(wrapper.text()).toContain('Idle')
  })

  it('renders vehicleCard with Inactive tag when speed=0 and not active', () => {
    const block = {
      type: 'vehicleCard' as const,
      vehicles: [
        { name: 'Test Car', spz: 'ABC 123', code: 'V1', odometer: 100000, speed: 0, isActive: false },
      ],
    }
    const wrapper = mountWithPlugins(ChatBlocks, {
      props: { block },
    })

    expect(wrapper.text()).toContain('Inactive')
  })

  it('renders action block as RouterLink with button', () => {
    const wrapper = mountWithPlugins(ChatBlocks, {
      props: { block: createActionBlock() },
    })

    expect(wrapper.text()).toContain('View Fleet')
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
  })
})
