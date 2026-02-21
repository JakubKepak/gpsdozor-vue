import { ref } from 'vue'
import ChatPanel from '@/views/ai/ChatPanel.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { chatKey, type ChatState } from '@/stores/chatStore'
import type { ChatMessage } from '@/types/chat'

function createMockChatStore(overrides: Partial<ChatState> = {}): ChatState {
  return {
    messages: ref<ChatMessage[]>([]),
    isLoading: ref(false),
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
    ...overrides,
  }
}

function mountChatPanel(store: ChatState) {
  return mountWithPlugins(ChatPanel, {
    global: {
      provide: { [chatKey as symbol]: store },
    },
  })
}

describe('ChatPanel', () => {
  it('shows empty state with welcome message and suggestions', () => {
    const store = createMockChatStore()
    const wrapper = mountChatPanel(store)

    expect(wrapper.text()).toContain('Fleet AI Assistant')
    expect(wrapper.text()).toContain('What is the current fleet status?')
    expect(wrapper.text()).toContain('Which vehicles have the highest mileage?')
    expect(wrapper.text()).toContain('How is fuel consumption looking?')
  })

  it('renders user messages', () => {
    const store = createMockChatStore({
      messages: ref([
        { role: 'user', content: 'Hello fleet!', timestamp: new Date().toISOString() },
      ]),
    })
    const wrapper = mountChatPanel(store)

    expect(wrapper.text()).toContain('Hello fleet!')
    expect(wrapper.text()).not.toContain('Fleet AI Assistant')
  })

  it('renders assistant messages with ChatBlocks', () => {
    const store = createMockChatStore({
      messages: ref([
        {
          role: 'assistant',
          content: [{ type: 'text', content: 'Your fleet is active.' }],
          timestamp: new Date().toISOString(),
        },
      ]),
    })
    const wrapper = mountChatPanel(store)

    expect(wrapper.text()).toContain('Your fleet is active.')
  })

  it('shows loading dots when isLoading is true', () => {
    const store = createMockChatStore({
      messages: ref([
        { role: 'user', content: 'test', timestamp: new Date().toISOString() },
      ]),
      isLoading: ref(true),
    })
    const wrapper = mountChatPanel(store)

    const dots = wrapper.findAll('.animate-bounce')
    expect(dots.length).toBe(3)
  })

  it('send button is disabled when input is empty', () => {
    const store = createMockChatStore()
    const wrapper = mountChatPanel(store)

    // Last AButton in the input area is the send button
    const inputArea = wrapper.find('.chat-input-area')
    const sendBtn = inputArea.findAllComponents({ name: 'AButton' }).at(-1)!
    expect(sendBtn.attributes('disabled')).toBeDefined()
  })

  it('sends on Enter and does not send on Shift+Enter', async () => {
    const store = createMockChatStore()
    const wrapper = mountChatPanel(store)

    const textarea = wrapper.find('textarea')

    // Type text into the textarea
    await textarea.setValue('Hello fleet')

    // Shift+Enter should NOT send
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: true })
    expect(store.sendMessage).not.toHaveBeenCalled()

    // Enter without shift should send
    await textarea.trigger('keydown', { key: 'Enter', shiftKey: false })
    expect(store.sendMessage).toHaveBeenCalledWith('Hello fleet')
  })

  it('shows clear button only when messages exist', () => {
    const storeEmpty = createMockChatStore()
    const wrapperEmpty = mountChatPanel(storeEmpty)

    const deleteIconsEmpty = wrapperEmpty.findAllComponents({ name: 'DeleteOutlined' })
    expect(deleteIconsEmpty.length).toBe(0)

    const storeWithMessages = createMockChatStore({
      messages: ref([
        { role: 'user', content: 'hi', timestamp: new Date().toISOString() },
      ]),
    })
    const wrapperWithMessages = mountChatPanel(storeWithMessages)

    const deleteIcons = wrapperWithMessages.findAllComponents({ name: 'DeleteOutlined' })
    expect(deleteIcons.length).toBeGreaterThan(0)
  })

  it('calls sendMessage when suggestion is clicked', async () => {
    const store = createMockChatStore()
    const wrapper = mountChatPanel(store)

    const suggestions = wrapper.findAll('button').filter(
      (b) => b.text().includes('What is the current fleet status?'),
    )
    expect(suggestions.length).toBeGreaterThan(0)
    await suggestions[0].trigger('click')

    expect(store.sendMessage).toHaveBeenCalledWith('What is the current fleet status?')
  })
})
