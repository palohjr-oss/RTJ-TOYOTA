import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Automated Verification for RTJ Web Backend API...\n');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('✅ Health check:', health.service);
  assert.strictEqual(health.status, 'ok');

  // 2. Test Login for HENDRI (Admin)
  const loginHendriRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'HENDRI', password: 'BISMILLAH' })
  });
  const loginHendri = await loginHendriRes.json();
  console.log('✅ Login HENDRI (Admin):', loginHendri.success, '- Role:', loginHendri.data?.user?.role);
  assert.strictEqual(loginHendri.success, true);
  assert.strictEqual(loginHendri.data.user.role, 'Admin');
  const adminToken = loginHendri.data.token;

  // 3. Test Login for DEBBY (FO)
  const loginDebbyRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'DEBBY', password: '1' })
  });
  const loginDebby = await loginDebbyRes.json();
  console.log('✅ Login DEBBY (FO):', loginDebby.success, '- Role:', loginDebby.data?.user?.role);
  assert.strictEqual(loginDebby.success, true);
  const foToken = loginDebby.data.token;

  // 4. Test Dashboard Summary
  const summaryRes = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const summary = await summaryRes.json();
  console.log('✅ Dashboard Summary:', {
    total: summary.data.total,
    completed: summary.data.completed,
    pending: summary.data.pending,
    scheduled: summary.data.scheduled,
    rescheduled: summary.data.rescheduled
  });
  assert.strictEqual(summary.success, true);
  assert(summary.data.total > 0);

  // 5. Test Dashboard Charts
  const chartRes = await fetch(`${BASE_URL}/dashboard/chart`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const chart = await chartRes.json();
  console.log('✅ Chart Data:', {
    donutItems: chart.data.donutData.length,
    saItems: chart.data.saData.length
  });
  assert.strictEqual(chart.success, true);

  // 6. Test Data RTJ List with Filtering
  const rtjListRes = await fetch(`${BASE_URL}/rtj?page=1&limit=10&kategori_q=Q1`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const rtjList = await rtjListRes.json();
  console.log('✅ RTJ List (Q1 filter): Total count:', rtjList.pagination.total);
  assert.strictEqual(rtjList.success, true);

  // 7. Test Create Manual RTJ
  const createRtjRes = await fetch(`${BASE_URL}/rtj`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${foToken}`
    },
    body: JSON.stringify({
      nama_customer: 'Testing Customer Verification',
      no_polisi: 'DA 9999 XX',
      no_hp: '081299998888',
      model: 'Innova Zenix Hybrid',
      sa: 'Riza Anshari',
      fo: 'Debby',
      kategori_q: 'Q2',
      tanggal_service: '2026-09-12',
      km_service: 5000,
      tanggal_rtj: '2026-09-12',
      status_rtj: 'Scheduled',
      detail_kendala: 'Uji coba penambahan data RTJ baru via API',
      keterangan: 'Menunggu konfirmasi customer'
    })
  });
  const createRtj = await createRtjRes.json();
  console.log('✅ Create RTJ:', createRtj.success, '- ID:', createRtj.data?.id);
  assert.strictEqual(createRtj.success, true);
  const createdId = createRtj.data.id;

  // 8. Test Update Status & History Logging
  const updateRtjRes = await fetch(`${BASE_URL}/rtj/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${foToken}`
    },
    body: JSON.stringify({
      status_rtj: 'Completed',
      catatan_perubahan: 'Customer sudah dihubungi via WA dan melakukan booking.'
    })
  });
  const updateRtj = await updateRtjRes.json();
  console.log('✅ Update Status RTJ to Completed:', updateRtj.success);
  assert.strictEqual(updateRtj.success, true);

  // 9. Test Detail RTJ & Check History log
  const detailRes = await fetch(`${BASE_URL}/rtj/${createdId}`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const detail = await detailRes.json();
  console.log('✅ Detail RTJ History entries count:', detail.data?.history?.length);
  assert(detail.data.history.length >= 2);
  console.log('   Latest History Log:', detail.data.history[0].keterangan, 'by', detail.data.history[0].updated_by_name);

  // 10. Test User Management (Admin Only)
  const usersRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const users = await usersRes.json();
  console.log('✅ Admin Get Users count:', users.data?.length);
  assert(users.data.some(u => u.username === 'HENDRI'));
  assert(users.data.some(u => u.username === 'DEBBY'));

  // 11. Test FO Forbidden to access /users
  const forbiddenUsersRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${foToken}` }
  });
  console.log('✅ Role check guard (FO blocked from /users): Status', forbiddenUsersRes.status);
  assert.strictEqual(forbiddenUsersRes.status, 403);

  // 12. Clean up test record
  await fetch(`${BASE_URL}/rtj/${createdId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('✅ Clean up test record deleted successfully.');

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🚗💨\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
