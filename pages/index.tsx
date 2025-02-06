import ArticleSection from '../components/ArticleSection';
import { ContactUs } from '../components/ContactUs';
import { useState, useEffect } from 'react';
import test from '../images/banner.png';
import { createStyles, LoadingOverlay, Image, Grid, Col } from '@mantine/core';
import FeatureCards from '../components/FeatureCards/FeatureCards';

type Note = {
  _id: string;
  filename: string;
  length: number;
  userName: string;
  title: string;
};

const useStyles = createStyles((theme) => ({
  img: {
    padding: '100px',
  },
}));

const features = [
  {
    title: 'Rapid Content Summarization',
    description: 'Ingest any form of lecture content, be it PDF, DOC, or MP4. Our state-of-the-art AI, integrating OpenAI and Google Cloud technologies, skillfully extracts and synthesizes the key concepts into concise summaries. Amplify learning by focusing on what matters.',
  },
  {
    title: 'Detailed Learning Toolkit',
    description: 'Download the original and summarized documents, engage with custom-made quiz cards, and bookmark key notes for future reference. Our platform elevates your study experience, seamlessly blending storage, recall practice, and summarization.',
  },
  {
    title: 'Interactive Global Platform',
    description: 'Our built-in chatbot is ready to clarify doubts and guide your learning. Expand your learning horizons with downloadable summaries available in various languages. Whether you are local or global, we have you covered for a more inclusive learning experience.',
  },
];

export default function HomePage() {
  const { classes } = useStyles();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getNotes = async () => {
      const response = await fetch('/api/allFiles');
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
      setIsLoading(false);
    };

    getNotes();
  }, []);

  return isLoading ? (
    <LoadingOverlay visible zIndex={10} />
  ) : (
    <>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '65px', fontWeight: 'bold' }}>Welcome to SummAIze</h1>
        <h4 style={{ fontSize: '25px', fontWeight: 'bold' }}>Effortless Learning, Instant Notes</h4>
        <p style={{ fontSize: '20px', paddingLeft: '150px', paddingRight: '150px' }}>
          We are a group of students looking to streamline the process of absorbing information.
          From summarizing pdf lectures notes to video lectures, our AI powered note collation
          system helps students from all over the world condense high volumes of study materials in
          a matter of seconds.
        </p>
      <FeatureCards features={features} />
        {/* <Image className={classes.img} src={test.src} /> */}
      </div>
      <ArticleSection notes={notes} />
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
      >
        <ContactUs />
      </div>
    </>
  );
}
