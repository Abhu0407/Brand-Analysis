// frontend/src/pages/SentimentAnalysis.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SentimentAnalysis = () => {
  const [platform, setPlatform] = useState('all');
  const [analysis, setAnalysis] = useState({
    sentiment: { positive: 0, negative: 0, neutral: 0 },
    keywords: [],
    topPositive: [],
    topNegative: [],
    summary: '',
  });
  const [loading, setLoading] = useState(true);

  const platforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'reddit', name: 'Reddit' },
    { id: 'news', name: 'News' },
  ];

  useEffect(() => {
    const fetchSentimentAnalysis = async () => {
      try {
        setLoading(true);
        // In a real app, replace with actual API call
        const res = await axios.get(`/api/mentions/sentiment/analysis?platform=${platform}`);
        setAnalysis(res.data);
      } catch (error) {
        console.error('Error fetching sentiment analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentAnalysis();
  }, [platform]);

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [analysis.sentiment.positive, analysis.sentiment.negative, analysis.sentiment.neutral],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
        hoverBackgroundColor: ['#059669', '#DC2626', '#4B5563'],
      },
    ],
  };

  const keywordsData = {
    labels: analysis.keywords.map((k) => k.word),
    datasets: [
      {
        label: 'Mentions',
        data: analysis.keywords.map((k) => k.count),
        backgroundColor: '#3B82F6',
      },
    ],
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sentiment Analysis</h1>
        <select
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Sentiment Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={sentimentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Top Keywords</h3>
          <div className="h-64">
            <Bar
              data={keywordsData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Top Positive Mentions</h3>
          <div className="space-y-4">
            {analysis.topPositive.map((mention) => (
              <div key={mention._id} className="p-4 border rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    {mention.platform === 'twitter' ? '🐦' : '🌐'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{mention.content}</p>
                    <div className="mt-1 text-xs text-gray-500">
                      {mention.author} • {new Date(mention.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Top Negative Mentions</h3>
          <div className="space-y-4">
            {analysis.topNegative.map((mention) => (
              <div key={mention._id} className="p-4 border rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mt-1">
                    {mention.platform === 'twitter' ? '🐦' : '🌐'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{mention.content}</p>
                    <div className="mt-1 text-xs text-gray-500">
                      {mention.author} • {new Date(mention.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {analysis.summary && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">AI Summary</h3>
          <p className="text-gray-700">{analysis.summary}</p>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis;