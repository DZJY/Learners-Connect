import { Grid, Col } from '@mantine/core';
import FeatureCard from './FeatureCard'; // Import the FeatureCard component

interface FeatureCardsProps {
  features: any[]; // Array of FeatureCardProps objects
}

export default function FeatureCards({ features }: FeatureCardsProps) {
  return (
    <Grid
      gutter="lg"
      style={{ marginTop: '50px' }}
      align="center"
      justify="center"
    >
      {features.map((feature, index) => (
        <Col sm={10} md={6} lg={4} xl={3} key={index}>
          <FeatureCard title={feature.title} description={feature.description} />
        </Col>
      ))}
    </Grid>
  );
}