'use server';

import { processCvAnalysis } from '@/app/api/webhooks/cv-analyze/route';

export async function forceAnalyzeCv(applicationId: string) {
  try {
    // We call the extracted logic directly from our API route file.
    // Setting `force=true` bypasses idempotency checks.
    const result = await processCvAnalysis(applicationId, true);
    return { success: true, result };
  } catch (error: any) {
    console.error('Force AI Analysis failed:', error);
    return { success: false, error: error.message || 'Yapay zeka analizi sırasında beklenmeyen bir hata oluştu.' };
  }
}
