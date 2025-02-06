import { useEffect, useState } from 'react';
import ArticleSection from '../../components/ArticleSection';
import { Card, createStyles, Center } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { LoadingOverlay } from '@mantine/core';

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
  },
}));

export default function AllBookmarksPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { classes } = useStyles();
  const { data: session, status: loading } = useSession();
  const removeNote = (noteId: string) => {
    setNotes(notes.filter((note) => note._id !== noteId));
  };
  useEffect(() => {
    const getNotes = async () => {
      setIsLoading(true);
      if (session?.user?.email) {
        console.log(session?.user?.email);
        const response = await fetch(`/api/allBookmarks?email=${session?.user?.email}`);
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
        setIsLoading(false);
      }
    };

    getNotes();
    console.log(notes);
  }, [session, loading]);

  return (
    <>
      {isLoading && <LoadingOverlay visible zIndex={10} />}
      <div className={classes.header}>
        <h1>All Bookmarks</h1>

      <ArticleSection
        notes={notes}
        isLoading={isLoading}
        removeNote={removeNote}
        emptyMessage="No bookmarked notes for now. Bookmark something?"
      />
            </div>
    </>
  );
}
