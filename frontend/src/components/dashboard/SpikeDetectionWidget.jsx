import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';

const spikes = [
  { id: 1, platform: 'Twitter', reason: 'Launch announcement', timestamp: '2h ago' },
  { id: 2, platform: 'Reddit', reason: 'Support issue thread', timestamp: '5h ago' },
];

const SpikeDetectionWidget = () => (
  <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
    <Heading size="md" mb={3}>
      Spike Detection
    </Heading>
    <List spacing={2}>
      {spikes.map((spike) => (
        <ListItem key={spike.id} borderBottom="1px solid #eee" pb={2}>
          <Text fontWeight="bold">
            {spike.platform} · {spike.timestamp}
          </Text>
          <Text fontSize="sm">{spike.reason}</Text>
        </ListItem>
      ))}
    </List>
  </Box>
);

export default SpikeDetectionWidget;

