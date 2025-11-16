import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSocketEvent } from '../../hooks/useSocket.js';

const LiveMentionsFeed = () => {
  const [mentions, setMentions] = useState([
    { id: '1', source: 'twitter', text: 'Great product launch!', author: '@marketer' },
  ]);
  const socketMention = useSocketEvent('new_mention');

  useEffect(() => {
    if (socketMention) {
      setMentions((prev) => [socketMention, ...prev].slice(0, 10));
    }
  }, [socketMention]);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
      <Heading size="md" mb={3}>
        Live Mentions
      </Heading>
      <List spacing={2}>
        {mentions.map((mention) => (
          <ListItem key={mention.id} borderBottom="1px solid #eee" pb={2}>
            <Text fontWeight="bold">{mention.source.toUpperCase()}</Text>
            <Text>{mention.text}</Text>
            <Text fontSize="sm" color="gray.500">
              {mention.author}
            </Text>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default LiveMentionsFeed;

