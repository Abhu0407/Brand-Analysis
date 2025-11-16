import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import API_PATH from '../store/apiPaths';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [latestPosts, setLatestPosts] = useState({
    reddit: [],
    youtube: [],
    news: []
  });

  useEffect(() => {
    if (authUser) {
      fetchDashboardData();
    }
  }, [authUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const brand = authUser?.brandName || 'apple';

      console.log('Fetching dashboard data for:', { brand });

      // Fetch dashboard data and latest posts in parallel
      const [dashboardRes, redditPostsRes, youtubePostsRes, newsPostsRes] = await Promise.all([
        axiosInstance.get(API_PATH.DASHBOARD.GET_DATA, {
          params: { brand }
        }),
        axiosInstance.get(API_PATH.DASHBOARD.GET_LATEST_REDDIT, {
          params: { brand, limit: 5 }
        }),
        axiosInstance.get(API_PATH.DASHBOARD.GET_LATEST_YOUTUBE, {
          params: { brand, limit: 5 }
        }),
        axiosInstance.get(API_PATH.DASHBOARD.GET_LATEST_NEWS, {
          params: { brand, limit: 5 }
        })
      ]);

      console.log('Dashboard data received:', dashboardRes.data);
      console.log('Latest posts received:', {
        reddit: redditPostsRes.data,
        youtube: youtubePostsRes.data,
        news: newsPostsRes.data
      });

      setDashboardData(dashboardRes.data);
      setLatestPosts({
        reddit: redditPostsRes.data || [],
        youtube: youtubePostsRes.data || [],
        news: newsPostsRes.data || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const collectData = async () => {
    try {
      setCollecting(true);
      const brand = authUser?.brandName || 'apple';

      toast.loading('Collecting data from Reddit, YouTube, and News...', { id: 'collecting' });

      // Collect data from all sources in parallel
      const results = await Promise.allSettled([
        axiosInstance.put(API_PATH.COLLECT.UPDATE_REDDIT(brand)),
        axiosInstance.put(API_PATH.COLLECT.UPDATE_YOUTUBE, { brand }),
        axiosInstance.put(API_PATH.COLLECT.UPDATE_NEWS, { brand })
      ]);

      let successCount = 0;
      let errorCount = 0;
      const sources = ['Reddit', 'YouTube', 'News'];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          toast.success(`${sources[index]} data collected successfully`, { id: `collect-${index}` });
        } else {
          errorCount++;
          const errorMsg = result.reason?.response?.data?.message || 'Failed to collect data';
          toast.error(`${sources[index]}: ${errorMsg}`, { id: `collect-${index}` });
        }
      });

      toast.dismiss('collecting');
      
      if (successCount > 0) {
        toast.success(`Data collection completed! ${successCount} source(s) updated.`);
        // Refresh dashboard data after collection
        setTimeout(() => {
          fetchDashboardData();
        }, 2000);
      } else {
        toast.error('Failed to collect data from all sources. Please try again.');
      }
    } catch (err) {
      console.error('Error collecting data:', err);
      toast.dismiss('collecting');
      toast.error('Failed to collect data. Please try again.');
    } finally {
      setCollecting(false);
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

  // Check if we have any data at all (not just empty objects)
  const hasData = dashboardData && (
    (dashboardData.reddit && dashboardData.reddit.totalPosts > 0) ||
    (dashboardData.youtube && dashboardData.youtube.totalPosts > 0) ||
    (dashboardData.news && dashboardData.news.totalPosts > 0)
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {hasData && (
            <button
              onClick={collectData}
              disabled={collecting}
              className="btn btn-outline btn-sm gap-2"
              title="Refresh data from all sources"
            >
              {collecting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Collecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </>
              )}
            </button>
          )}
        </div>
        
        {!hasData && !loading && (
          <div className="bg-base-200 rounded-xl p-8 text-center">
            <p className="text-lg mb-4">No data available for your selected brand.</p>
            <p className="text-base-content/60 mb-4">
              Brand: <strong>{authUser?.brandName || 'Not set'}</strong>
            </p>
            <p className="text-sm text-base-content/60 mb-6">
              Click the button below to collect data from Reddit, YouTube, and News sources.
            </p>
            <button
              onClick={collectData}
              disabled={collecting || !authUser?.brandName}
              className="btn btn-primary gap-2"
            >
              {collecting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Collecting Data...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Collect Data Now
                </>
              )}
            </button>
            {!authUser?.brandName && (
              <p className="text-sm text-warning mt-4">
                Please set your brand name in your profile first.
              </p>
            )}
          </div>
        )}
        
        {hasData && (
          <div className="space-y-8">
            {/* Reddit Section */}
            <SourceSection
              title="Reddit Analytics"
              data={dashboardData?.reddit}
              latestPosts={latestPosts.reddit}
              sourceType="reddit"
            />

            {/* YouTube Section */}
            <SourceSection
              title="YouTube Analytics"
              data={dashboardData?.youtube}
              latestPosts={latestPosts.youtube}
              sourceType="youtube"
            />

            {/* News Section */}
            <SourceSection
              title="News Analytics"
              data={dashboardData?.news}
              latestPosts={latestPosts.news}
              sourceType="news"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const SourceSection = ({ title, data, latestPosts, sourceType }) => {
  if (!data) {
    console.log(`No data for ${sourceType}`);
    return (
      <div className="bg-base-200 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">{title}</h2>
        <p className="text-base-content/60">No data available</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = (data.postsByDate || []).map(item => {
    try {
      const dateObj = item.date ? new Date(item.date) : new Date();
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        posts: item.count || 0
      };
    } catch (e) {
      console.error('Error parsing date:', item.date, e);
      return {
        date: 'Unknown',
        posts: item.count || 0
      };
    }
  });

  return (
    <div className="bg-base-200 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Posts" value={data.totalPosts || 0} />
        {data.averageLikes !== undefined && data.averageLikes !== null && (
          <MetricCard label="Avg Likes" value={Number(data.averageLikes).toFixed(1)} />
        )}
        {data.averageComments !== undefined && data.averageComments !== null && (
          <MetricCard label="Avg Comments" value={Number(data.averageComments).toFixed(1)} />
        )}
        {data.averageDislikes !== undefined && data.averageDislikes !== null && (
          <MetricCard label="Avg Dislikes" value={Number(data.averageDislikes).toFixed(1)} />
        )}
      </div>

      {/* Chart */}
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

      {/* Latest Posts */}
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

export default DashboardPage;

