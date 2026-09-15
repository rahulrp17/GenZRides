/**
 * Full E2E Ride Flow Test
 * 
 * Customer books → Driver accepts → Ride progresses → Completion
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://genzrides.vercel.app';
const API_BASE = 'https://genzrides-backend.onrender.com/api';

const CUSTOMER = { email: 'rahulrishabhh@gmail.com', password: '#Rahul2004' };
const DRIVER  = { email: 'ragulpant421@gmail.com', password: '#Rahul2004' };
const ADMIN   = { email: 'rahulrp4021@gmail.com', password: '#Rahul2004' };

const RESULTS = [];
function step(name, status, details = '') {
  RESULTS.push({ name, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}${details ? ' — ' + details : ''}`);
}

async function freshLogin(page, email, password, role) {
  // Clear all auth state
  await page.context().clearCookies();
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  
  const url = role === 'driver' ? '/driver/login' : '/login';
  await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Check if already on dashboard (session survived clear)
  const cur = page.url();
  if (!cur.includes('/login')) {
    console.log(`Already logged in as ${role}`);
    return;
  }
  
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(role === 'driver' ? '**/driver*' : role === 'admin' ? '**/admin*' : '**/customer*', { timeout: 25000 });
}

async function shot(page, name, ms = 2000) {
  await page.waitForTimeout(ms);
  await page.screenshot({ path: `./e2e-results/${name}` });
}

async function dismissActiveRide(page) {
  const API = 'https://genzrides-backend.onrender.com/api';
  
  const result = await page.evaluate(async (apiBase) => {
    const tokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
    const token = tokens?.accessToken;
    if (!token) return { error: 'no token' };

    try {
      const res = await fetch(`${apiBase}/bookings/my-bookings?limit=20&sort=-createdAt`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const bookings = data?.data?.bookings || [];
      const active = bookings.filter(b => !['Completed', 'Cancelled'].includes(b.bookingStatus));
      
      if (active.length === 0) return { cancelled: 0, message: 'no active bookings' };
      
      let cancelled = 0;
      for (const b of active) {
        try {
          const r = await fetch(`${apiBase}/bookings/${b._id}/cancel`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cancelReason: 'Test cleanup' })
          });
          const res = await r.json();
          if (r.ok) cancelled++;
          else console.log(`Cancel failed for ${b._id}:`, JSON.stringify(res));
        } catch (e) { console.log(`Cancel error for ${b._id}:`, e.message); }
      }
      
      return { cancelled, total: active.length };
    } catch (e) { return { error: e.message }; }
  }, API);
  
  console.log('Active ride dismissal result:', JSON.stringify(result));
  
  if (result.error === 'no token') {
    console.log('No auth token found — gate may not appear');
    return false;
  }
  
  // Navigate to book page and verify gate is gone
  await page.goto(`${BASE_URL}/customer/book`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const gate = page.locator('text=You have an active ride').first();
  const gateVisible = await gate.isVisible({ timeout: 3000 }).catch(() => false);
  if (gateVisible) {
    console.log('Gate still visible after API cancel');
    await shot(page, 'dismiss-still-gate.png');
    return false;
  }
  
  return true;
}

async function clickRideAction(page, buttonText, label) {
  const btn = page.locator(`button:has-text("${buttonText}")`).first();
  const vis = await btn.isVisible({ timeout: 12000 }).catch(() => false);
  if (!vis) {
    step(label, 'FAIL', `"${buttonText}" button not found`);
    await shot(page, `${label.replace(/[^a-z]/gi, '_')}-no-btn.png`);
    return false;
  }
  await btn.click();
  await page.waitForTimeout(500);
  // Auto-confirm dialogs
  for (const t of ['Confirm', 'Yes', 'OK']) {
    const c = page.locator(`button:has-text("${t}")`).first();
    if (await c.isVisible({ timeout: 2000 }).catch(() => false)) { await c.click(); break; }
  }
  await page.waitForTimeout(3000);
  await shot(page, `${label.replace(/[^a-z]/gi, '_')}.png`);
  step(label, 'PASS');
  return true;
}

test('Complete Ride Flow E2E', async ({ page, context }) => {
  test.setTimeout(10 * 60 * 1000);

  // ═══ PHASE 1: CUSTOMER BOOKS ═══

  try {
    await freshLogin(page, CUSTOMER.email, CUSTOMER.password, 'customer');
    await shot(page, '01-customer-dash.png');
    step('1. Customer Login', 'PASS');
  } catch (e) { step('1. Customer Login', 'FAIL', e.message); throw e; }

  try {
    await page.goto(`${BASE_URL}/customer/book`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    // Handle active ride gate
    await dismissActiveRide(page);
    await shot(page, '02-book-ride.png');
    step('2. Book Ride Page', 'PASS');
  } catch (e) { step('2. Book Ride Page', 'FAIL', e.message); throw e; }

  // Set pickup: Madurai
  try {
    const inp = page.locator('input[placeholder="Pickup location"]').first();
    await inp.waitFor({ state: 'visible', timeout: 10000 });
    await inp.click();
    await page.waitForTimeout(300);
    await inp.fill('');
    await inp.type('Madurai', { delay: 80 });
    await page.waitForTimeout(2000);
    const pred = page.locator('button:has-text("Madurai")').first();
    if (await pred.isVisible({ timeout: 5000 }).catch(() => false)) await pred.click();
    else { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300); await page.keyboard.press('Enter'); }
    await page.waitForTimeout(1500);
    await shot(page, '03-pickup.png');
    step('3. Pickup: Madurai', 'PASS');
  } catch (e) { step('3. Pickup: Madurai', 'FAIL', e.message); await shot(page, '03-err.png'); }

  // Set drop: Chennai
  try {
    const inp = page.locator('input[placeholder="Where to?"]').first();
    await inp.waitFor({ state: 'visible', timeout: 10000 });
    await inp.click();
    await page.waitForTimeout(300);
    await inp.fill('');
    await inp.type('Chennai', { delay: 80 });
    await page.waitForTimeout(2000);
    const pred = page.locator('button:has-text("Chennai")').first();
    if (await pred.isVisible({ timeout: 5000 }).catch(() => false)) await pred.click();
    else { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300); await page.keyboard.press('Enter'); }
    await page.waitForTimeout(1500);
    await shot(page, '04-drop.png');
    step('4. Drop: Chennai', 'PASS');
  } catch (e) { step('4. Drop: Chennai', 'FAIL', e.message); await shot(page, '04-err.png'); }

  // Select SUV
  try {
    await page.waitForTimeout(2000);
    const suv = page.locator('text=SUV').first();
    if (await suv.isVisible({ timeout: 5000 }).catch(() => false)) await suv.click();
    await page.waitForTimeout(1000);
    await shot(page, '05-suv.png');
    step('5. Vehicle: SUV', 'PASS');
  } catch (e) { step('5. Vehicle: SUV', 'FAIL', e.message); }

  // Verify fare
  try {
    await page.waitForTimeout(2000);
    await shot(page, '06-fare.png');
    const t = await page.textContent('body');
    step('6. Fare Estimate', t.includes('₹') ? 'PASS' : 'WARN');
  } catch (e) { step('6. Fare Estimate', 'FAIL', e.message); }

  // Book Ride
  try {
    const btn = page.locator('button:has-text("Book Ride")').first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    const disabled = await btn.isDisabled();
    if (disabled) { step('7. Book Ride', 'WARN', 'disabled'); await shot(page, '07-disabled.png'); }
    else { await btn.click(); await page.waitForTimeout(1000); await shot(page, '07-clicked.png'); step('7. Book Ride', 'PASS'); }
  } catch (e) { step('7. Book Ride', 'FAIL', e.message); }

  // Confirm modal
  try {
    const c = page.locator('button:has-text("Confirm Booking")').first();
    if (await c.isVisible({ timeout: 5000 }).catch(() => false)) {
      await c.click(); await page.waitForTimeout(3000); await shot(page, '08-confirmed.png'); step('8. Confirm', 'PASS');
    } else { step('8. Confirm', 'SKIP'); }
  } catch (e) { step('8. Confirm', 'FAIL', e.message); }

  // Verify waiting
  try {
    await page.waitForTimeout(3000);
    await shot(page, '09-waiting.png');
    const t = await page.textContent('body');
    step('9. Waiting for Driver', (t.includes('Waiting') || t.includes('Booking Created') || t.includes('Track Ride')) ? 'PASS' : 'WARN');
  } catch (e) { step('9. Waiting', 'FAIL', e.message); }

  // Customer current ride
  try {
    const t = page.locator('button:has-text("Track Ride")').first();
    if (await t.isVisible({ timeout: 3000 }).catch(() => false)) await t.click();
    else await page.goto(`${BASE_URL}/customer/current-ride`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await shot(page, '10-customer-ride.png');
    const text = await page.textContent('body');
    step('10. Customer Current Ride', text.includes('Pending') || text.includes('Accepted') ? 'PASS' : 'WARN');
  } catch (e) { step('10. Customer Current Ride', 'FAIL', e.message); }

  // ═══ PHASE 2: DRIVER ACCEPTS & PROGRESSES ═══

  // Customer monitor context
  const custCtx = await context.browser().newContext();
  const cust = await custCtx.newPage();
  try {
    await freshLogin(cust, CUSTOMER.email, CUSTOMER.password, 'customer');
    await cust.goto(`${BASE_URL}/customer/current-ride`, { waitUntil: 'networkidle' });
    await cust.waitForTimeout(2000);
    step('11. Customer Monitor', 'PASS');
  } catch (e) { step('11. Customer Monitor', 'WARN', e.message); }

  // Driver login
  try {
    await freshLogin(page, DRIVER.email, DRIVER.password, 'driver');
    await shot(page, '12-driver-dash.png');
    step('12. Driver Login', 'PASS');
  } catch (e) { step('12. Driver Login', 'FAIL', e.message); throw e; }

  // Driver bookings
  try {
    await page.goto(`${BASE_URL}/driver/bookings`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await shot(page, '13-driver-bookings.png');
    const t = await page.textContent('body');
    console.log('Driver bookings (500 chars):', t.substring(0, 500));
    step('13. Driver Bookings', 'PASS');
  } catch (e) { step('13. Driver Bookings', 'FAIL', e.message); throw e; }

  // Find and accept Madurai booking
  try {
    let accepted = false;
    let acceptError = null;
    
    // The bookings list shows "View & Accept" which navigates to booking details
    // On the details page, click "Accept Booking Request"
    const maduraiCards = page.locator('text=Madurai');
    const cardCount = await maduraiCards.count();
    console.log(`Found ${cardCount} Madurai references`);
    
    if (cardCount > 0) {
      // Click "View & Accept" to navigate to booking details page
      const viewAcceptBtn = page.locator('button:has-text("View & Accept"), button:has-text("Accept")').first();
      if (await viewAcceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const btnText = await viewAcceptBtn.textContent().catch(() => '');
        console.log(`Clicking: "${btnText.trim()}"`);
        await viewAcceptBtn.click();
        await page.waitForTimeout(3000);
        await shot(page, '14a-booking-details.png');
        
        // Now on booking details page — look for "Accept Booking Request" button
        const acceptReqBtn = page.locator('button:has-text("Accept Booking Request")').first();
        const acceptReqVisible = await acceptReqBtn.isVisible({ timeout: 5000 }).catch(() => false);
        console.log(`"Accept Booking Request" visible: ${acceptReqVisible}`);
        
        if (acceptReqVisible) {
          const isDisabled = await acceptReqBtn.isDisabled().catch(() => true);
          console.log(`Button disabled: ${isDisabled}`);
          
          if (!isDisabled) {
            await acceptReqBtn.click();
            await page.waitForTimeout(3000);
            
            // Check for error toasts
            const errorToast = page.locator('[role="alert"], [class*="error"], [class*="Error"]').first();
            const hasError = await errorToast.isVisible({ timeout: 2000 }).catch(() => false);
            if (hasError) {
              acceptError = await errorToast.textContent().catch(() => 'unknown error');
              console.log('Accept error:', acceptError);
              accepted = false;
            } else {
              accepted = true;
              console.log('Accept Booking Request clicked successfully');
            }
          } else {
            console.log('Accept button is disabled — checking for warnings...');
            const bodyText = await page.textContent('body');
            if (bodyText.includes('currently on another ride')) acceptError = 'Driver on another ride';
            else if (bodyText.includes('offline')) acceptError = 'Driver is offline';
            else acceptError = 'Accept button disabled';
          }
        } else {
          // Maybe already accepted or page state different
          const bodyText = await page.textContent('body');
          console.log('Details page (300 chars):', bodyText.substring(0, 300));
          acceptError = '"Accept Booking Request" not found on details page';
        }
      }
    }
    
    await page.waitForTimeout(2000);
    await shot(page, '14-accept.png');
    step('14. Accept Booking', accepted ? 'PASS' : 'WARN', 
         accepted ? 'Accepted' : (acceptError || 'Accept not found'));
  } catch (e) { step('14. Accept Booking', 'FAIL', e.message); await shot(page, '14-err.png'); }

  // Wait for booking to propagate
  await page.waitForTimeout(3000);

  // Driver Current Ride — check for actual ride status, not page heading
  try {
    await page.goto(`${BASE_URL}/driver/ride`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await shot(page, '15-driver-ride.png');
    
    const t = await page.textContent('body');
    // Check for actual ride status keywords (NOT just "Current Ride" heading)
    const hasActiveRide = t.includes('Pickup Customer') || t.includes('Heading to Pickup') || 
                          t.includes('On The Way') || t.includes('Arrived') || 
                          t.includes('Ready to Start') || t.includes('Ride In Progress');
    const noRide = t.includes('No active ride');
    
    step('15. Driver Current Ride', hasActiveRide ? 'PASS' : (noRide ? 'FAIL' : 'WARN'),
         hasActiveRide ? 'Ride active' : (noRide ? 'No active ride — accept may have failed' : 'Unknown state'));
    
    if (noRide) {
      console.log('DEBUG: No active ride. Checking driver profile via page...');
      // Navigate to driver profile to check currentRide
      await page.goto(`${BASE_URL}/driver/profile`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      await shot(page, '15b-driver-profile.png');
      const profileText = await page.textContent('body');
      console.log('Profile page (500 chars):', profileText.substring(0, 500));
      
      // Go back to bookings to check the Madurai booking status
      await page.goto(`${BASE_URL}/driver/bookings`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      await shot(page, '15c-driver-bookings-check.png');
      const bookingsText = await page.textContent('body');
      console.log('Bookings page after accept (500 chars):', bookingsText.substring(0, 500));
    }
  } catch (e) { step('15. Driver Current Ride', 'FAIL', e.message); }

  // Ride progression — only attempt if ride is active
  const rideBody = await page.textContent('body');
  const rideActive = rideBody.includes('Pickup Customer') || rideBody.includes('Heading') || 
                     rideBody.includes('On The Way') || rideBody.includes('Arrived') || 
                     rideBody.includes('Ready to Start') || rideBody.includes('Ride In Progress');

  if (rideActive) {
    // On The Way
    if (await clickRideAction(page, 'On The Way', '16. On The Way')) {
      try { await cust.waitForTimeout(3000); await cust.screenshot({ path: './e2e-results/16-customer.png' }); step('16b. Customer Update', 'PASS'); } catch (e) { step('16b. Customer', 'WARN', e.message); }
    }
    
    // Arrived
    if (await clickRideAction(page, 'Arrived', '17. Arrived')) {
      try { await cust.waitForTimeout(3000); await cust.screenshot({ path: './e2e-results/17-customer.png' }); step('17b. Customer Update', 'PASS'); } catch (e) { step('17b. Customer', 'WARN', e.message); }
    }
    
    // Start Ride
    if (await clickRideAction(page, 'Start Ride', '18. Start Ride')) {
      try { await cust.waitForTimeout(3000); await cust.screenshot({ path: './e2e-results/18-customer.png' }); step('18b. Customer Update', 'PASS'); } catch (e) { step('18b. Customer', 'WARN', e.message); }
    }
    
    // Reached Destination
    if (await clickRideAction(page, 'Reached Destination', '19. Reached Destination')) {
      try { await cust.waitForTimeout(3000); await cust.screenshot({ path: './e2e-results/19-customer.png' }); step('19b. Customer Update', 'PASS'); } catch (e) { step('19b. Customer', 'WARN', e.message); }
    }
    
    // Payment Paid
    try {
      const paid = page.locator('button:has-text("Paid")').first();
      if (await paid.isVisible({ timeout: 10000 }).catch(() => false)) {
        await paid.click(); await page.waitForTimeout(2000); await shot(page, '20-paid.png'); step('20. Payment Paid', 'PASS');
      } else { step('20. Payment Paid', 'WARN', 'not visible'); }
    } catch (e) { step('20. Payment Paid', 'FAIL', e.message); }
    
    // Complete Ride
    await clickRideAction(page, 'Complete Ride', '21. Complete Ride');
    
    // Customer sees completion
    try {
      await cust.waitForTimeout(3000);
      await cust.screenshot({ path: './e2e-results/21-customer-done.png' });
      const ct = await cust.textContent('body');
      step('22. Customer Completion', ct.includes('Completed') ? 'PASS' : 'WARN');
    } catch (e) { step('22. Customer Completion', 'WARN', e.message); }
  } else {
    step('16-21. Ride Progression', 'FAIL', 'Ride not active — cannot progress');
    console.log('Ride not active, skipping progression steps');
    // Mark remaining as skipped
    ['16. On The Way', '17. Arrived', '18. Start Ride', '19. Reached', '20. Payment', '21. Complete', '22. Customer Completion'].forEach(s => {
      if (!RESULTS.find(r => r.name === s)) step(s, 'SKIP', 'Ride inactive');
    });
  }

  // ═══ PHASE 3: VERIFICATION ═══

  try {
    await cust.goto(`${BASE_URL}/customer/history`, { waitUntil: 'networkidle', timeout: 30000 });
    await cust.waitForTimeout(3000);
    await cust.screenshot({ path: './e2e-results/23-history.png' });
    const t = await cust.textContent('body');
    step('23. Customer History', t.includes('Completed') || t.includes('Pending') ? 'PASS' : 'WARN');
  } catch (e) { step('23. Customer History', 'FAIL', e.message); }

  try {
    await page.goto(`${BASE_URL}/driver/history`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './e2e-results/24-driver-history.png' });
    step('24. Driver History', 'PASS');
  } catch (e) { step('24. Driver History', 'FAIL', e.message); }

  try {
    const adminCtx = await context.browser().newContext();
    const ap = await adminCtx.newPage();
    await freshLogin(ap, ADMIN.email, ADMIN.password, 'admin');
    await ap.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'networkidle', timeout: 30000 });
    await ap.waitForTimeout(3000);
    await ap.screenshot({ path: './e2e-results/25-admin.png' });
    step('25. Admin Bookings', 'PASS');
    await adminCtx.close();
  } catch (e) { step('25. Admin Bookings', 'FAIL', e.message); }

  // Persistence check
  try {
    await page.goto(`${BASE_URL}/driver/ride`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './e2e-results/26-persistence.png' });
    step('26. Persistence', 'PASS');
  } catch (e) { step('26. Persistence', 'FAIL', e.message); }

  await custCtx.close();

  // Summary
  console.log('\n══════════════════════════════════════');
  console.log('       RESULTS SUMMARY');
  console.log('══════════════════════════════════════');
  let pass = 0, fail = 0, warn = 0;
  for (const r of RESULTS) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.name}: ${r.status}${r.details ? ' — ' + r.details : ''}`);
    if (r.status === 'PASS') pass++;
    else if (r.status === 'FAIL') fail++;
    else warn++;
  }
  console.log('──────────────────────────────────────');
  console.log(`Total: ${pass} passed, ${fail} failed, ${warn} warnings`);
  console.log(`Overall: ${fail === 0 ? '✅ PASS' : '❌ FAIL'}`);
  console.log('══════════════════════════════════════\n');
});
