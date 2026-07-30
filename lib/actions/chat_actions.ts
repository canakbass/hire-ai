'use server';

import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const createJobDeclaration: FunctionDeclaration = {
  name: 'create_job_posting',
  description: 'Kullanıcının isteği üzerine veritabanında yeni bir iş ilanı (pozisyon) oluşturur. Sadece kullanıcı ilan oluşturmanı istediğinde ve gerekli bilgileri (başlık, departman vb.) verdiğinde kullan.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: 'Pozisyon başlığı (ör. Kıdemli Frontend Geliştirici)' },
      department: { type: SchemaType.STRING, description: 'Departman (ör. Mühendislik, Pazarlama)' },
      employment_type: { type: SchemaType.STRING, description: 'Çalışma modeli (Remote, Ofis, Hibrit)' },
      experience_level: { type: SchemaType.STRING, description: 'Deneyim seviyesi (Junior, Mid, Senior vb.)' },
      description: { type: SchemaType.STRING, description: 'İşin tanımı ve genel görevleri (Markdown veya HTML desteklenir)' },
      requirements: { type: SchemaType.STRING, description: 'Adayda aranan özellikler, yetenekler (Markdown veya HTML desteklenir)' },
      required_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Zorunlu teknik veya yumuşak yetenekler (Örn: ["React", "Node.js", "İletişim"])' },
      nice_to_have_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Olsa iyi olur dediğimiz ekstra yetenekler (Örn: ["Docker", "GraphQL"])' },
      interview_questions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Otonom sesli yapay zeka mülakatında adaya sorulacak 3-5 adet mülakat sorusu' }
    },
    required: ['title']
  }
};

const getTopCandidatesDeclaration: FunctionDeclaration = {
  name: 'get_top_candidates',
  description: 'Sistemdeki en yüksek eşleşme skoruna sahip en iyi adayları getirir. Kullanıcı "en iyi adayları getir", "kısa liste", "en iyi 5 adayı sırala" gibi bir talepte bulunduğunda bu aracı kullan.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      limit: { type: SchemaType.NUMBER, description: 'Getirilecek aday sayısı (varsayılan 5)' }
    }
  }
};

export async function sendChatMessage(messages: { role: 'user' | 'assistant' | 'system', content: string }[]) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: 'Gemini API anahtarı eksik. Lütfen .env.local dosyasında GEMINI_API_KEY tanımlayın.' };
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      tools: [{ functionDeclarations: [createJobDeclaration, getTopCandidatesDeclaration] }]
    });

    const systemPrompt = messages.find(m => m.role === 'system')?.content || 'Sen yetenekli bir İK Asistanısın (HireAI). Aday değerlendirme ve işe alım süreçlerinde kullanıcıya yardımcı olursun. KULLANICI İLAN OLUŞTURMAK İSTERSE, "create_job_posting" fonksiyonunu çağırarak doğrudan sisteme ekleyebilirsin. Ancak eklemeden önce emin olmak için pozisyon unvanı, departman vb. bilgileri kullanıcıdan aldığından emin ol.';
    
    // Create chat session
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'Anladım. İK Asistanı rolünü üstleniyorum ve gerektiğinde ilan oluşturma yetkisine sahibim.' }]
        },
        ...messages.filter(m => m.role !== 'system').slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      ]
    });

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
       return { error: 'Son mesaj kullanıcıya ait olmalıdır.' };
    }

    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'create_job_posting') {
        const authData = await getCurrentUserAndOrg();
        if (!authData?.activeOrg) {
          return { error: 'Aktif organizasyon bulunamadı. Lütfen oturumunuzu kontrol edin.' };
        }

        const supabase = await createClient();
        const args = call.args as any;
        
        const { data: insertedJob, error } = await supabase.from('jobs').insert({
          org_id: authData.activeOrg.id,
          title: args.title,
          department: args.department || 'Belirtilmedi',
          employment_type: args.employment_type || 'Belirtilmedi',
          seniority: args.experience_level || 'Belirtilmedi',
          description: args.description 
            ? `${args.description}\n\n${args.requirements ? '### Gereksinimler\n' + args.requirements : ''}`
            : 'Detaylar daha sonra eklenecek.',
          status: 'draft',
          created_by: authData.user?.id
        }).select().single();

        if (error) throw error;

        if (insertedJob) {
          await supabase.from('job_settings').insert({
            job_id: insertedJob.id,
            org_id: authData.activeOrg.id,
            interview_enabled: true,
            interview_language: 'tr-TR',
            interview_max_minutes: 15,
            pass_threshold: 65,
            reject_threshold: 40,
            shortlist_size: 10,
            required_skills: args.required_skills || [],
            nice_to_have_skills: args.nice_to_have_skills || [],
            interview_questions: args.interview_questions || [],
            require_manual_call_approval: false
          });
        }

        // Optionally revalidate the jobs page so the sidebar updates
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/jobs');

        // Instead of sending functionResponse to model (which causes 400 Bad Request Role 'function' is not supported in some SDK versions)
        // We just return the success message directly to the frontend.
        return { text: `Tebrikler! **${args.title}** pozisyonu başarıyla "Taslak" olarak veritabanına eklendi.\n\nPozisyon yönetimi sayfasından ilanı düzenleyebilir, otonom sesli mülakat senaryolarını veya eleme kriterlerini detaylandırabilirsiniz.` };
      }
      
      if (call.name === 'get_top_candidates') {
        const authData = await getCurrentUserAndOrg();
        if (!authData?.activeOrg) {
          return { error: 'Aktif organizasyon bulunamadı. Lütfen oturumunuzu kontrol edin.' };
        }
        
        const supabase = await createClient();
        const args = call.args as any;
        const limit = args.limit || 5;

        // Fetch applications joined with cv_analyses and candidates
        const { data: analyses, error } = await supabase
          .from('cv_analyses')
          .select(`
            match_score,
            application_id,
            applications (
              id,
              status,
              candidates (
                full_name,
                email
              ),
              jobs (
                title
              )
            )
          `)
          .eq('org_id', authData.activeOrg.id)
          .order('match_score', { ascending: false })
          .limit(limit);

        if (error) {
          console.error("Top candidates fetch error", error);
          return { text: "Üzgünüm, en iyi adayları getirirken veritabanında bir hata oluştu." };
        }

        if (!analyses || analyses.length === 0) {
          return { text: "Şu anda sistemde değerlendirilmiş (skorlanmış) herhangi bir aday bulunmuyor." };
        }

        let responseText = `Sistemdeki en yüksek CV eşleşme skoruna sahip ilk ${analyses.length} aday:\n\n`;
        
        analyses.forEach((analysis: any, index: number) => {
          const app = Array.isArray(analysis.applications) ? analysis.applications[0] : analysis.applications;
          const candidate = app?.candidates;
          const job = app?.jobs;
          
          const candidateName = candidate ? candidate.full_name : 'İsimsiz Aday';
          const jobTitle = job ? job.title : 'Bilinmeyen Pozisyon';
          const score = analysis.match_score || 0;
          
          responseText += `${index + 1}. **${candidateName}** — ${score} Puan (Pozisyon: ${jobTitle})\n`;
        });
        
        responseText += `\nBu adayların detaylarını "En İyi Adaylar" veya "Aday Havuzu" menüsünden inceleyebilirsiniz.`;

        return { text: responseText };
      }
    }

    return { text: response.text() };

  } catch (error: any) {
    console.error('Chat error:', error);
    return { error: 'Asistanla iletişim kurulurken bir hata oluştu: ' + error.message };
  }
}
