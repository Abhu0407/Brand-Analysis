import { useState, useEffect } from 'react';
import API_PATH, { BASE_URL } from '../store/apiPaths';
import InfoCard from '../components/Cards/InfoCard';

import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import { IoMdCard } from 'react-icons/io';
import { MdErrorOutline } from "react-icons/md";

function HomePage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Assuming GET_REDDIT_ANALYTICS is the URL string for your API endpoint
        const response = await fetch(`${BASE_URL}${API_PATH.DASHBOARD.GET_DATA}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch analytics data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-100 text-red-700 border border-red-400 rounded-lg">
        <MdErrorOutline className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div >
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
          <InfoCard
            icon={<IoMdCard />}
            label="Total Posts"
            value={analyticsData?.totalPosts || 0}
            color="bg-primary"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Average Likes"
            value={analyticsData?.averageLikes || 0}
            color="bg-orange-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Average Dislikes"
            value={analyticsData?.averageDislikes || 0}
            color="bg-red-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Average Comments"
            value={analyticsData?.averageComments || 0}
            color="bg-purple-500"
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Sentiment Distribution"
            value={analyticsData?.sentimentDistribution || { positive: 0, neutral: 0, negative: 0 }}
            color="bg-blue-500"
          />


        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>

        </div>
      </div>
    </div>
  )
}

export default HomePage