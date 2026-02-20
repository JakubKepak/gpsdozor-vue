import { ref, type InjectionKey, type Ref, inject, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from '@/composables/useLocale'
import { useFleetContext } from '@/api/composables/useFleetContext'
import type { ChatMessage, ChatBlock } from '@/types/chat'

export interface ChatState {
  messages: Ref<ChatMessage[]>
  isLoading: Ref<boolean>
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

export const chatKey: InjectionKey<ChatState> = Symbol('chat')

export function provideChatStore() {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const { locale } = useLocale()
  const { t } = useI18n()
  const getFleetContext = useFleetContext()
  const MAX_MESSAGES = 100
  const MAX_INPUT_LENGTH = 2000
  let abortController: AbortController | null = null

  function trimMessages() {
    if (messages.value.length > MAX_MESSAGES) {
      messages.value = messages.value.slice(-MAX_MESSAGES)
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim().slice(0, MAX_INPUT_LENGTH)
    if (!trimmed) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    messages.value = [...messages.value, userMsg]
    isLoading.value = true

    try {
      abortController?.abort()
      abortController = new AbortController()

      const history = [...messages.value]
        .filter(
          (m): m is ChatMessage & { content: string } =>
            typeof m.content === 'string' || m.role === 'user',
        )
        .map((m) => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        }))

      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          fleetContext: getFleetContext(),
          locale: locale.value,
        }),
        signal: AbortSignal.any([abortController.signal, AbortSignal.timeout(30_000)]),
      })

      if (!resp.ok) {
        const errorKey = resp.status === 429 ? 'ai.rateLimited' : 'ai.error'
        const errorBlock: ChatBlock[] = [{ type: 'text', content: t(errorKey) }]
        messages.value = [
          ...messages.value,
          { role: 'assistant', content: errorBlock, timestamp: new Date().toISOString() },
        ]
        return
      }

      const data = await resp.json()
      let blocks: ChatBlock[]

      if (data.blocks && Array.isArray(data.blocks)) {
        blocks = data.blocks
      } else {
        blocks = [{ type: 'text', content: t('ai.error') }]
      }

      messages.value = [
        ...messages.value,
        { role: 'assistant', content: blocks, timestamp: new Date().toISOString() },
      ]
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return

      messages.value = [
        ...messages.value,
        {
          role: 'assistant',
          content: [{ type: 'text', content: t('ai.error') }],
          timestamp: new Date().toISOString(),
        },
      ]
    } finally {
      isLoading.value = false
      abortController = null
      trimMessages()
    }
  }

  function clearChat() {
    abortController?.abort()
    messages.value = []
    isLoading.value = false
  }

  const state: ChatState = { messages, isLoading, sendMessage, clearChat }
  provide(chatKey, state)
  return state
}

export function useChatStore(): ChatState {
  const ctx = inject(chatKey)
  if (!ctx) throw new Error('useChatStore must be used within provideChatStore')
  return ctx
}
