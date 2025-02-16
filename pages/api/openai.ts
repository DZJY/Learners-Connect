import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Fetch the list of available models
    const modelsResponse = await openai.models.list();
    const availableModels = modelsResponse.data.map((model) => model.id);

    // Generate a completion using the specified model (or default to GPT-4)
    const completionResponse = await openai.chat.completions.create({
      model: model || 'gpt-4', // Default to GPT-4 if no model is provided
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200, // Adjust token limit as needed
      temperature: 0.7, // Adjust for randomness
    });

    // Return both the completion and the list of available models
    return res.status(200).json({
      response: completionResponse.choices[0].message.content.trim(),
      availableModels: availableModels,
    });
  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error);
    return res.status(500).json({ error: 'Failed to call OpenAI API' });
  }
}