import { Box, Heading } from '@chakra-ui/react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { platform: 'Twitter', mentions: 420 },
  { platform: 'Reddit', mentions: 180 },
  { platform: 'News', mentions: 90 },
  { platform: 'Facebook', mentions: 130 },
];

const PlatformBreakdown = () => (
  <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" height="300px">
    <Heading size="md" mb={3}>
      Platform Breakdown
    </Heading>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="platform" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="mentions" fill="#3182CE" />
      </BarChart>
    </ResponsiveContainer>
  </Box>
);

export default PlatformBreakdown;

