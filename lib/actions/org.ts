'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/types/database.types';

type OrgRole = Database['public']['Enums']['app_role'];

export async function createOrganization(formData: FormData) {
  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!name || !slug) {
    return { error: 'Organizasyon adı ve kısa link (slug) zorunludur.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const adminClient = createAdminClient();

  // Ensure user profile exists
  await adminClient.from('profiles').upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı',
  });

  // Check slug uniqueness
  const { data: existingSlug } = await adminClient
    .from('orgs')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existingSlug) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Insert org
  const { data: org, error: orgError } = await adminClient
    .from('orgs')
    .insert({
      name,
      slug,
      plan: 'free',
    })
    .select()
    .single();

  if (orgError || !org) {
    return { error: `Organizasyon oluşturulamadı: ${orgError?.message || 'Bilinmeyen hata'}` };
  }

  // Insert org_member as owner
  const { error: memberError } = await adminClient
    .from('org_members')
    .insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner' as OrgRole,
    });

  if (memberError) {
    return { error: `Üyelik atanamadı: ${memberError.message}` };
  }

  return redirect('/dashboard');
}

export async function getCurrentUserAndOrg() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminClient = createAdminClient();

  // Get profile
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Get all org memberships
  const { data: memberships } = await adminClient
    .from('org_members')
    .select('role, org_id, orgs(*)')
    .eq('user_id', user.id);

  if (!memberships || memberships.length === 0) {
    return {
      user,
      profile,
      activeOrg: null,
      userRole: null,
      allOrgs: [],
    };
  }

  const activeMembership = memberships[0];
  const activeOrg = (activeMembership.orgs as unknown) as Database['public']['Tables']['orgs']['Row'];

  return {
    user,
    profile,
    activeOrg,
    userRole: activeMembership.role,
    allOrgs: memberships.map(m => ({
      ...((m.orgs as unknown) as Database['public']['Tables']['orgs']['Row']),
      role: m.role,
    })),
  };
}
