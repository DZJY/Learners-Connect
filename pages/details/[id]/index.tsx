import { useRouter } from 'next/router';
import TableOfContents from '../../../components/tableOfContents';
import { Grid, Container } from '@mantine/core';
import { ObjectId } from 'mongodb';
import {
  DownloadOriginalButton,
  DownloadSummaryButton,
} from '../../../components/details/DownloadButton';
import { Accordion } from '@mantine/core';

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

  // Assuming the note's ID is passed as a URL parameter and
  // you have a `notes` collection in your MongoDB database

  const note = await db.collection('summaries').findOne({ fileId: new ObjectId(params.id) });

  // The note object can be directly included in props if it's serializable.
  // If not, you might need to convert it to a JSON string and then parse it back in the component.

  return {
    props: {
      note: JSON.parse(JSON.stringify(note)),
    },
  };
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
            <DownloadOriginalButton fileId={note.fileId} />
            <div style={{ marginLeft: '20px' }}>
              <DownloadSummaryButton summary={note.summary} />
            </div>
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
