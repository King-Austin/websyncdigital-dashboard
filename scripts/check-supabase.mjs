import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if present
let envPath = new URL('../.env.local', import.meta.url).pathname;
if (!fs.existsSync(envPath)) {
  envPath = `${process.cwd()}/.env.local`;
}
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  });
}

function short(obj) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(2);
  }

  const admin = createClient(url, key);
  try {
    const [{ data: profiles, error: pErr }, { data: projects, error: prErr }, { data: payments, error: payErr }] = await Promise.all([
      admin.from('ws_profiles').select('id,name,email,role').limit(5),
      admin.from('ws_projects').select('id,status,client_id').limit(5),
      admin.from('ws_payments').select('reference,amount,status,paid_at').order('paid_at', { ascending: false }).limit(5),
    ]);
    if (pErr || prErr || payErr) {
      console.error('One or more queries failed:');
      if (pErr) console.error('profiles error:', pErr);
      if (prErr) console.error('projects error:', prErr);
      if (payErr) console.error('payments error:', payErr);
      process.exit(1);
    }

    console.log('Supabase check result:\n');
    console.log('Recent profiles:', short(profiles));
    console.log('Recent projects:', short(projects));
    console.log('Recent payments:', short(payments));

    // Summaries
    const [{ count: totalProfiles }, { count: totalProjects }, { count: totalPayments }] = await Promise.all([
      admin.from('ws_profiles').select('*', { count: 'estimated' }).maybeSingle(),
      admin.from('ws_projects').select('*', { count: 'estimated' }).maybeSingle(),
      admin.from('ws_payments').select('*', { count: 'estimated' }).maybeSingle(),
    ]).catch(() => [{ count: null }, { count: null }, { count: null }]);

    console.log('\nEstimates:');
    console.log('profiles (estimated):', totalProfiles ?? 'n/a');
    console.log('projects (estimated):', totalProjects ?? 'n/a');
    console.log('payments (estimated):', totalPayments ?? 'n/a');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

run();
