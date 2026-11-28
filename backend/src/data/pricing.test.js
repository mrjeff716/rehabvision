// Run: node --test src/data/pricing.test.js
import test from 'node:test'
import assert from 'node:assert/strict'
import { regionalDiscount, quote, suggestedAid } from './pricing.js'

test('regional discounts match the business plan table (slide 6)', () => {
  const expected = {
    beirut: 0, keserwan_jbeil: 0, mount_lebanon: 5, north_koura: 15, bekaa: 25,
    north_tripoli: 30, south: 30, nabatieh: 40, baalbek_hermel: 40, akkar: 50,
  }
  for (const [region, pct] of Object.entries(expected)) assert.equal(regionalDiscount(region), pct, region)
  assert.equal(quote({ region: 'akkar' }).monthly, 10)
  assert.equal(quote({ region: 'nabatieh' }).monthly, 12)
})

test('total discount caps at 75% and never goes below $6', () => {
  const q = quote({ plan: 'practice', region: 'akkar', aidPct: 40 })
  assert.equal(q.discountPct, 75)
  assert.equal(q.monthly, 12.5)
  assert.equal(quote({ plan: 'starter', region: 'akkar', aidPct: 40 }).monthly, 6) // 70% floor on Starter
})

test('a sponsor can pay past the cap, annual is 10 months for 12', () => {
  assert.equal(quote({ region: 'akkar', aidPct: 40, sponsorPct: 100 }).monthly, 0)
  const a = quote({ plan: 'growth', region: 'beirut', annual: true })
  assert.equal(a.dueNow, 350)
  assert.equal(a.months, 12)
})

test('aid suggestion adds the tracks', () => {
  assert.equal(suggestedAid({ A: true, B: 'under250' }), 70)
  assert.equal(suggestedAid({ C: 'lostPatients', D: true }), 40)
  assert.equal(suggestedAid({}), 0)
})

test('the website uses the same pricing file', async () => {
  const { readFile } = await import('node:fs/promises')
  const here = await readFile(new URL('./pricing.js', import.meta.url), 'utf8')
  const site = await readFile(new URL('../../../frontend/src/billing/pricing.js', import.meta.url), 'utf8')
  assert.equal(site, here, 'copy backend/src/data/pricing.js to frontend/src/billing/pricing.js')
})
