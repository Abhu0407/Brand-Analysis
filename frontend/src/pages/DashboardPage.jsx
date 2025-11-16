import { Box, Grid, GridItem, Heading, Stack } from '@chakra-ui/react';
import TopOverviewCards from '../components/dashboard/TopOverviewCards.jsx';
import LiveMentionsFeed from '../components/dashboard/LiveMentionsFeed.jsx';
import SentimentTrendGraph from '../components/dashboard/SentimentTrendGraph.jsx';
import TopicClustersViz from '../components/dashboard/TopicClustersViz.jsx';
import SpikeDetectionWidget from '../components/dashboard/SpikeDetectionWidget.jsx';
import PlatformBreakdown from '../components/dashboard/PlatformBreakdown.jsx';

const DashboardPage = () => (
  <Box p={6} bg="gray.50" minH="100vh">
    <Heading mb={6}>Real-Time Dashboard</Heading>
    <Stack spacing={6}>
      <TopOverviewCards />
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <SentimentTrendGraph />
        </GridItem>
        <GridItem>
          <SpikeDetectionWidget />
        </GridItem>
      </Grid>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        <GridItem>
          <TopicClustersViz />
        </GridItem>
        <GridItem>
          <PlatformBreakdown />
        </GridItem>
      </Grid>
      <LiveMentionsFeed />
    </Stack>
  </Box>
);

export default DashboardPage;

