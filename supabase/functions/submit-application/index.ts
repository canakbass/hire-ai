// =====================================================================
// HireAI — Edge Function: submit-application
// KVKK uyumlu, sertleştirilmiş (DB kalıcı Rate limit, Honeypot, MIME check, Service Role)
// =====================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Sadece POST istekleri kabul edilir." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Sunucu yapılandırma hatası: SUPABASE_SERVICE_ROLE_KEY eksik.");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Rate Limiting (Veritabanı kalıcı ip_hash + window tabanlı, HMAC-SHA256 ile tuzlanmış IP)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip")?.trim() || "unknown-ip";
    const rateSalt = Deno.env.get("RATE_LIMIT_SALT") || "default_hireai_salt_12345";

    const hmacKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(rateSalt),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", hmacKey, new TextEncoder().encode(clientIp));
    const ipHash = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const now = new Date();
    const windowMs = 10 * 60 * 1000; // 10 dakika
    const maxRequests = 5;

    const { data: rateData } = await adminClient
      .from("rate_limits")
      .select("*")
      .eq("ip_hash", ipHash)
      .single();

    if (rateData) {
      const windowStart = new Date(rateData.window_start).getTime();
      if (now.getTime() - windowStart < windowMs) {
        if (rateData.request_count >= maxRequests) {
          return new Response(
            JSON.stringify({ error: "Çok fazla başvuru denemesi yaptınız. Lütfen 10 dakika sonra tekrar deneyin." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await adminClient
          .from("rate_limits")
          .update({ request_count: rateData.request_count + 1 })
          .eq("ip_hash", ipHash);
      } else {
        await adminClient
          .from("rate_limits")
          .update({ request_count: 1, window_start: now.toISOString() })
          .eq("ip_hash", ipHash);
      }
    } else {
      await adminClient
        .from("rate_limits")
        .insert({ ip_hash: ipHash, request_count: 1, window_start: now.toISOString() });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const orgSlug = formData.get("org_slug")?.toString().trim();
    const jobId = formData.get("job_id")?.toString().trim();
    const fullName = formData.get("full_name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim() || null;
    const consentGiven = formData.get("consent_given")?.toString() === "true";
    const honeypot = formData.get("website")?.toString() || ""; // Honeypot alanı (boş olmalı)
    const file = formData.get("file") as File | null;

    // 3. Honeypot kontrolü (Spam koruması)
    if (honeypot !== "") {
      return new Response(
        JSON.stringify({ error: "Geçersiz istek formu (Spam tespit edildi)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. KVKK Açık Rıza kontrolü
    if (!consentGiven) {
      return new Response(
        JSON.stringify({ error: "KVKK açık rıza metnini onaylamadan başvuru yapamazsınız." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Zorunlu alanlar
    if (!orgSlug || !jobId || !fullName || !email || !file) {
      return new Response(
        JSON.stringify({ error: "Ad Soyad, E-posta ve CV dosyası zorunludur." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Dosya Sertleştirmesi (PDF/DOCX + max 5MB)
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".docx"];
    const fileName = file.name.toLowerCase();
    const ext = fileName.endsWith(".pdf") ? ".pdf" : fileName.endsWith(".docx") ? ".docx" : null;

    if (!allowedMimes.includes(file.type) || !ext || !allowedExtensions.includes(ext)) {
      return new Response(
        JSON.stringify({ error: "Yalnızca PDF veya DOCX formatında dosya yükleyebilirsiniz." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      return new Response(
        JSON.stringify({ error: "CV dosya boyutu maksimum 5 MB olabilir." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Organizasyon ve İlan Kontrolü (Yalnızca status='published' ilana yazım)
    const { data: org, error: orgErr } = await adminClient
      .from("orgs")
      .select("id, name")
      .eq("slug", orgSlug)
      .single();

    if (orgErr || !org) {
      return new Response(
        JSON.stringify({ error: "Organizasyon bulunamadı." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: job, error: jobErr } = await adminClient
      .from("jobs")
      .select("id, status, title")
      .eq("id", jobId)
      .eq("org_id", org.id)
      .single();

    if (jobErr || !job || job.status !== "published") {
      return new Response(
        JSON.stringify({ error: "Bu pozisyon şu anda başvuruya kapalı veya yayında değil." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Aday Tekilleştirme (candidates tablosunda unique(org_id, email) kontrolü)
    let candidateId: string;
    const { data: existingCandidate } = await adminClient
      .from("candidates")
      .select("id")
      .eq("org_id", org.id)
      .eq("email", email)
      .single();

    if (existingCandidate) {
      candidateId = existingCandidate.id;
      await adminClient
        .from("candidates")
        .update({ full_name: fullName, phone: phone || undefined })
        .eq("id", candidateId);
    } else {
      const { data: newCandidate, error: candErr } = await adminClient
        .from("candidates")
        .insert({
          org_id: org.id,
          full_name: fullName,
          email: email,
          phone: phone || null,
        })
        .select("id")
        .single();

      if (candErr || !newCandidate) {
        return new Response(
          JSON.stringify({ error: `Aday profili oluşturulamadı: ${candErr?.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      candidateId = newCandidate.id;
    }

    // 9. Aynı ilana ikinci kez başvuru kontrolü
    const { data: existingApp } = await adminClient
      .from("applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("candidate_id", candidateId)
      .single();

    if (existingApp) {
      return new Response(
        JSON.stringify({ error: "Bu pozisyona daha önce başvuru yaptınız. Tekrar başvuru alınamamaktadır." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Başvuru kaydı aç
    const { data: newApp, error: appErr } = await adminClient
      .from("applications")
      .insert({
        org_id: org.id,
        job_id: job.id,
        candidate_id: candidateId,
        source: "web_form",
        status: "new",
        consent_given: true,
      })
      .select("id")
      .single();

    if (appErr || !newApp) {
      return new Response(
        JSON.stringify({ error: `Başvuru kaydı açılamadı: ${appErr?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 11. Storage yüklemesi (PRIVATE cv-files bucket -> {org_id}/{job_id}/{application_id}.{ext})
    const storagePath = `${org.id}/${job.id}/${newApp.id}${ext}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadErr } = await adminClient.storage
      .from("cv-files")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      await adminClient.from("applications").delete().eq("id", newApp.id);
      return new Response(
        JSON.stringify({ error: `CV dosyası yüklenirken hata oluştu: ${uploadErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 12. Başvuru satırına cv_storage_path değerini yaz
    await adminClient
      .from("applications")
      .update({ cv_storage_path: storagePath })
      .eq("id", newApp.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Başvurunuz başarıyla alındı ve İK ekibine iletildi.",
        application_id: newApp.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("submit-application Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: `Sunucu hatası: ${err?.message || "Bilinmeyen hata"}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
