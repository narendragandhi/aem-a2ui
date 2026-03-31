import { test, expect } from '@playwright/test';

test.describe('AEM A2UI visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aem-assistant-onboarding-complete', 'true');
    });
    await page.route('**/workflows/models', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '/var/workflow/models/review', name: 'Review & Approve', description: 'Default review flow' },
        ]),
      });
    });
    await page.route('**/workflows?**', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    await page.route('**/content/**/versions', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'v1',
            contentId: 'mock-1',
            version: 1,
            createdBy: 'demo-user',
            createdAt: new Date().toISOString(),
            changeNote: 'Initial version',
            content: {
              id: 'mock-1',
              title: 'Unleash Your Potential',
              description: 'Discover innovative solutions designed to transform your digital experience.',
              ctaText: 'Get Started',
              ctaUrl: '/get-started',
              imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
              componentType: 'hero',
            },
          },
        ]),
      });
    });
    await page.route('**/demo/governance/check', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          brand: { score: 90, issues: [] },
          seo: { score: 85, issues: ['Description too short'] },
        }),
      });
    });
    await page.route('**/demo/component-schema**', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          componentType: 'hero',
          schema: { title: { type: 'text' }, description: { type: 'text' } },
        }),
      });
    });
    await page.route('**/demo/dam-assembly**', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          query: 'adventure',
          assets: [{ path: '/content/dam/demo.jpg', title: 'Demo Asset' }],
          selected: { path: '/content/dam/demo.jpg', title: 'Demo Asset' },
        }),
      });
    });
    await page.route('**/demo/personalize', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          variants: {
            Executive: { title: '[Executive] Unleash Your Potential' },
            Developer: { title: '[Developer] Unleash Your Potential' },
          },
        }),
      });
    });
    await page.route('**/demo/localize', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          localized: {
            'es-ES': { title: '[es-ES] Unleash Your Potential' },
            'fr-FR': { title: '[fr-FR] Unleash Your Potential' },
          },
        }),
      });
    });
    await page.route('**/demo/xf', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ path: '/content/experience-fragments/demo', status: 'ready' }),
      });
    });
    await page.route('**/telemetry/summary', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ totalEvents: 5, maxEvents: 200 }),
      });
    });
    await page.route('**/telemetry/events', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { type: 'content.generate', timestamp: new Date().toISOString(), data: { promptLength: 20 } },
        ]),
      });
    });
  });

  test('home screen (demo content)', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-demo.png', { fullPage: true });
  });

  test('demo hub governance tab', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AG‑UI / A2UI Demo Hub').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Governance' }).click();
    await expect(page).toHaveScreenshot('demo-governance.png', { fullPage: true });
  });

  test('aem preview edit mode', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page).toHaveScreenshot('aem-preview-edit.png', { fullPage: true });
  });

  test('demo hub guided mode', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AG‑UI / A2UI Demo Hub').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Start Guided' }).click();
    await expect(page).toHaveScreenshot('demo-guided.png', { fullPage: true });
  });

  test('workflow panel', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AEM Workflow').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('workflow-panel.png', { fullPage: true });
  });

  test('version history panel', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('Version History').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('version-history.png', { fullPage: true });
  });

  test('streaming modal', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const evt = new CustomEvent('generate-section', {
        detail: { sectionId: 'section-1', componentType: 'hero', prompt: 'Hero banner for summer sale' },
      });
      window.dispatchEvent(evt);
    });
    await page.getByText('Generating hero content...').waitFor({ timeout: 5000 });
    await expect(page).toHaveScreenshot('streaming-modal.png', { fullPage: true });
  });

  test('demo hub component schema tab', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AG‑UI / A2UI Demo Hub').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Component Config' }).click();
    await expect(page).toHaveScreenshot('demo-component-schema.png', { fullPage: true });
  });

  test('demo hub dam tab', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AG‑UI / A2UI Demo Hub').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'DAM Assembly' }).click();
    await expect(page).toHaveScreenshot('demo-dam.png', { fullPage: true });
  });

  test('demo hub personalization tab', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AG‑UI / A2UI Demo Hub').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Personalization' }).click();
    await expect(page).toHaveScreenshot('demo-personalization.png', { fullPage: true });
  });

  test('demo hub experience fragments tab', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AG‑UI / A2UI Demo Hub').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Experience Fragments' }).click();
    await expect(page).toHaveScreenshot('demo-xf.png', { fullPage: true });
  });

  test('content fragment panel', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('Content Fragment Export').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('content-fragment-panel.png', { fullPage: true });
  });

  test('aem export panel', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('AEM Export').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('aem-export-panel.png', { fullPage: true });
  });

  test('telemetry panel', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('Telemetry').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('telemetry-panel.png', { fullPage: true });
  });

  test('brand panel expanded', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('Brand Guidelines').scrollIntoViewIfNeeded();
    await page.getByText('Brand Guidelines').click();
    await expect(page).toHaveScreenshot('brand-panel-expanded.png', { fullPage: true });
  });

  test('seo panel', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('SEO Analysis').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot('seo-panel.png', { fullPage: true });
  });

  test('advanced export panel expanded', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('Advanced Export').scrollIntoViewIfNeeded();
    await page.getByText('Advanced Export').click();
    await expect(page).toHaveScreenshot('advanced-export-expanded.png', { fullPage: true });
  });

  test('advanced export tabs', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('networkidle');
    await page.getByText('Advanced Export').scrollIntoViewIfNeeded();
    await page.getByText('Advanced Export').click();

    const tabs = [
      { name: 'Package', file: 'advanced-export-package.png' },
      { name: 'XF', file: 'advanced-export-xf.png' },
      { name: 'Styles', file: 'advanced-export-styles.png' },
      { name: 'Dialog', file: 'advanced-export-dialog.png' },
      { name: 'Clientlib', file: 'advanced-export-clientlib.png' },
      { name: 'Deploy', file: 'advanced-export-deploy.png' },
    ];

    for (const tab of tabs) {
      await page.getByRole('button', { name: tab.name }).click();
      await expect(page).toHaveScreenshot(tab.file, { fullPage: true });
    }
  });
});
