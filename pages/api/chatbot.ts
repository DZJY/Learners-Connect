import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIApi, Configuration } from 'openai';

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { prompt } = req.body;
  
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003', // Choose the appropriate OpenAI model
      prompt: prompt,
      max_tokens: 2000, // Adjust the maximum number of tokens as needed
      temperature: 0.7, // Adjust the temperature for controlling randomness
      n: 1, // Generate a single response
    });

    // Extract the reply from the response
    let aiReply = response.data.choices[0]?.text?.trim() || '';

    res.status(200).json({ aiReply });

  } catch (error) {
    res.status(500).json({ error: 'Error generating AI reply' });
  }
};