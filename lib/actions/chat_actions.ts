'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function sendChatMessage(messages: { role: 'user' | 'assistant' | 'system', content: string }[]) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: 'Gemini API anahtarı eksik. Lütfen .env.local dosyasında GEMINI_API_KEY tanımlayın.' };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format history for Gemini
    const systemPrompt = messages.find(m => m.role === 'system')?.content || 'Sen yetenekli bir İK Asistanısın (HireAI). Aday değerlendirme ve işe alım süreçlerinde kullanıcıya yardımcı olursun.';
    
    // Create chat session
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'Anladım. İK Asistanı rolünü üstleniyorum.' }]
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
    return { text: response.text() };

  } catch (error: any) {
    console.error('Chat error:', error);
    return { error: 'Asistanla iletişim kurulurken bir hata oluştu: ' + error.message };
  }
}
