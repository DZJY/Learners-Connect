'use client';
import ArticleCard from '../components/ArticleCard';
import { Center, Pagination } from '@mantine/core';
import { useEffect, useState } from 'react';
import { rem } from '@mantine/core';
import { useRef } from 'react';
import { Card, createStyles } from '@mantine/core';
import SearchBar from './NewSearchBar';

type Note = {
  _id: string;
  filename: string;
  length: number;
  userName: string;
  title: string;
};

type ArticleSectionProps = {
  notes: Note[];
  removeNote?: (noteId: string) => void;
};

const useStyles = createStyles((theme) => ({
  card: {
    marginTop: '50px',
    marginBottom: '20px',
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
  searchBar: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '5px',
  },
  searchInput: {
    width: '500px',
    padding: rem(8),
    marginRight: rem(5),
    borderRadius: '10px',
    // borderColor:'white',
  },
  searchButton: {
    padding: `${rem(8)} ${rem(16)}`,
    color: theme.white,
    border: 'none',
    cursor: 'pointer',
    borderRadius: '10px',
    borderColor: 'white',
    fontWeight: 'bold',
    fontSize: '20px',
    width: '48px',
  },
  bar: {
    // backgroundColor:'grey',
    borderRadius: '10px',
  },
}));

// Items per page
const ITEMS_PER_PAGE = 6;

export default function ArticleSection({
  notes,
  removeNote,
  emptyMessage,
  isLoading, // Add this
}: ArticleSectionProps & { emptyMessage?: string; isLoading?: boolean }) {
  // Modify here
  const inputRef = useRef<HTMLInputElement>(null);
  const { classes } = useStyles();
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes || []);
  useEffect(() => {
    setFilteredNotes(notes);
  }, [notes]);
  // Add state for current page
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (query: string) => {
    const regex = new RegExp(query, 'i');
    const filtered = notes.filter((note) => regex.test(note.title));
    setFilteredNotes(filtered);
  };

  // Adjust the notes you are rendering based on the current page
  const notesToRender = (filteredNotes || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!isLoading && notes.length === 0) {
    // Modify here
    return (
      <div>
        <h4 style={{ textAlign: 'center' }}>{emptyMessage}</h4>
      </div>
    );
  }
  return (
    <div className={classes.header}>
      <h2>Search through our database of over 10 thousand notes!</h2>
      <SearchBar onSearch={handleSearch} />
      <Card className={classes.card}>
        {notesToRender.map((note, index) => (
          <ArticleCard
            key={index}
            articleId={note._id}
            image="https://i.imgur.com/Cij5vdL.png"
            link={`/details/${note._id}`}
            title={note.title}
            description={`${note.length} bytes`}
            removeNote={removeNote}
            rating="outstanding"
            author={{
              name: note.userName,
              image:
                'https://images.unsplash.com/photo-1593229874334-90d965f27c42?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            }}
          />
        ))}
      </Card>
      <Pagination
        total={Math.ceil(filteredNotes.length / ITEMS_PER_PAGE)}
        onChange={(page: number) => setCurrentPage(page)}
        radius={1}
        styles={(theme) => ({
          control: {
            '&[data-active]': {
              backgroundImage: theme.fn.gradient({ from: 'red', to: 'yellow' }),
              border: 0,
            },
          },
        })}
      />
    </div>
  );
}
