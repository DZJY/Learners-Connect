import { useEffect, useState } from 'react';
import { createStyles, LoadingOverlay } from '@mantine/core';
import ArticleSection from '../../components/ArticleSection';
import { useSession } from 'next-auth/react';

type Note = {
  _id: string;
  filename: string;
  length: number;
  userName: string;
  title: string;
};

const useStyles = createStyles((theme) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
}));

export default function MyNotesPage() {
  const [uploadedNotes, setUploadedNotes] = useState<Note[]>([]);
  const [boughtNotes, setBoughtNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { classes } = useStyles();
  const { data: session } = useSession();

  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchMyNotes = async () => {
      try {
        const response = await fetch(`/api/users/notes?email=${userEmail}`);
        const data = await response.json();

        if (response.ok) {
          setUploadedNotes(Array.isArray(data.uploadedNotes) ? data.uploadedNotes : []);
          setBoughtNotes(Array.isArray(data.boughtNotes) ? data.boughtNotes : []);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyNotes();
  }, []);

  return (
    <>
      {isLoading && <LoadingOverlay visible zIndex={10} />}
      <div className={classes.header}>
        <h1>My Notes</h1>

        {/* Uploaded Notes Section */}
        <h2>Uploaded Notes</h2>
        <ArticleSection
          notes={uploadedNotes}
          isLoading={isLoading}
          emptyMessage="No uploaded notes found."
        />

        {/* Bought Notes Section */}
        <h2>Bought Notes</h2>
        <ArticleSection
          notes={boughtNotes}
          isLoading={isLoading}
          emptyMessage="No bought notes found."
        />
      </div>
    </>
  );
}
