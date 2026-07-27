const { createClient } = require('@supabase/supabase-js');

async function updateWebhook() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Updating webhook URL...');
  
  const { data, error } = await supabase
    .from('app_config')
    .update({ value: 'https://hire-ai-can-9e30.vercel.app/api/webhooks/cv-analyze' })
    .eq('key', 'n8n_webhook_url');

  if (error) {
    console.error('Error updating webhook:', error);
  } else {
    console.log('Successfully updated webhook to Vercel API!');
  }
}

updateWebhook();
