import { Box, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

const metrics = [
  { label: 'Total Mentions', value: '1,245' },
  { label: 'Positive Sentiment', value: '68%' },
  { label: 'Detected Spikes', value: '3' },
];

const TopOverviewCards = () => (
  <SimpleGrid columns={[1, 3]} spacing={4}>
    {metrics.map((metric) => (
      <Box key={metric.label} p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Stat>
          <StatLabel>{metric.label}</StatLabel>
          <StatNumber>{metric.value}</StatNumber>
        </Stat>
      </Box>
    ))}
  </SimpleGrid>
);

export default TopOverviewCards;

