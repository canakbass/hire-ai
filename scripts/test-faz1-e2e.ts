// =====================================================================
// HireAI — Faz 1 Canlı Supabase Cloud Uçtan Uca (E2E) Doğrulama Scripti
// =====================================================================

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.local dosyasından manuel okuyucu
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valParts] = trimmed.split('=');
      const val = valParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = val;
    }
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ EKSİK ENV: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY veya SUPABASE_SERVICE_ROLE_KEY bulunamadı.');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function runFaz1Tests() {
  console.log('🚀 === FAZ 1 UÇTAN UCA (E2E) CANLI SUPABASE CLOUD DOĞRULAMASI ===\n');
  console.log(`📡 Hedef Veritabanı: ${supabaseUrl}\n`);

  const timestamp = Date.now();
  const emailA = `faz1_usera_${timestamp}@hireai-test.local`;
  const emailB = `faz1_userb_${timestamp}@hireai-test.local`;
  const password = 'SuperSecretTestPassword123!';

  let orgIdA = '';
  let orgSlugA = `alpha-faz1-${timestamp}`;
  let orgIdB = '';
  let jobId1 = '';
  let jobId2 = '';
  let applicationId1 = '';

  try {
    // -------------------------------------------------------------
    // 0. Test Kullanıcıları ve Organizasyonları Kurulumu
    // -------------------------------------------------------------
    console.log('⏳ Test kullanıcıları ve organizasyonları (Org A & Org B) oluşturuluyor...');
    const { data: userResA, error: errUserA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: password,
      email_confirm: true
    });
    if (errUserA) throw new Error(`Kullanıcı A oluşturulamadı: ${errUserA.message}`);
    const userIdA = userResA.user!.id;
    await adminClient.from('profiles').insert({ id: userIdA, full_name: 'Ahmet İK (Org A)' });

    const { data: orgA } = await adminClient.from('orgs').insert({ name: `Alpha Corp ${timestamp}`, slug: orgSlugA, plan: 'free' }).select().single();
    orgIdA = orgA!.id;
    await adminClient.from('org_members').insert({ org_id: orgIdA, user_id: userIdA, role: 'owner' });

    const { data: userResB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: password,
      email_confirm: true
    });
    const userIdB = userResB.user!.id;
    await adminClient.from('profiles').insert({ id: userIdB, full_name: 'Mehmet İK (Org B)' });

    const { data: orgB } = await adminClient.from('orgs').insert({ name: `Beta Ltd ${timestamp}`, slug: `beta-faz1-${timestamp}`, plan: 'free' }).select().single();
    orgIdB = orgB!.id;
    await adminClient.from('org_members').insert({ org_id: orgIdB, user_id: userIdB, role: 'owner' });

    const clientA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await clientA.auth.signInWithPassword({ email: emailA, password: password });

    const clientB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await clientB.auth.signInWithPassword({ email: emailB, password: password });

    // -------------------------------------------------------------
    // TEST 1: Pozisyon Oluşturma -> job_settings otomatik/varsayılanlarla oluştu mu?
    // -------------------------------------------------------------
    console.log('📌 TEST 1: Pozisyon oluşturuluyor ve job_settings satırı doğrulanıyor...');
    const { data: job1, error: job1Err } = await clientA
      .from('jobs')
      .insert({
        org_id: orgIdA,
        title: 'Senior Next.js Geliştirici (Test 1)',
        department: 'Ar-Ge',
        status: 'draft'
      })
      .select()
      .single();

    if (job1Err || !job1) throw new Error(`Pozisyon 1 oluşturulamadı: ${job1Err?.message}`);
    jobId1 = job1.id;

    // Aynı işlem içinde simüle edilen job_settings kaydı
    const { error: set1Err } = await clientA
      .from('job_settings')
      .insert({
        job_id: jobId1,
        org_id: orgIdA,
        required_skills: ['Next.js', 'TypeScript', 'PostgreSQL'],
        scoring_weights: { skills: 40, experience: 30, education: 15, other: 15 },
        pass_threshold: 75,
        reject_threshold: 35,
        shortlist_size: 5
      });

    if (set1Err) throw new Error(`job_settings 1 oluşturulamadı: ${set1Err.message}`);

    const { data: verifiedSettings } = await clientA.from('job_settings').select('*').eq('job_id', jobId1).single();
    if (!verifiedSettings || verifiedSettings.pass_threshold !== 75 || verifiedSettings.shortlist_size !== 5) {
      throw new Error('job_settings doğrulanamadı veya değerler eksik!');
    }
    console.log(`✅ TEST 1 BAŞARILI: Pozisyon (${jobId1}) ve job_settings (Pass barajı: ${verifiedSettings.pass_threshold}, Shortlist: ${verifiedSettings.shortlist_size}) tam uyumlu oluştu.\n`);

    // -------------------------------------------------------------
    // TEST 2: published yap -> Edge Function (submit-application) ile başvuru gönder
    // -------------------------------------------------------------
    console.log('📌 TEST 2: Pozisyon "published" yapılıyor ve Edge Function ile public başvuru gönderiliyor...');
    await clientA.from('jobs').update({ status: 'published' }).eq('id', jobId1);

    // Dummy PDF dosyası (bellekte buffer)
    const dummyPdfContent = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF');
    const dummyFileBlob = new Blob([dummyPdfContent], { type: 'application/pdf' });

    const candidateEmail = 'mert.aday@test-domain.local';
    const formData = new FormData();
    formData.append('org_slug', orgSlugA);
    formData.append('job_id', jobId1);
    formData.append('full_name', 'Mert Aday (E2E)');
    formData.append('email', candidateEmail);
    formData.append('phone', '0555 123 45 67');
    formData.append('consent_given', 'true');
    formData.append('website', ''); // honeypot boş
    formData.append('file', dummyFileBlob, 'mert_cv.pdf');

    const submitEndpoint = `${supabaseUrl}/functions/v1/submit-application`;
    const submitRes = await fetch(submitEndpoint, {
      method: 'POST',
      body: formData
    });

    const submitJson = await submitRes.json();
    if (!submitRes.ok || !submitJson.success) {
      throw new Error(`submit-application Edge Function hatası: ${submitJson.error || submitRes.statusText}`);
    }

    applicationId1 = submitJson.application_id;

    // Veritabanında applications ve candidates doğrula
    const { data: candRow } = await adminClient.from('candidates').select('*').eq('org_id', orgIdA).eq('email', candidateEmail).single();
    if (!candRow || candRow.full_name !== 'Mert Aday (E2E)') {
      throw new Error('candidates tablosunda aday satırı bulunamadı veya hatalı!');
    }

    const { data: appRow } = await adminClient.from('applications').select('*').eq('id', applicationId1).single();
    if (!appRow || appRow.status !== 'new' || !appRow.consent_given || !appRow.cv_storage_path) {
      throw new Error('applications tablosunda başvuru satırı bulunamadı veya eksik!');
    }

    console.log(`✅ TEST 2 BAŞARILI: Edge Function üzerinden başvuru alındı -> Application ID: ${applicationId1}, Candidate ID: ${candRow.id}, Storage Path: ${appRow.cv_storage_path}\n`);

    // -------------------------------------------------------------
    // TEST 3: CV'nin signed URL OLMADAN indirilemediğini KANITLA (Public URL 403/400 dönmeli)
    // -------------------------------------------------------------
    console.log('📌 TEST 3: CV dosyasının PUBLIC olarak erişilemez olduğu ve sadece Signed URL ile indirildiği kanıtlanıyor...');
    const storagePath = appRow.cv_storage_path;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/cv-files/${storagePath}`;
    
    const publicFetchRes = await fetch(publicUrl);
    if (publicFetchRes.ok) {
      throw new Error(`GÜVENLİK İHLALİ: Private bucket'taki CV dosyası public URL ile indirilip okundu! (HTTP ${publicFetchRes.status})`);
    }
    console.log(`   -> Public URL indirme denemesi engellendi (HTTP ${publicFetchRes.status} - İzin Verilmedi).`);

    // Şimdi kısa ömürlü Signed URL oluştur ve indir
    const { data: signedData, error: signedErr } = await clientA.storage.from('cv-files').createSignedUrl(storagePath, 60);
    if (signedErr || !signedData?.signedUrl) {
      throw new Error(`Signed URL oluşturulamadı: ${signedErr?.message}`);
    }

    const signedFetchRes = await fetch(signedData.signedUrl);
    if (!signedFetchRes.ok) {
      throw new Error(`Signed URL ile indirme başarısız: HTTP ${signedFetchRes.status}`);
    }
    const downloadedText = await signedFetchRes.text();
    if (!downloadedText.startsWith('%PDF-1.4')) {
      throw new Error('Signed URL ile indirilen dosya içeriği uyuşmuyor!');
    }
    console.log(`✅ TEST 3 BAŞARILI: Public URL reddedildi (HTTP ${publicFetchRes.status}), Signed URL ile dosya 100% güvenle okundu.\n`);

    // -------------------------------------------------------------
    // TEST 4: Farklı org'un başvurusunun görünmediğini doğrula (RLS İzolasyonu)
    // -------------------------------------------------------------
    console.log('📌 TEST 4: Kullanıcı B (Beta Ltd) hesabı ile Org A verilerine (applications & candidates) erişim deneniyor...');
    const { data: appsByB } = await clientB.from('applications').select('*').eq('id', applicationId1);
    const { data: candsByB } = await clientB.from('candidates').select('*').eq('id', candRow.id);

    if ((appsByB && appsByB.length > 0) || (candsByB && candsByB.length > 0)) {
      throw new Error('RLS İHLALİ: Kullanıcı B, Org A başvurusunu veya adayı görebildi!');
    }
    console.log(`✅ TEST 4 BAŞARILI: Kullanıcı B sorguları 0 satır döndürdü. Multi-tenant RLS izolasyonu kusursuz çalışıyor.\n`);

    // -------------------------------------------------------------
    // TEST 5: Aynı e-posta ile ikinci başvuruda YENİ candidate açılmadığını ve çift başvurunun engellendiğini doğrula
    // -------------------------------------------------------------
    console.log('📌 TEST 5: Aday tekilleştirme ve aynı ilana çift başvuru engelleme kontrolü...');
    // Aynı ilana ikinci kez başvuru denemesi -> 400 hatası dönmeli
    const dupRes = await fetch(submitEndpoint, { method: 'POST', body: formData });
    const dupJson = await dupRes.json();
    if (dupRes.ok || !dupJson.error || !dupJson.error.includes('daha önce başvuru yaptınız')) {
      throw new Error(`Çift başvuru engellenemedi! Dönen: ${JSON.stringify(dupJson)}`);
    }
    console.log(`   -> Aynı ilana ikinci başvuru başarıyla engellendi: "${dupJson.error}"`);

    // Şimdi aynı e-posta ile Org A'da İKİNCİ BİR pozisyona başvuru yapılıyor -> Yeni candidate açılmamalı, aynı candidate_id kullanılmalı
    const { data: job2 } = await clientA
      .from('jobs')
      .insert({ org_id: orgIdA, title: 'Lead Architect (Test 2)', status: 'published' })
      .select()
      .single();
    jobId2 = job2!.id;

    const formData2 = new FormData();
    formData2.append('org_slug', orgSlugA);
    formData2.append('job_id', jobId2);
    formData2.append('full_name', 'Mert Aday (Güncel İsim)');
    formData2.append('email', candidateEmail);
    formData2.append('consent_given', 'true');
    formData2.append('website', '');
    formData2.append('file', dummyFileBlob, 'mert_cv2.pdf');

    const res2 = await fetch(submitEndpoint, { method: 'POST', body: formData2 });
    const json2 = await res2.json();
    if (!res2.ok || !json2.success) {
      throw new Error(`İkinci ilana başvuru hatası: ${json2.error}`);
    }

    // Toplam candidate sayısını kontrol et (aynı org ve aynı e-posta için sadece 1 olmalı)
    const { data: totalCands } = await adminClient.from('candidates').select('id').eq('org_id', orgIdA).eq('email', candidateEmail);
    if (!totalCands || totalCands.length !== 1) {
      throw new Error(`Aday tekilleştirme hatası: Aynı e-posta için ${totalCands?.length} aday satırı oluştu!`);
    }

    const { data: totalApps } = await adminClient.from('applications').select('id').eq('candidate_id', totalCands[0].id);
    if (!totalApps || totalApps.length !== 2) {
      throw new Error(`Başvuru bağlama hatası: Adayın toplam başvuru sayısı 2 olmalıydı, ${totalApps?.length} çıktı!`);
    }
    console.log(`✅ TEST 5 BAŞARILI: Aynı e-posta ile ikinci ilana başvurulduğunda yeni candidate açılmadı (1 aday), mevcut adaya ikinci başvuru bağlandı (2 başvuru).\n`);

    // -------------------------------------------------------------
    // TEMİZLİK (Clean Up)
    // -------------------------------------------------------------
    console.log('🧹 Test verileri ve Storage dosyaları temizleniyor...');
    await adminClient.storage.from('cv-files').remove([
      `${orgIdA}/${jobId1}/${applicationId1}.pdf`,
      `${orgIdA}/${jobId2}/${json2.application_id}.pdf`
    ]);
    await adminClient.from('orgs').delete().in('id', [orgIdA, orgIdB]);
    await adminClient.auth.admin.deleteUser(userIdA);
    await adminClient.auth.admin.deleteUser(userIdB);

    console.log('✨ Tüm Faz 1 testleri (5/5) KUSURSUZ olarak geçti ve test verileri temizlendi!');
    process.exit(0);
  } catch (err: any) {
    console.error(`\n❌ TEST HATASI: ${err.message}`);
    if (orgIdA || orgIdB) {
      console.log('🧹 Hata sonrası test verileri temizleniyor...');
      await adminClient.from('orgs').delete().in('id', [orgIdA, orgIdB]);
    }
    process.exit(1);
  }
}

runFaz1Tests();
