import type { NextApiRequest, NextApiResponse } from 'next';
const { Translate } = require('@google-cloud/translate').v2;

const projectId = 'atlasmadness-392213'; // Replace with your project ID


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { text, targetLanguage } = req.body;
    let translator;
    if (process.env.GOOGLE_APPLICATION_PDF_CREDENTIALS) {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_PDF_CREDENTIALS);
      translator = new Translate({ credentials });
    } else {
      throw new Error('GOOGLE_APPLICATION_PDF_CREDENTIALS environment variable is not set');
    }
    try {
      const [translation] = await translator.translate(text, targetLanguage);
      res.status(200).json({ translation });
    } catch (error:any) {
      console.error(error); // Log the error to the server's console
      res.status(500).json({ error: error.message });
    }
  }