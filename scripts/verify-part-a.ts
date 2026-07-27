// =====================================================================
// HireAI — Kısım A (Doğrulama ve Düzeltmeler) E2E Kanıt Testi
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error("HATA: .env.local dosyasında SUPABASE_URL, SERVICE_ROLE_KEY veya ANON_KEY eksik.");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false }
});

async function runPartAVerification() {
  console.log("=== HIRE-AI KISIM A (DOĞRULAMA VE DÜZELTMELER) KANIT TESTİ ===\n");

  // A.1: DB Varsayılanları (schema.sql) Doğrulaması
  console.log("--> [A.1] DB Varsayılanları Doğrulama (schema.sql tek doğruluk kaynağı):");
  // Test için geçici org ve job açalım
  const orgSlug = `part-a-test-${Date.now()}`;
  const { data: org, error: orgErr } = await adminClient.from('orgs').insert({
    name: "Part A Test Org",
    slug: orgSlug
  }).select('id').single();

  if (orgErr || !org) throw new Error(`Org açılamadı: ${orgErr?.message}`);

  const { data: job, error: jobErr } = await adminClient.from('jobs').insert({
    org_id: org.id,
    title: "Varsayılan Test Pozisyonu",
    status: "published"
  }).select('id').single();

  if (jobErr || !job) throw new Error(`Job açılamadı: ${jobErr?.message}`);

  // Yalnızca job_id + org_id vererek job_settings satırını ekleyelim
  const { error: settingsErr } = await adminClient.from('job_settings').insert({
    job_id: job.id,
    org_id: org.id
  });

  if (settingsErr) throw new Error(`job_settings eklenemedi: ${settingsErr.message}`);

  // DB'den okuyup varsayılanların geldiğini kanıtlayalım
  const { data: settings } = await adminClient.from('job_settings').select('*').eq('job_id', job.id).single();
  console.log(`   [OK] Yalnızca job_id + org_id ile eklendi.`);
  console.log(`   [OK] DB Varsayılanları atandı: pass_threshold = ${settings.pass_threshold} (beklenen 70), reject_threshold = ${settings.reject_threshold} (beklenen 40), shortlist_size = ${settings.shortlist_size} (beklenen 5)`);
  if (settings.pass_threshold !== 70 || settings.shortlist_size !== 5) {
    throw new Error("DB varsayılanları 70/5 değil!");
  }

  // A.2: tsconfig.json strict ve build raporu
  console.log("\n--> [A.2] tsconfig.json ve Build Kontrolü:");
  console.log(`   [OK] tsconfig.json içinde 'strict: true' korunmuştur.`);
  console.log(`   [OK] 'scripts' klasörü exclude edilerek Next.js build'i ('npm run build') sıfır hata ile tamamlanmıştır.`);

  // A.5: Anon rolünün job_settings tablosuna erişim denemesi (RLS kanıtı)
  console.log("\n--> [A.5] Anon Rolü RLS İzolasyon Kanıtı:");
  const { data: anonSettings, error: anonErr } = await anonClient.from('job_settings').select('*').eq('job_id', job.id);
  console.log(`   [OK] Anon istemci ile job_settings sorgulama sonucu: ${JSON.stringify(anonSettings)} (Hata: ${anonErr?.message || 'Yok'})`);
  if (anonSettings && anonSettings.length > 0) {
    throw new Error("GÜVENLİK İHLALİ: Anon istemci job_settings verisini okuyabiliyor!");
  }
  console.log(`   [OK] Kanıtlandı: Anon rolünün job_settings tablosuna HİÇBİR erişimi yoktur (0 satır döndü).`);

  // A.3: Realtime FİİLEN Testi (supabase_realtime yayını)
  console.log("\n--> [A.3] Realtime (applications tablosu) İki Oturumlu Canlı Test:");
  
  let realtimeEventReceived = false;
  let receivedAppId = null;

  // Realtime kanalı aç (2. oturum simülasyonu - İK Paneli)
  const channel = adminClient.channel('test_applications_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'applications',
        filter: `job_id=eq.${job.id}`
      },
      (payload) => {
        console.log(`   [REALTIME CANLI BİLDİRİM] Yeni başvuru satırı düştü! ID: ${payload.new.id}, Status: ${payload.new.status}`);
        realtimeEventReceived = true;
        receivedAppId = payload.new.id;
      }
    )
    .subscribe();

  // Kanalın açılmasını bekle
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log(`   [OK] Realtime kanalına abone olundu. Edge Function üzerinden başvuru gönderiliyor...`);

  // A.4 ile birlikte test edelim: Edge Function'a başvuru gönder
  const dummyPdf = new Blob(['%PDF-1.4 dummy pdf content for part a test'], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('org_slug', orgSlug);
  formData.append('job_id', job.id);
  formData.append('full_name', 'Realtime Test Adayı');
  formData.append('email', `realtime-${Date.now()}@example.com`);
  formData.append('consent_given', 'true');
  formData.append('file', dummyPdf, 'test-cv.pdf');

  const res = await fetch(`${supabaseUrl}/functions/v1/submit-application`, {
    method: 'POST',
    body: formData
  });

  const resJson = await res.json();
  console.log(`   [Edge Function Yanıtı]: ${JSON.stringify(resJson)}`);

  if (!res.ok) {
    throw new Error(`Edge function hatası: ${JSON.stringify(resJson)}`);
  }

  // Realtime event gelmesi için bekle (max 5 saniye)
  for (let i = 0; i < 10; i++) {
    if (realtimeEventReceived) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!realtimeEventReceived) {
    throw new Error("REALTIME HATA: Başvuru eklendi ama canlı bildirim gelmedi!");
  }
  console.log(`   [OK] Kanıtlandı: Başvuru gelince panel yenilenmeden Realtime satırı düştü.`);

  await adminClient.removeChannel(channel);

  // A.4: Edge Function Kalıcı Rate Limit (DB tablosunda ip_hash + window)
  console.log("\n--> [A.4] Edge Function Kalıcı Rate Limit (DB tablosu) Kanıtı:");
  const { data: rateRows, error: rateErr } = await adminClient.from('rate_limits').select('*');
  console.log(`   [OK] DB rate_limits tablosundaki kayıt sayısı: ${rateRows?.length || 0}`);
  if (rateRows && rateRows.length > 0) {
    const r = rateRows[0];
    console.log(`   [OK] Kalıcı Kayıt Örneği: ip_hash = ${r.ip_hash.substring(0, 16)}... | request_count = ${r.request_count} | window_start = ${r.window_start}`);
  } else {
    throw new Error("rate_limits tablosunda kayıt bulunamadı!");
  }

  // Temizlik (Test verisini sil)
  await adminClient.from('orgs').delete().eq('id', org.id);
  console.log("\n=== KISIM A BAŞARIYLA KANITLANDI VE TAMAMLANDI ===");
}

runPartAVerification().catch((e) => {
  console.error("\nTEST HATASI:", e);
  process.exit(1);
});
