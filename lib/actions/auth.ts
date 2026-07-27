'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user has any organization membership
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const adminClient = createAdminClient();
    const { data: members } = await adminClient
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1);

    if (!members || members.length === 0) {
      return redirect('/onboarding');
    }
  }

  return redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = (formData.get('fullName') as string) || email.split('@')[0];

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const adminClient = createAdminClient();
    await adminClient.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
    });
  }

  return { success: 'Kayıt başarılı! Lütfen yönlendiriliyorsunuz veya e-posta adresinizi doğrulayın.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/login');
}
