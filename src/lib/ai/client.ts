import Groq from 'groq-sdk';

export interface AIClientConfig {
  apiKey?: string;
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  config?: AIClientConfig
): Promise<string> {
  const apiKey = config?.apiKey || import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key missing. Please add your key in BYOK Settings or in .env file.');
  }

  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  // Groq requires the word 'json' to be explicitly present in the messages when using json_object format
  const safeSystemPrompt = systemPrompt.toLowerCase().includes('json')
    ? systemPrompt
    : `${systemPrompt}\n\nRespond strictly in valid JSON format.`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: safeSystemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
  });

  return completion.choices[0]?.message?.content || '{}';
}