import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';

const clusters = [
  { topic: 'Product Quality', mentions: 320, sentiment: 'Positive leaning' },
  { topic: 'Pricing', mentions: 180, sentiment: 'Mixed' },
  { topic: 'Support Experience', mentions: 90, sentiment: 'Negative leaning' },
];

const TopicClustersViz = () => (
  <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
    <Heading size="md" mb={3}>
      Topic Clusters
    </Heading>
    <SimpleGrid columns={[1, 3]} spacing={4}>
      {clusters.map((cluster) => (
        <Box key={cluster.topic} borderWidth="1px" borderRadius="md" p={3}>
          <Text fontWeight="bold">{cluster.topic}</Text>
          <Text fontSize="sm">{cluster.mentions} mentions</Text>
          <Text fontSize="sm" color="gray.500">
            {cluster.sentiment}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  </Box>
);

export default TopicClustersViz;

