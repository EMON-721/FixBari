"""End-to-end test of the offline interactive FixBari preview, not hosted APIs.
Requires: pip install playwright; system Chromium (or Playwright browser).
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
async def main():
    async with async_playwright() as p:
        candidate=os.getenv('CHROMIUM_EXECUTABLE','/usr/bin/chromium')
        kwargs={'executable_path':candidate} if Path(candidate).exists() else {}
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'],**kwargs)
        page=await browser.new_page(viewport={'width':1440,'height':900})
        errors=[]
        page.on('pageerror',lambda exc: errors.append(str(exc)))
        html=(ROOT/'apps/web/public/preview/index.html').read_text().replace('<link rel="stylesheet" href="styles.css">','').replace('<script src="app.js" defer></script>','')
        await page.set_content(html)
        await page.add_style_tag(content=(ROOT/'apps/web/public/preview/styles.css').read_text())
        await page.add_script_tag(content=(ROOT/'apps/web/public/preview/app.js').read_text())
        assert 'FixBari' in await page.title()
        assert await page.locator('.metric').count()>=3
        await page.locator('[data-go="services"]').click()
        assert await page.locator('.service-card').count()==24
        await page.locator('[data-action="book:S1"]').first.click()
        await page.locator('#modal input[name="date"]').fill('2026-11-02')
        await page.locator('#modal textarea[name="notes"]').fill('FixBari browser E2E')
        await page.locator('#modal form button[type="submit"]').click()
        await page.locator('[data-go="quotes"]').click()
        await page.locator('[name="subject"]').fill('Kitchen leak repair')
        await page.locator('[name="scope"]').fill('Inspect and fix leakage under kitchen sink.')
        await page.locator('[data-form="quote"] button[type="submit"]').click()
        await page.locator('[data-go="cost"]').click()
        await page.locator('[data-form="estimate"] button[type="submit"]').click()
        assert '৳' in await page.locator('#costresult .result-price').inner_text()
        await page.locator('[data-role="technician"]').click()
        await page.locator('[data-action^="detail:"]').first.click()
        await page.locator('[data-action^="accept:"]').click()
        await page.locator('[data-action^="detail:"]').first.click()
        await page.locator('[data-action^="start:"]').click()
        await page.locator('[data-action^="detail:"]').first.click()
        for c in await page.locator('.job-check').all(): await c.check()
        await page.locator('#job-note').fill('Testing and replacement completed.')
        await page.locator('[data-action^="finish:"]').click()
        await page.locator('[data-role="customer"]').click()
        await page.locator('[data-go="bookings"]').click()
        await page.locator('[data-action^="detail:"]').last.click()
        await page.locator('[data-action^="confirm:"]').click()
        await page.locator('[data-role="admin"]').click()
        await page.locator('[data-go="admin-technicians"]').click()
        await page.locator('[data-action^="approve:"]').first.click()
        await page.locator('[data-go="features"]').click()
        assert await page.locator('.feature-row').count()>=54
        assert not errors,errors
        print('PASS: homepage, 24 services, booking, quotation, estimator, technician life cycle, customer acceptance, admin approval, 54 feature catalog, zero JS errors')
        await browser.close()
if __name__=='__main__': asyncio.run(main())
