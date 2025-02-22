import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import TableOfContents from '../../../components/tableOfContents';
import { Grid, Container, Button } from '@mantine/core';
import { ObjectId } from 'mongodb';
import {
  DownloadOriginalButton,
  DownloadSummaryButton,
} from '../../../components/details/DownloadButton';
import { Accordion } from '@mantine/core';
import { useSession } from 'next-auth/react';
import connectToAuthDB from '../../../database/authConn';

interface Note {
  title: string;
  description: string;
  summary: string;
  fileId: ObjectId;
  qna: any[];
}

interface PageProps {
  note: Note;
}

export async function getServerSideProps(context: any) {
  const db = await connectToAuthDB();
  const { params } = context;
  console.log(params);
  try {
    const note = await db.collection('summaries').findOne({ fileId: new ObjectId(params.id) });

    if (!note) {
      return { props: { note: null } };
    }

    return {
      props: {
        note: JSON.parse(JSON.stringify(note)),
      },
    };
  } catch (error) {
    console.error("Error fetching note:", error);
    return { props: { note: null } };
  }
}


const links = [
  {
    label: 'Description',
    id: 'description',
    order: 0,
  },
  {
    label: 'Summary',
    id: 'summary',
    order: 0,
  },
  {
    label: 'Quiz Cards',
    id: 'quizCards',
    order: 0,
  },
];

export default function Page({ note }: PageProps) {
  const router = useRouter();
  if (!note) {
    return (
      <Container>
        <h2>Note Not Found</h2>
        <p>The note you are looking for does not exist.</p>
      </Container>
    );
  }
  const [isOwner, setIsOwner] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const { data: session } = useSession();
  if (session) {
    const userEmail = session?.user?.email;
    console.log(userEmail);
    console.log(session);
  }
  console.log(isOwner);
  console.log(isBuyer);

  useEffect(() => {
    const checkOwnership = async () => {
      if (session) {
        try {
          const userEmail = session?.user?.email;
          console.log(userEmail);
          const response = await fetch(`/api/users/notes?email=${userEmail}`);
          const data = await response.json();
          console.log(data);
          if (response.ok) {
            const uploadedNotes = data.uploadedNotes.map((n: any) => n._id);
            const boughtNotes = data.boughtNotes.map((n: any) => n._id);
            console.log(uploadedNotes);
            console.log(boughtNotes);
            if (uploadedNotes.includes(note.fileId)) {
              setIsOwner(true);
            } else if (boughtNotes.includes(note.fileId)) {
              setIsBuyer(true);
            }
          }
        } catch (error) {
          console.error("Error checking note ownership:", error);
        }
      }
    };

    checkOwnership();
  }, []);

  return (
    <Container>
      <h2>{note.title}</h2>
      <Grid>
        <Grid.Col xs={0} sm={3}>
          <TableOfContents id="100" links={links} />
        </Grid.Col>
        <Grid.Col xs={12} sm={9}>
          <h4 id="description">Description</h4>
          <p>{note.description}</p>
          <h4 id="summary">Summary</h4>
          <p>{note.summary}</p>
          <h4 id="quizCards">Quiz Cards</h4>
          {note.qna.map((x, index) => {
            const question = x.question;
            const answer = x.answer;

            return (
              <Accordion key={index}>
                <Accordion.Item value="question">
                  <Accordion.Control>{question}</Accordion.Control>
                  <Accordion.Panel>{answer}</Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            );
          })}
          <br />
          <div style={{ display: 'flex' }}>
            
            {isOwner ? (
              <>
                <DownloadOriginalButton fileId={note.fileId} />
                <div style={{ marginLeft: '20px' }}>
                  <DownloadSummaryButton summary={note.summary} />
                </div>
              </>
            ) : isBuyer ? (
              <DownloadSummaryButton summary={note.summary} />
            ) : (
              <Button color="blue" onClick={() => alert('Redirecting to purchase...')}>
                Buy Now
              </Button>
            )}
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
