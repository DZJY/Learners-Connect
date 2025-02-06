import { useEffect, useState } from 'react';
import { Card, createStyles, Center, LoadingOverlay } from '@mantine/core';
import ArticleSection from '../../components/ArticleSection';

type Note = {
  _id: string;
  filename: string;
  length: number;
  userName: string;
  title: string;
};

const useStyles = createStyles((theme) => ({
  card: {
    marginTop: '50px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
}));

export default function AllNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { classes } = useStyles();

  useEffect(() => {
    const getNotes = async () => {
      const response = await fetch('/api/allFiles');
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };

    getNotes();
  }, []);

  return (
    <>
      {isLoading && <LoadingOverlay visible zIndex={10} />}
      <div className={classes.header}>
        <h1>All Notes</h1>

        <ArticleSection
          notes={notes}
          isLoading={isLoading}
          emptyMessage="No notes found. Upload a new note now?"
        />
      </div>
    </>
  );
}
