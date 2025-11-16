import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import API_PATH from '../store/apiPaths';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SentimentAnalysisPage = () => {
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);

  useEffect(() => {
    if (authUser) {
      fetchSentimentData();
    }
  }, [authUser]);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const brand = authUser?.brandName || 'apple';

      console.log('Fetching sentiment data for:', { brand });

      const response = await axiosInstance.get(API_PATH.DASHBOARD.GET_DATA, {
        params: { brand }
      });

      console.log('Sentiment data received:', response.data);
      setSentimentData(response.data);
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch sentiment data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen pt-20">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pt-20 p-10">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load data</h2>
        <p className="text-error">{error}</p>
      </div>
    );
  }

  const COLORS = {
    positive: '#10b981', // green
    neutral: '#6b7280',  // gray
    negative: '#ef4444'  // red
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sentiment Analysis</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reddit Sentiment */}
          <SentimentSection
            title="Reddit Sentiment"
            sentimentDistribution={sentimentData?.reddit?.sentimentDistribution}
            totalPosts={sentimentData?.reddit?.totalPosts}
            colors={COLORS}
          />

          {/* YouTube Sentiment */}
          <SentimentSection
            title="YouTube Sentiment"
            sentimentDistribution={sentimentData?.youtube?.sentimentDistribution}
            totalPosts={sentimentData?.youtube?.totalPosts}
            colors={COLORS}
          />

          {/* News Sentiment */}
          <SentimentSection
            title="News Sentiment"
            sentimentDistribution={sentimentData?.news?.sentimentDistribution}
            totalPosts={sentimentData?.news?.totalPosts}
            colors={COLORS}
          />
        </div>
      </div>
    </div>
  );
};

const SentimentSection = ({ title, sentimentDistribution, totalPosts, colors }) => {
  if (!sentimentDistribution) {
    return (
      <div className="bg-base-200 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-base-content/60">No data available</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const chartData = [
    { name: 'Positive', value: sentimentDistribution.positive || 0, color: colors.positive },
    { name: 'Neutral', value: sentimentDistribution.neutral || 0, color: colors.neutral },
    { name: 'Negative', value: sentimentDistribution.negative || 0, color: colors.negative }
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-base-200 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      {total > 0 ? (
        <>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Posts:</span>
              <span className="font-semibold">{totalPosts || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Positive:
              </span>
              <span className="font-semibold">{sentimentDistribution.positive || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                Neutral:
              </span>
              <span className="font-semibold">{sentimentDistribution.neutral || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Negative:
              </span>
              <span className="font-semibold">{sentimentDistribution.negative || 0}%</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-base-content/60">
          No sentiment data available
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysisPage;

