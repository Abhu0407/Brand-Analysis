import { Box, Heading } from '@chakra-ui/react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Mon', positive: 60, negative: 20, neutral: 20 },
  { name: 'Tue', positive: 55, negative: 25, neutral: 20 },
  { name: 'Wed', positive: 70, negative: 15, neutral: 15 },
  { name: 'Thu', positive: 65, negative: 20, neutral: 15 },
  { name: 'Fri', positive: 62, negative: 22, neutral: 16 },
];

const SentimentTrendGraph = () => (
  <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" height="300px">
    <Heading size="md" mb={3}>
      Sentiment Trend
    </Heading>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="positive" stroke="#48BB78" />
        <Line type="monotone" dataKey="negative" stroke="#F56565" />
        <Line type="monotone" dataKey="neutral" stroke="#718096" />
      </LineChart>
    </ResponsiveContainer>
  </Box>
);

export default SentimentTrendGraph;

