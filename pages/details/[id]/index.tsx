import { useState, useEffect } from 'react';
import TableOfContents from '../../../components/tableOfContents';
import { Grid, Container } from '@mantine/core';
import { ObjectId } from 'mongodb';
import BuyNowButton from '../../../components/BuyButton';
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
  note: Note | null;
  fileId: string | null;
  sellerEmail: string | null;
}

export async function getServerSideProps(context: any) {
  const db = await connectToAuthDB();
  const { params } = context;

  try {
    console.log("ID: ",params.id);
    const note = await db.collection('summaries').findOne({ fileId: new ObjectId(params.id) });

    const file = await db.collection('fs.files').findOne({ _id: new ObjectId(params.id) });

    if (!note || !file) {
      console.log("❌ Note or file not found!");
      return { props: { note: null, fileId: null, sellerEmail: null } };
    }

    console.log("✅ Note and file found:", note, file);

    const fileId = file._id.toString();
    const sellerEmail = file.metadata?.userEmail || "unknown";
    console.log(sellerEmail);

    return {
      props: {
        note: JSON.parse(JSON.stringify(note)),  // Ensure it's serializable
        fileId,
        sellerEmail,
      },
    };
  } catch (error) {
    console.error("🔥 Error fetching note or file:", error);
    return { props: { note: null, fileId: null, sellerEmail: null } };
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

export default function Page({ note, fileId, sellerEmail }: PageProps) {
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
  const { data: session, status } = useSession();

  console.log(isOwner);
  console.log(isBuyer);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      (async () => {
        try {
          const userEmail = session.user?.email;
          const response = await fetch(`/api/users/notes?email=${userEmail}`);
          const data = await response.json();
          if (response.ok) {
            const uploadedNotes = data.uploadedNotes.map((n: any) => n._id.toString());
            const boughtNotes = data.boughtNotes.map((n: any) => n._id.toString());
            const noteFileIdString = note.fileId.toString();
            console.log(noteFileIdString)

            if (uploadedNotes.includes(noteFileIdString)) {
              setIsOwner(true);
            } else if (boughtNotes.includes(noteFileIdString)) {
              setIsBuyer(true);
            }
          }
        } catch (error) {
          console.error("Error checking note ownership:", error);
        }
      })();
    }

  }, [status, session, note.fileId]);

  

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
              <BuyNowButton 
                buyerEmail={session?.user?.email || ""}
                sellerEmail={sellerEmail || "unknown"}
                noteId={note.fileId}
                amount={10} 
              />
            )}
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
