import { test, expect } from '@playwright/test'
import { IntakePage } from '../../pages/intake.page'

test.describe('New Client Registration', () => {
  let intakePage: IntakePage

  test.beforeEach(async ({ page }) => {
    intakePage = new IntakePage(page)
    await intakePage.goto()
  })

  test('should display client registration form', async () => {
    await expect(intakePage.firstNameInput).toBeVisible()
    await expect(intakePage.lastNameInput).toBeVisible()
    await expect(intakePage.emailInput).toBeVisible()
    await expect(intakePage.phoneInput).toBeVisible()
  })

  test('should complete new client registration', async () => {
    await intakePage.fillClientForm({
      firstName: 'Test',
      lastName: 'Client',
      email: 'test.client@example.com',
      phone: '+2348012345678',
    })

    // Accept consent
    await intakePage.acceptConsent()

    // Submit form
    await intakePage.continueToCheckout()

    // Should proceed to next step or show success
    await expect(intakePage.page.getByTestId('client-saved-message'))
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Alternative: check for navigation to checkout
        expect(intakePage.page.url()).toContain('/checkout')
      })
  })

  test('should validate required fields', async () => {
    // Try to submit empty form
    await intakePage.continueToCheckout()

    // Should show validation errors
    await expect(intakePage.page.getByText(/required/i).first()).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await intakePage.fillClientForm({
      firstName: 'Test',
      lastName: 'Client',
      email: 'invalid-email',
      phone: '+2348012345678',
    })

    await intakePage.continueToCheckout()

    // Should show email validation error
    const emailError = page.getByTestId('error-email')
    await expect(emailError).toBeVisible()
  })

  test('should validate phone format', async ({ page }) => {
    await intakePage.fillClientForm({
      firstName: 'Test',
      lastName: 'Client',
      email: 'test@example.com',
      phone: '123', // Invalid phone
    })

    await intakePage.continueToCheckout()

    // Should show phone validation error
    const phoneError = page.getByTestId('error-phone')
    await expect(phoneError).toBeVisible()
  })
})
