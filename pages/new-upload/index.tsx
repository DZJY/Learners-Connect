import axios from 'axios';
import UploadTabs from '../../components/NewUpload/UploadTabs';
import { TextInputs } from '../../components/NewUpload/TextInputs';
import { SubmitButton } from '../../components/NewUpload/SubmitButton';
import { createStyles } from '@mantine/core';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const useStyles = createStyles(() => ({
  uploadContainer: {
    width: '75%',
    margin: '0 auto',
  },
}));

export default function NewUploadPage() {
  const { classes } = useStyles();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const { data: session } = useSession();

  const onUpload = async () => {
    if (!uploadedFile) return;

    const userEmail = session?.user?.email || '';
    const amount = 5;

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userEmail', userEmail);
    formData.append('userName', session?.user?.name || 'syntax');

    // Upload the file
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
   
    // Handle the response...    
    if (!response.ok) {
      // Try to decode the response as text if it's not OK
      const text = await response.text();
      throw new Error(`Request failed: ${text}`);
    }
    console.log(userEmail);
    console.log(amount);
    
    const addpointsresponse = await fetch('/api/users/points', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, amount }),
    });

    if (!addpointsresponse.ok) {
      // Try to decode the response as text if it's not OK
      const text = await addpointsresponse.text();
      throw new Error(`Request failed: ${text}`);
    }

    // Try to decode the response as JSON if it's OK
    const data = await response.json();
    console.log(data);
    const data2 = await addpointsresponse.json();
    console.log(data2);
    setTitle('');
    setDescription('');
  };
  
  return (
    <main>
      <div className="flex justify-center">
        <UploadTabs setUploadedFile={setUploadedFile} setFileName={setFileName} />
        <div className={classes.uploadContainer}>
          <TextInputs
            fileName={fileName}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
          />
          <SubmitButton onUpload={onUpload} />
        </div>
      </div>
    </main>
  );
}
