import type { NextApiRequest, NextApiResponse } from 'next'; // Next.js API route types
import { GridFSBucket } from 'mongodb'; // For storing files in MongoDB using GridFS
import { IncomingForm } from 'formidable'; // For parsing form data (multipart/form-data)
import fs from 'fs'; // File system module for reading files
import { OpenAI } from 'openai'; // OpenAI API for summarization and QnA
import { convertToHtml } from 'mammoth/mammoth.browser'; // Convert .docx to HTML
import path from 'path'; // For working with file paths
import { SpeechClient } from '@google-cloud/speech'; // Google Speech-to-Text client
import { Storage } from '@google-cloud/storage'; // Google Cloud Storage client
// @ts-ignore
import FFmpeg from '@ffmpeg.wasm/main'; // FFmpeg for audio conversion
import connectToUserDB from '../../database/userConn'; // Connect to User DB (stores user info)
import connectToAuthDB from '../../database/authConn'; // Connect to MongoDB Auth DB (stores files and summaries)

const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

// Disable built-in body parser to handle multipart form data with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Extract content from a PDF using Google Document AI
const extractPdfContent = async (buffer: Buffer): Promise<string> => {
  let client;
  if (process.env.GOOGLE_APPLICATION_PDF_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_PDF_CREDENTIALS);
    client = new DocumentProcessorServiceClient({ credentials });
  } else {
    throw new Error('GOOGLE_APPLICATION_PDF_CREDENTIALS environment variable is not set');
  }

  const projectId = 'aswe-451009';
  const location = 'us';
  const processorId = '5c51d07942d83347';
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const encodedImage = Buffer.from(buffer).toString('base64');

  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType: 'application/pdf',
    },
  };

  const [result] = await client.processDocument(request);
  let { text } = result.document;

  // Clean up spacing and punctuation
  text = text.replace(/\s+/g, ' ').trim();
  if (text && text[text.length - 1] !== '.') {
    text += '.';
  }
  return text;
};

// Extract content from a .docx file using Mammoth
const extractDocxContent = async (buffer: Buffer): Promise<string> => {
  const result = await convertToHtml({ arrayBuffer: buffer });
  if (result.messages.length > 0) {
    throw new Error('Error extracting content from .docx file');
  }
  return result.value;
};

// Extract transcript from a video/audio file using FFmpeg + Google Speech-to-Text
const extractVideoContent = async (
  buffer: Buffer,
  fileName: String,
  filepath: String
): Promise<string> => {
  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS('writeFile', 'inputFlac.flac', new Uint8Array(buffer));
  await ffmpeg.run('-i', 'inputFlac.flac', '-vn', '-c:a', 'flac', 'output.flac');

  const data = ffmpeg.FS('readFile', 'output.flac');
  const outputBuffer = Buffer.from(data.buffer);

  let client;
  if (process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS) {
    client = new SpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS),
    });
  } else {
    throw new Error('GOOGLE_APPLICATION_VIDEO_CREDENTIALS environment variable is not set');
  }

  let storageClient;
  if (process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS) {
    storageClient = new Storage({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS),
    });
  } else {
    throw new Error('GOOGLE_APPLICATION_VIDEO_CREDENTIALS environment variable is not set');
  }

  const requestConfig: any = {
    enableAutomaticPunctuation: true,
    encoding: 'FLAC',
    languageCode: 'en-US',
    model: 'video',
    audioChannelCount: 2,
    sampleRateHertz: 44100,
  };

  const bucketName = 'audio-files-hackathon';
  const bucket = storageClient.bucket(bucketName);
  const bucketFileName = `${fileName.toString()}.flac`;
  const file = bucket.file(bucketFileName);
  await file.save(outputBuffer);

  const audio: any = {
    uri: `gs://${bucketName}/${bucketFileName}`,
  };

  const request: any = {
    audio,
    config: requestConfig,
  };

  try {
    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results
      ? response.results
          .map((result: any) => result.alternatives[0].transcript)
          .join('\n')
      : '';

    return transcription;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Use OpenAI to summarize the content
const summarizeContent = async (content: string, isDocx: boolean): Promise<string> => {
  let cleanedContent = content;

  if (isDocx) {
    cleanedContent = cleanedContent.slice(3, -4); // Remove surrounding tags
  }

  const prompt = `${cleanedContent} \n\nPlease provide a detailed summary of the above text.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7,
    n: 1,
  });

  let summary = response.choices[0]?.message?.content?.trim() || '';
  if (summary[0] === ':') summary = summary.slice(2);
  return summary;
};

// Use OpenAI to generate QnA from a summary
const generateQnA = async (summary: string): Promise<string> => {
  const prompt = `Given the summary of the lecture "${summary}", generate 5 question-answer pairs similar to the following example: \n
    Question: What is the main topic of the lecture?\n
    Answer: The main topic of the lecture is (main topic from summary). The answers should be sufficiently detailed.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
    temperature: 0.7,
    n: 1,
  });

  return response.choices[0]?.message.content?.trim() || '';
};

// Main handler for POST requests to handle file upload and processing
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data: any = await new Promise((resolve, reject) => {
      const form = new IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          reject(err);
          return;
        }
        resolve({ fields, files });
      });

      setTimeout(() => reject(new Error('Form parse timeout')), 15000);
    });

    try {
      const db = await connectToAuthDB();
      const userDB = await connectToUserDB();
      const bucket = new GridFSBucket(db);

      const file = data.files.file[0];
      const readStream = fs.createReadStream(file.filepath);
      const uploadStream = bucket.openUploadStream(file.originalFilename);

      uploadStream.options.metadata = {
        title: data.fields.title || '',
        description: data.fields.description || '',
        userEmail: data.fields.userEmail || '',
        userName: data.fields.userName || '',
        filepath: file.filepath,
      };

      readStream.pipe(uploadStream);

      uploadStream.on('finish', async (file: any) => {
        try {
          const fileContent: any = [];
          let isDocx = true;
          const readStream = bucket.openDownloadStream(file._id);

          readStream.on('data', (chunk) => fileContent.push(chunk));
          readStream.on('end', async () => {
            const buffer = Buffer.concat(fileContent);
            const extension = path.extname(file.filename).slice(1);
            let textContent = '';

            if (extension === 'pdf') {
              textContent = await extractPdfContent(buffer);
              isDocx = false;
            } else if (extension === 'docx') {
              textContent = await extractDocxContent(buffer);
            } else if (extension === 'mp4') {
              textContent = await extractVideoContent(
                buffer,
                file.filename,
                file.metadata.filepath
              );
              isDocx = false;
            } else {
              throw new Error('Unsupported file type');
            }

            const summary = await summarizeContent(textContent, isDocx);
            const qna = await generateQnA(summary);
            const qnaArray = qna.split('\n\n');
            const qnaData = qnaArray.map(pair => {
              const [question, answer] = pair.split('\n');
              return { question, answer };
            });

            const summariesCollection = db.collection('summaries');
            await summariesCollection.insertOne({
              fileId: file._id,
              title: data.fields.title || '',
              description: data.fields.description || '',
              summary,
              qna: qnaData,
            });

            const usersCollection = userDB.collection('users');
            const userEmail = data.fields.userEmail[0];

            if (userEmail) {
              await usersCollection.updateOne(
                { email: userEmail },
                { $addToSet: { NotesOwned: file._id } }
              );

              res.status(200).json({
                message: 'File uploaded and summarized successfully',
                summary,
              });
            }
          });
        } catch (error) {
          res.status(500).json({ error: 'Error summarizing file content' });
        }
      });

      uploadStream.on('error', () => {
        res.status(500).json({ error: 'Error uploading file' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Error connecting to the database' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
