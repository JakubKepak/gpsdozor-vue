import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale } from './fixtures'

test.describe('Chat Panel', () => {
  test.beforeEach(async ({ page }) => {
    await setEnglishLocale(page)
    await mockApi(page)
    // Disable CSS animations so Playwright doesn't see the chat bubble as unstable
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
  })

  test('chat bubble opens and closes panel', async ({ page }) => {
    // Find and click the chat bubble button (aria-label from i18n "ai.title")
    const chatBubble = page.getByLabel('AI Assistant')
    await chatBubble.click()

    // Chat panel should be visible with welcome text
    await expect(page.getByText('Fleet AI Assistant')).toBeVisible()

    // Close the panel — button is the same element, icon changes to CloseOutlined
    await chatBubble.click()
    await expect(page.getByText('Fleet AI Assistant')).not.toBeVisible()
  })

  test('empty state shows suggestions', async ({ page }) => {
    await page.getByLabel('AI Assistant').click()

    await expect(page.getByText('What is the current fleet status?')).toBeVisible()
    await expect(page.getByText('Which vehicles have the highest mileage?')).toBeVisible()
    await expect(page.getByText('How is fuel consumption looking?')).toBeVisible()
  })
})
