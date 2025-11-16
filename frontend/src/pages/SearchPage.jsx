import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import API_PATH from '../store/apiPaths';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const { authUser } = useAuthStore();
  const [searchBrand, setSearchBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [latestPosts, setLatestPosts] = useState({
    reddit: [],
    youtube: [],
    news: []
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchBrand.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data and latest posts in parallel
      const [dashboardRes, redditPostsRes, youtubePostsRes, newsPostsRes] = await Promise.all([
        axiosInstance.get(API_PATH.DASHBOARD.GET_DATA, {
          params: { brand: searchBrand.trim() }
        }),
        axiosInstance.get(API_PATH.DASHBOARD.GET_LATEST_REDDIT, {
          params: { brand: searchBrand.trim(), limit: 5 }
        }),
        axiosInstance.get(API_PATH.DASHBOARD.GET_LATEST_YOUTUBE, {
          params: { brand: searchBrand.trim(), limit: 5 }
        }),
        axiosInstance.get(API_PATH.DASHBOARD.GET_LATEST_NEWS, {
          params: { brand: searchBrand.trim(), limit: 5 }
        })
      ]);

      setDashboardData(dashboardRes.data);
      setLatestPosts({
        reddit: redditPostsRes.data,
        youtube: youtubePostsRes.data,
        news: newsPostsRes.data
      });
      
      toast.success(`Analysis for "${searchBrand}" loaded successfully`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch data';
      setError(errorMsg);
      toast.error(errorMsg);
      setDashboardData(null);
      setLatestPosts({ reddit: [], youtube: [], news: [] });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    positive: '#10b981',
    neutral: '#6b7280',
    negative: '#ef4444'
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Brand Search & Analysis</h1>

        {/* Search Form */}
        <div className="bg-base-200 rounded-xl p-6 shadow-lg mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="label">
                <span className="label-text">Brand Name</span>
              </label>
              <input
                type="text"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                placeholder="Enter brand name (e.g., apple, microsoft, tesla)"
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="btn btn-primary w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="alert alert-error mb-8">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {dashboardData && (
          <div className="space-y-8">
            {/* Dashboard Sections */}
            <div className="space-y-8">
              <SourceSection
                title="Reddit Analytics"
                data={dashboardData?.reddit}
                latestPosts={latestPosts.reddit}
                sourceType="reddit"
              />

              <SourceSection
                title="YouTube Analytics"
                data={dashboardData?.youtube}
                latestPosts={latestPosts.youtube}
                sourceType="youtube"
              />

              <SourceSection
                title="News Analytics"
                data={dashboardData?.news}
                latestPosts={latestPosts.news}
                sourceType="news"
              />
            </div>

            {/* Sentiment Analysis Sections */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Sentiment Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <SentimentSection
                  title="Reddit Sentiment"
                  sentimentDistribution={dashboardData?.reddit?.sentimentDistribution}
                  totalPosts={dashboardData?.reddit?.totalPosts}
                  colors={COLORS}
                />

                <SentimentSection
                  title="YouTube Sentiment"
                  sentimentDistribution={dashboardData?.youtube?.sentimentDistribution}
                  totalPosts={dashboardData?.youtube?.totalPosts}
                  colors={COLORS}
                />

                <SentimentSection
                  title="News Sentiment"
                  sentimentDistribution={dashboardData?.news?.sentimentDistribution}
                  totalPosts={dashboardData?.news?.totalPosts}
                  colors={COLORS}
                />
              </div>
            </div>
          </div>
        )}

        {!dashboardData && !loading && (
          <div className="text-center py-20 text-base-content/60">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter a brand name to search and analyze</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Reuse components from DashboardPage
const SourceSection = ({ title, data, latestPosts, sourceType }) => {
  if (!data) return null;

  const chartData = data.postsByDate?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    posts: item.count
  })) || [];

  return (
    <div className="bg-base-200 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Posts" value={data.totalPosts || 0} />
        {data.averageLikes !== undefined && (
          <MetricCard label="Avg Likes" value={data.averageLikes.toFixed(1)} />
        )}
        {data.averageComments !== undefined && (
          <MetricCard label="Avg Comments" value={data.averageComments.toFixed(1)} />
        )}
        {data.averageDislikes !== undefined && (
          <MetricCard label="Avg Dislikes" value={data.averageDislikes.toFixed(1)} />
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Posts Over Time</h3>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="posts" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-base-content/60">
              No data available for chart
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Latest 5 Posts</h3>
        <div className="space-y-3">
          {latestPosts && latestPosts.length > 0 ? (
            latestPosts.map((post, index) => (
              <PostCard key={index} post={post} sourceType={sourceType} />
            ))
          ) : (
            <p className="text-base-content/60">No posts available</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="bg-base-100 rounded-lg p-4 shadow">
    <p className="text-sm text-base-content/60 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const PostCard = ({ post, sourceType }) => {
  const getPostTitle = () => {
    if (sourceType === 'reddit') return post.title || 'No title';
    if (sourceType === 'youtube') return post.videoTitle || 'No title';
    if (sourceType === 'news') return post.snippet?.substring(0, 100) || 'No snippet';
    return 'No title';
  };

  const getPostDate = () => {
    const date = post.date || post.publishedAt;
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString();
  };

  const getSentimentBadge = () => {
    const sentiment = post.sentiment || (post.sentimentSummary ? 
      Object.entries(post.sentimentSummary).reduce((a, b) => a[1] > b[1] ? a : b)[0] : null);
    
    if (!sentiment) return null;

    const colors = {
      positive: 'bg-green-500',
      neutral: 'bg-gray-500',
      negative: 'bg-red-500'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${colors[sentiment] || 'bg-gray-500'}`}>
        {sentiment}
      </span>
    );
  };

  return (
    <div className="bg-base-100 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium flex-1">{getPostTitle()}</h4>
        {getSentimentBadge()}
      </div>
      <div className="flex items-center gap-4 text-sm text-base-content/60 mt-2">
        <span>{getPostDate()}</span>
        {post.likes !== undefined && <span>👍 {post.likes}</span>}
        {post.likeCount !== undefined && <span>👍 {post.likeCount}</span>}
        {post.num_comments !== undefined && <span>💬 {post.num_comments}</span>}
        {post.commentCount !== undefined && <span>💬 {post.commentCount}</span>}
        {post.url && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            View →
          </a>
        )}
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

export default SearchPage;

