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

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userEmail', session?.user?.email || '');
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

    // Try to decode the response as JSON if it's OK
    const data = await response.json();
    console.log(data);
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
