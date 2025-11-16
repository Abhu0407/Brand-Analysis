// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMentions: 0,
    sentiment: { positive: 0, negative: 0, neutral: 0 },
    platforms: {},
    mentions: [],
    sentimentTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        const [mentionsRes, sentimentRes, platformsRes, trendRes] = await Promise.all([
          api.get('/mentions?limit=10').catch(err => {
            console.warn('Mentions API error:', err);
            return { data: { mentions: [], total: 0 } };
          }),
          api.get('/mentions/sentiment').catch(err => {
            console.warn('Sentiment API error:', err);
            return { data: { positive: 0, negative: 0, neutral: 0 } };
          }),
          api.get('/mentions/platforms').catch(err => {
            console.warn('Platforms API error:', err);
            return { data: {} };
          }),
          api.get('/mentions/trend').catch(err => {
            console.warn('Trend API error:', err);
            return { data: [] };
          }),
        ]);

        const mentions = mentionsRes.data?.mentions || mentionsRes.data || [];
        const total = mentionsRes.data?.total || mentions.length;

        setStats({
          totalMentions: total,
          sentiment: sentimentRes.data || { positive: 0, negative: 0, neutral: 0 },
          platforms: platformsRes.data || {},
          mentions: Array.isArray(mentions) ? mentions : [],
          sentimentTrend: Array.isArray(trendRes.data) ? trendRes.data : [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          stats.sentiment?.positive || 0,
          stats.sentiment?.negative || 0,
          stats.sentiment?.neutral || 0
        ],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
        hoverBackgroundColor: ['#059669', '#DC2626', '#4B5563'],
      },
    ],
  };

  const platformData = {
    labels: Object.keys(stats.platforms || {}).length > 0 
      ? Object.keys(stats.platforms) 
      : ['No Data'],
    datasets: [
      {
        data: Object.keys(stats.platforms || {}).length > 0
          ? Object.values(stats.platforms)
          : [1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      },
    ],
  };

  const trendData = {
    labels: stats.sentimentTrend.length > 0
      ? stats.sentimentTrend.map((item) => item.date)
      : ['No Data'],
    datasets: [
      {
        label: 'Positive',
        data: stats.sentimentTrend.length > 0
          ? stats.sentimentTrend.map((item) => item.positive || 0)
          : [0],
        borderColor: '#10B981',
        tension: 0.1,
      },
      {
        label: 'Negative',
        data: stats.sentimentTrend.length > 0
          ? stats.sentimentTrend.map((item) => item.negative || 0)
          : [0],
        borderColor: '#EF4444',
        tension: 0.1,
      },
      {
        label: 'Neutral',
        data: stats.sentimentTrend.length > 0
          ? stats.sentimentTrend.map((item) => item.neutral || 0)
          : [0],
        borderColor: '#6B7280',
        tension: 0.1,
      },
    ],
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Mentions</h3>
          <p className="text-3xl font-bold">{stats.totalMentions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Positive</h3>
          <p className="text-3xl font-bold text-green-500">
            {calculatePercentage(stats.sentiment?.positive || 0, stats.totalMentions)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Negative</h3>
          <p className="text-3xl font-bold text-red-500">
            {calculatePercentage(stats.sentiment?.negative || 0, stats.totalMentions)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Neutral</h3>
          <p className="text-3xl font-bold text-gray-500">
            {calculatePercentage(stats.sentiment?.neutral || 0, stats.totalMentions)}%
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Sentiment Trend (Last 7 Days)</h3>
          <div className="h-64">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Platform Distribution</h3>
          <div className="h-64">
            <Pie
              data={platformData}
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
      </div>

      {/* Recent Mentions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Recent Mentions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.mentions && stats.mentions.length > 0 ? (
            stats.mentions.map((mention) => (
              <div key={mention._id || mention.id || Math.random()} className="p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    {mention.platform === 'twitter' ? '🐦' : mention.platform === 'reddit' ? '🔴' : mention.platform === 'youtube' ? '📺' : mention.platform === 'instagram' ? '📷' : '🌐'}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{mention.author || 'Unknown'}</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {mention.sentiment || 'neutral'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {mention.content ? (mention.content.length > 200 ? mention.content.substring(0, 200) + '...' : mention.content) : 'No content'}
                    </p>
                    {mention.url && (
                      <a href={mention.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                        View source
                      </a>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      {mention.createdAt ? new Date(mention.createdAt).toLocaleString() : 'Unknown date'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-2">No mentions found</p>
              <p className="text-sm">Start monitoring a brand to see mentions here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;