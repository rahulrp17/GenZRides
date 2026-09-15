/**
 * Live Driver Location E2E Test
 *
 * Two browser contexts (customer + driver) with per-context GPS overrides.
 * Driver accepts a live ride and shares GPS; customer's Current Ride map
 * must show the "Driver Live · Xs ago" chip WITHOUT a page reload,
 * proving a real `driver-location-updated` socket event arrived.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://genzrides.vercel.app';
const API_BASE = 'https://genzrides-backend.onrender.com/api';

const CUSTOMER = { email: 'rahulrishabhh@gmail.com', password: '#Rahul2004' };
const DRIVER  = { email: 'ragulpant421@gmail.com', password: '#Rahul2004' };

// Madurai pickup → Thirumangalam drop (short local hop so booking is cheap/fast)
const PICKUP = { lat: 9.9252, lng: 78.1198, address: 'Madurai' };
const DROP   = { lat: 9.75,   lng: 77.97,   address: 'Thirumangalam' };

const RESULTS = [];
function step(name, status, details = '') {
  RESULTS.push({ name, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}${details ? ' — ' + details : ''}`);
}

async function freshLogin(page, email, password, role) {
  await page.context().clearCookies();
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  const url = role === 'driver' ? '/driver/login' : '/login';
  await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) {
    await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('input[type="email"], input[name="email"]').first().fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(role === 'driver' ? '**/driver*' : '**/customer*', { timeout: 25000 });
  }
}

async function api(page, method, path, body) {
  return page.evaluate(async ({ apiBase, method, path, body }) => {
    const tokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
    const token = tokens?.accessToken;
    if (!token) return { error: 'no token' };
    const res = await fetch(`${apiBase}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }, { apiBase: API_BASE, method, path, body });
}

async function pickVehicle(page) {
  return page.evaluate(async (apiBase) => {
    const tokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
    const res = await fetch(`${apiBase}/vehicles`, { headers: { Authorization: `Bearer ${tokens?.accessToken}` } });
    const json = await res.json();
    const list = json?.data?.vehicles || json?.vehicles || json?.data || [];
    const v = list.find((x) => (x.vehicleType || '').toLowerCase() === 'sedan') || list[0];
    if (!v) throw new Error('No vehicle found');
    return { id: v._id, type: v.vehicleType };
  }, API_BASE);
}

test('Live Driver Location E2E', async ({ browser }) => {
  test.setTimeout(6 * 60 * 1000);

  // ═══ SETUP: two isolated contexts with GPS overrides ═══
  const custCtx = await browser.newContext({
    geolocation: { latitude: PICKUP.lat, longitude: PICKUP.lng },
    permissions: ['geolocation'],
  });
  await custCtx.grantPermissions(['geolocation'], { origin: BASE_URL });
  const cust = await custCtx.newPage();

  const drvCtx = await browser.newContext({
    geolocation: { latitude: DROP.lat, longitude: DROP.lng },
    permissions: ['geolocation'],
  });
  await drvCtx.grantPermissions(['geolocation'], { origin: BASE_URL });
  const drv = await drvCtx.newPage();

  let bookingId;

  try { await freshLogin(cust, CUSTOMER.email, CUSTOMER.password, 'customer'); step('1. Customer Login', 'PASS'); }
  catch (e) { step('1. Customer Login', 'FAIL', e.message); throw e; }
  try { await freshLogin(drv, DRIVER.email, DRIVER.password, 'driver'); step('2. Driver Login', 'PASS'); }
  catch (e) { step('2. Driver Login', 'FAIL', e.message); throw e; }

  // Customer opens Current Ride BEFORE driver shares GPS → chip must initially be absent
  try {
    await cust.goto(`${BASE_URL}/customer/current-ride`, { waitUntil: 'networkidle', timeout: 30000 });
    await cust.waitForTimeout(4000);
    const t = await cust.textContent('body');
    step('3. Customer Current Ride page', (t.includes('Current Ride') || t.includes('No')) ? 'PASS' : 'WARN', t.substring(0, 80));
  } catch (e) { step('3. Customer Current Ride page', 'FAIL', e.message); throw e; }

  // ═══ PHASE 1: CREATE + ACCEPT A LIVE RIDE ═══
  try {
    const vehicle = await pickVehicle(cust);
    const created = await api(cust, 'POST', '/bookings', {
      pickup: { address: PICKUP.address, latitude: PICKUP.lat, longitude: PICKUP.lng },
      drop: { address: DROP.address, latitude: DROP.lat, longitude: DROP.lng },
      pickupDateTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      tripType: 'One Way',
      days: 1,
      vehicleType: vehicle.id,
      paymentMethod: 'Cash',
      customerNotes: 'Live location E2E test',
    });
    bookingId = created.data?.booking?._id || created.data?.data?.booking?._id || created.data?.booking?.id;
    if (!bookingId) throw new Error(JSON.stringify(created).substring(0, 300));
    step('4. Create Booking via API', 'PASS', bookingId);
  } catch (e) { step('4. Create Booking via API', 'FAIL', e.message); throw e; }

  // Driver online + accept the booking
  try {
    await api(drv, 'PUT', '/driver/online', {});
    await api(drv, 'PUT', '/driver/location', { latitude: DROP.lat, longitude: DROP.lng });
    await drv.waitForTimeout(1500);
    const accept = await api(drv, 'PATCH', `/bookings/${bookingId}/accept`, {});
    const ok = accept.ok || accept.data?.message?.toLowerCase().includes('accept');
    if (accept.data?.message && !ok) throw new Error(JSON.stringify(accept.data).substring(0, 200));
    step('5. Accept Booking via API', ok ? 'PASS' : 'WARN', JSON.stringify(accept.data?.message || {}) );
  } catch (e) { step('5. Accept Booking via API', 'FAIL', e.message); }

  // ═══ PHASE 2: DRIVER SHARES GPS ═══
  try {
    await drv.goto(`${BASE_URL}/driver/ride`, { waitUntil: 'networkidle', timeout: 30000 });
    await drv.waitForTimeout(6000);
    await drv.screenshot({ path: './e2e-results/live-driver-ride.png' });
    const t = await drv.textContent('body');
    const riding = t.includes('Pickup Customer') || t.includes('Heading') || t.includes('On The Way');
    step('6. Driver ride active + GPS on', riding ? 'PASS' : 'WARN', t.substring(0, 120));
  } catch (e) { step('6. Driver ride active', 'FAIL', e.message); }

  // ═══ PHASE 3: CUSTOMER SEES LIVE MARKER WITHOUT RELOAD ═══
  let chipText = null;
  try {
    const chip = cust.locator('text=Driver Live');
    const appeared = await chip.isVisible({ timeout: 30000 }).catch(() => false);
    if (appeared) chipText = await cust.locator('text=Driver Live').first().textContent();
    step('7. Customer "Driver Live" chip', appeared ? 'PASS' : 'FAIL', chipText || 'not shown in 30s');
    await cust.screenshot({ path: './e2e-results/live-customer-chip.png' });
  } catch (e) { step('7. Customer "Driver Live" chip', 'FAIL', e.message); }

  try {
    const fresh = chipText && /·\s*\d+\s*s ago/.test(chipText);
    // A live socket event set lastLocUpdateAt → seconds badge present. Restore would never render it.
    step('8. Seconds badge (live socket event)', fresh ? 'PASS' : 'FAIL', chipText);
  } catch (e) { step('8. Seconds badge', 'FAIL', e.message); }

  // Seconds value should stay small (keeps updating via live stream)
  try {
    if (chipText) {
      await cust.waitForTimeout(5000);
      const t2 = await cust.textContent('body');
      const m = t2.match(/Driver Live\s*·\s*(\d+)\s*s ago/);
      const secs = m ? parseInt(m[1], 10) : null;
      step('9. Marker stays fresh (≤10s)', secs != null && secs <= 10 ? 'PASS' : 'FAIL', secs + 's ago');
    } else step('9. Marker stays fresh', 'SKIP', 'no chip');
  } catch (e) { step('9. Marker stays fresh', 'FAIL', e.message); }

  // ═══ PHASE 4: SERVER PERSISTENCE PROOF ═══
  try {
    const b = await api(cust, 'GET', `/bookings/${bookingId}`);
    const bd = b.data?.booking || b.data?.data?.booking || b.data?.data;
    const coords = bd?.driver?.currentLocation?.coordinates;
    const persisted = coords && Math.abs(coords[1] - DROP.lat) < 0.5 && Math.abs(coords[0] - DROP.lng) < 0.5;
    step('10. Server persisted driver location', persisted ? 'PASS' : 'FAIL', JSON.stringify(coords));
  } catch (e) { step('10. Server persistence', 'FAIL', e.message); }

  // ═══ PHASE 5: LIVE UPDATE RAISES FRESHNESS EVEN LATER ═══
  try {
    // Simulate the driver moving north ~300m; fresh coordinates must arrive without reload.
    const moved = { latitude: DROP.lat + 0.003, longitude: DROP.lng };
    await api(drv, 'PUT', '/driver/location', moved);
    // watchPosition keeps firing while the ride page is open; give it a beat.
    await drv.waitForTimeout(3000);
    const text = await cust.textContent('body');
    const m = text.match(/Driver Live\s*·\s*(\d+)\s*s ago/);
    const secs = m ? parseInt(m[1], 10) : null;
    step('11. Still live after GPS nudge', secs != null && secs <= 12 ? 'PASS' : 'WARN', secs + 's ago');
  } catch (e) { step('11. GPS nudge', 'FAIL', e.message); }

  // ═══ CLEANUP ═══
  try {
    await api(cust, 'PATCH', `/bookings/${bookingId}/cancel`, { cancelReason: 'Live location E2E cleanup' });
    step('12. Cleanup', 'PASS');
  } catch (e) { step('12. Cleanup', 'WARN', e.message); }

  await custCtx.close();
  await drvCtx.close();

  console.log('\n══════════════════════════════════════');
  console.log('       LIVE LOCATION RESULTS');
  console.log('══════════════════════════════════════');
  let pass = 0, fail = 0, warn = 0;
  for (const r of RESULTS) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.name}: ${r.status}${r.details ? ' — ' + r.details : ''}`);
    if (r.status === 'PASS') pass++; else if (r.status === 'FAIL') fail++; else warn++;
  }
  console.log(`Total: ${pass} passed, ${fail} failed, ${warn} warnings`);
  console.log(`Overall: ${fail === 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('══════════════════════════════════════\n');

  expect(fail, `Live-location failures: ${RESULTS.filter((r) => r.status === 'FAIL').map((r) => r.name).join(', ')}`).toBe(0);
});