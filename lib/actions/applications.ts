'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserAndOrg } from '@/lib/actions/auth_org_helpers';

export async function getCvSignedUrl(cvStoragePath: string | null) {
  if (!cvStoragePath) {
    return { error: 'CV dosya yolu bulunamadı.' };
  }

  const authData = await getCurrentUserAndOrg();
  if (!authData || !authData.activeOrg) {
    return { error: 'Yetkisiz işlem.' };
  }

  // Güvenlik: dosya yolunun ilk parçası (org_id) kullanıcının aktif org_id'si ile eşleşmeli
  const pathOrgId = cvStoragePath.split('/')[0];
  if (pathOrgId !== authData.activeOrg.id) {
    return { error: 'Bu CV dosyasına erişim yetkiniz bulunmamaktadır.' };
  }

  const supabase = await createClient();

  // 60 saniyelik kısa ömürlü signed URL oluştur
  const { data, error } = await supabase.storage
    .from('cv-files')
    .createSignedUrl(cvStoragePath, 60);

  if (error || !data?.signedUrl) {
    return { error: `CV indirme bağlantısı oluşturulamadı: ${error?.message}` };
  }

  return { signedUrl: data.signedUrl };
}
