import { NextApiRequest, NextApiResponse } from 'next'; // Next.js API types
import officegen from 'officegen'; // Library to generate Office documents (Word, PowerPoint, Excel)

// API handler for generating a .docx file from a summary
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Allow only POST requests
  if (req.method === 'POST') {
    const { summary } = req.body; // Extract summary text from request body

    // Create a new Word document
    const docx = officegen('docx');

    // Add a paragraph to the document and insert the summary text
    docx.createP().addText(summary);

    // Set appropriate headers so the browser downloads the file as a Word document
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=Summary.docx');

    // Generate and stream the document directly to the response
    docx.generate(res);
  } else {
    // Return error for unsupported request methods
    res.status(405).json({ message: 'Method not allowed' });
  }
};
