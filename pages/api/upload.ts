import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Db, GridFSBucket } from 'mongodb';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { OpenAIApi, Configuration } from 'openai';
import { convertToHtml } from 'mammoth/mammoth.browser';
import path from 'path';
import connectToAuthDB from '../../database/authConn';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
// @ts-ignore
import FFmpeg from '@ffmpeg.wasm/main';

const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

export const config = {
  api: {
    bodyParser: false,
  },
};

const extractPdfContent = async (buffer: Buffer): Promise<string> => {
  let client;
  if (process.env.GOOGLE_APPLICATION_PDF_CREDENTIALS) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_PDF_CREDENTIALS);
    client = new DocumentProcessorServiceClient({ credentials });
  } else {
    throw new Error('GOOGLE_APPLICATION_PDF_CREDENTIALS environment variable is not set');
  }
  // Add your Google Cloud project ID, location, and processor ID here
  const projectId = 'capable-bliss-378816';
  const location = 'us';
  const processorId = '9b70de812ae7194a';

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  // Convert the buffer data to base64
  const encodedImage = Buffer.from(buffer).toString('base64');

  const request = {
    name,
    rawDocument: {
      content: encodedImage,
      mimeType: 'application/pdf',
    },
  };

  // Process the document
  const [result] = await client.processDocument(request);
  let { text } = result.document;

  // Trim middle white spaces
  text = text.replace(/\s+/g, ' ').trim();
  // Check if the last character is a period
  if (text && text.length > 0 && text[text.length - 1] !== '.') {
    // Append a period at the end
    text += '.';
  }
  return text;
};

const extractDocxContent = async (buffer: Buffer): Promise<string> => {
  const result = await convertToHtml({ arrayBuffer: buffer });

  if (result.messages.length > 0) {
    throw new Error('Error extracting content from .docx file');
  }
  return result.value;
};

const extractVideoContent = async (
  buffer: Buffer,
  fileName: String,
  filepath: String
): Promise<string> => {
  /* Write data to MEMFS, need to use Uint8Array for binary data */
  const ffmpeg = await FFmpeg.createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS('writeFile', 'inputFlac.flac', new Uint8Array(buffer));

  // Run the ffmpeg command to extract the audio and convert it to FLAC
  await ffmpeg.run('-i', 'inputFlac.flac', '-vn', '-c:a', 'flac', 'output.flac');

  // Read the output file
  const data = ffmpeg.FS('readFile', 'output.flac');

  // Return the output file as a blob
  const outputBuffer = Buffer.from(data.buffer);

  // Creates a new SpeechClient with authentication
  let client;

  if (process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS) {
    client = new SpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS),
    });
  } else {
    throw new Error('GOOGLE_APPLICATION_VIDEO_CREDENTIALS environment variable is not set');
  }
  console.log('Authenticated');

  let storageClient;

  if (process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS) {
    storageClient = new Storage({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_VIDEO_CREDENTIALS),
    });
  } else {
    throw new Error('GOOGLE_APPLICATION_VIDEO_CREDENTIALS environment variable is not set');
  }
  console.log('Storage authenticated');
  // Configuration object for the speech recognition request
  const requestConfig: any = {
    enableAutomaticPunctuation: true,
    encoding: 'FLAC',
    languageCode: 'en-US',
    model: 'video',
    audioChannelCount: 2,
    sampleRateHertz: 44100,
  };
  // Uploads the audio file to Google Cloud Storage
  const bucketName = 'audio-files-hackathon';
  const bucket = storageClient.bucket(bucketName);
  const bucketFileName = `${fileName.toString()}.flac`;
  const file = bucket.file(bucketFileName);
  await file.save(outputBuffer);
  // Creates a new recognition audio object with the GCS URI
  const audio: any = {
    uri: `gs://${bucketName}/${bucketFileName}`,
  };

  const request: any = {
    audio,
    config: requestConfig,
  };

  try {
    console.log('Starting speech recognition');
    // Performs speech recognition on the audio file
    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    console.log('Speech recognition completed');
    console.log('response', response);
    // Extracts the transcription from the response
    const transcription = response.results
      ? response.results
          .map((result: any) => {
            console.log('result alternatives: ', result.alternatives);
            return result.alternatives[0].transcript;
          })
          .join('\n')
      : '';

    return transcription;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Summarize the content using OpenAI
const summarizeContent = async (content: string, isDocx: boolean): Promise<string> => {
  let cleanedContent = content;

  // Remove the opening and closing paragraph tags
  if (isDocx) {
    cleanedContent = cleanedContent.slice(3, -4);
  }

  const prompt = `${cleanedContent} \n\nPlease provide a detailed summary of the above text.`;

  // Create an instance of OpenAI with your API key
  const openai = new OpenAIApi(configuration);

  // Make a request to the OpenAI API to generate the summary
  const response = await openai.createCompletion({
    model: 'text-davinci-003', // Choose the appropriate OpenAI model
    prompt: prompt,
    max_tokens: 1000, // Adjust the maximum number of tokens as needed
    temperature: 0.7, // Adjust the temperature for controlling randomness
    n: 1, // Generate a single response
  });

  // Extract the summary from the response
  let summary = response.data.choices[0]?.text?.trim() || '';
  if (summary[0] == ':') {
    summary = summary.slice(2);
  }

  return summary;
};

// Generate QNA using OpenAI
const generateQnA = async (summary: string): Promise<string> => {
  const prompt = `Given the summary of the lecture "${summary}", generate 5 question-answer pairs similar to the following example: \n
    Question: What is the main topic of the lecture?\n
    Answer: The main topic of the lecture is (main topic from summary). The answers should be sufficiently detailed.`;
  // Create an instance of OpenAI with your API key
  const openai = new OpenAIApi(configuration);

  // Make a request to the OpenAI API to generate the summary
  const response = await openai.createCompletion({
    model: 'text-davinci-003', // Choose the appropriate OpenAI model
    prompt: prompt,
    max_tokens: 1000, // Adjust the maximum number of tokens as needed
    temperature: 0.7, // Adjust the temperature for controlling randomness
    n: 1, // Generate a single response
  });

  // Extract the reply from the response
  let qna = response.data.choices[0]?.text?.trim() || '';
  console.log(response.data.choices[0]?.text);
  console.log(qna);

  return qna;
};

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

      // Reject the promise after 5 seconds
      setTimeout(() => reject(new Error('Form parse timeout')), 5000);
    });

    try {
      const db = await connectToAuthDB();
      const bucket = new GridFSBucket(db);
      // Assuming only one file is uploaded at a time
      const file = data.files.file[0]; // access the first file in the array

      const readStream = fs.createReadStream(file.filepath); // use `filepath` instead of `path`
      const uploadStream = bucket.openUploadStream(file.originalFilename); // use `originalFilename` instead of `name`
      // Attach the email & name field to the file metadata
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
          let isDocx: boolean = true;
          const readStream = bucket.openDownloadStream(file._id);
          readStream.on('data', (chunk) => {
            fileContent.push(chunk);
          });
          readStream.on('end', async () => {
            const buffer = Buffer.concat(fileContent);

            const extension = path.extname(file.filename).slice(1);
            let textContent = '';
            console.log('extension', extension);

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
            console.log('textcontent:', textContent);
            const summary = await summarizeContent(textContent, isDocx);
            const qna = await generateQnA(summary);
            // Split the string into an array
            let qnaArray = qna.split('\n\n');

            let qnaData = [];

            // Iterate over the array
            for (let i = 0; i < qnaArray.length; i++) {
              let qaPair = qnaArray[i].split('\n'); // split each pair into a question and an answer
              let question = qaPair[0];
              let answer = qaPair[1];
              qnaData.push({ question, answer }); // Push the Q&A pair into the array
            }

            // Save the summary to MongoDB, linked to the ID of the original document
            const summariesCollection = db.collection('summaries'); // replace 'summaries' with your collection's name
            await summariesCollection.insertOne({
              fileId: file._id,
              title: data.fields.title || '',
              description: data.fields.description || '',
              summary,
              qna: qnaData,
            });

            res.status(200).json({ message: 'File uploaded and summarized successfully', summary });
            return;
          });
        } catch (error) {
          res.status(500).json({ error: 'Error summarizing file content' });
          alert('Error summarizing file content. Please try again later!');
        }
      });

      uploadStream.on('error', (error) => {
        res.status(500).json({ error: 'Error uploading file' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Error connecting to the database' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
