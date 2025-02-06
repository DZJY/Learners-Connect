import { NextApiRequest, NextApiResponse } from "next";
import officegen from "officegen";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const summary = req.body.summary;  // Extract summary from the request body
    const docx = officegen("docx");

    // Add the summary to the document
    docx.createP().addText(summary);

    // Pipe generated file to the response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", "attachment; filename=Summary.docx");

    docx.generate(res);  // Stream to response
  } else {
    res.status(405).json({ message: "Method not allowed" });  // Error for unsupported methods
  }
};
