// frontend/src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { SearchIcon } from '@heroicons/react/solid';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Search = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Sample recent searches - in a real app, fetch from API or localStorage
  useEffect(() => {
    const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(searches);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // In a real app, replace with actual API call
      // const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      // setSearchResults(res.data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sample response
      const mockData = {
        query,
        totalResults: Math.floor(Math.random() * 5000) + 1000,
        sentiment: {
          positive: Math.floor(Math.random() * 40) + 30, // 30-70%
          negative: Math.floor(Math.random() * 30) + 10, // 10-40%
          neutral: 100 - (Math.floor(Math.random() * 40) + 30) - (Math.floor(Math.random() * 30) + 10),
        },
        trend: {
          labels: Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return d.toLocaleDateString('en-US', { month: 'short' });
          }),
          values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 50),
        },
        topMentions: Array.from({ length: 5 }, (_, i) => ({
          id: i,
          content: `This is a sample mention about ${query} that shows up in the search results. This could be a tweet, reddit post, or news article.`,
          author: `user${Math.floor(Math.random() * 1000)}`,
          platform: ['twitter', 'reddit', 'news'][Math.floor(Math.random() * 3)],
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          likes: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 500),
        })),
        relatedQueries: [
          { query: `${query} reviews`, count: Math.floor(Math.random() * 1000) + 500 },
          { query: `best ${query} 2023`, count: Math.floor(Math.random() * 800) + 300 },
          { query: `${query} vs competitor`, count: Math.floor(Math.random() * 600) + 200 },
          { query: `how to use ${query}`, count: Math.floor(Math.random() * 400) + 100 },
          { query: `${query} problems`, count: Math.floor(Math.random() * 300) + 50 },
        ],
      };

      setSearchResults(mockData);

      // Update recent searches
      const updatedSearches = [
        { query, timestamp: new Date() },
        ...recentSearches.filter((s) => s.query.toLowerCase() !== query.toLowerCase()).slice(0, 4),
      ];
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const sentimentData = searchResults
    ? {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
          {
            data: [
              searchResults.sentiment.positive,
              searchResults.sentiment.negative,
              searchResults.sentiment.neutral,
            ],
            backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
          },
        ],
      }
    : null;

  const trendData = searchResults
    ? {
        labels: searchResults.trend.labels,
        datasets: [
          {
            label: 'Mentions',
            data: searchResults.trend.values,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      }
    : null;

  const relatedQueriesData = searchResults
    ? {
        labels: searchResults.relatedQueries.map((q) => q.query),
        datasets: [
          {
            label: 'Mentions',
            data: searchResults.relatedQueries.map((q) => q.count),
            backgroundColor: '#8B5CF6',
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Brand Search</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search for a brand, product, or topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  loading || !query.trim()
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {recentSearches.length > 0 && !searchResults && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search.query);
                    // Trigger search
                    const event = new Event('submit', { cancelable: true });
                    document.querySelector('form').dispatchEvent(event);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {search.query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {searchResults && !loading && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Results for "{searchResults.query}"
            </h2>
            <p className="text-gray-500">
              {searchResults.totalResults.toLocaleString()} mentions found
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Total Mentions</p>
                <p className="mt-1 text-3xl font-semibold">
                  {searchResults.totalResults.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Positive</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">
                  {searchResults.sentiment.positive}%
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-red-700">Negative</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">
                  {searchResults.sentiment.negative}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Sentiment Distribution</h3>
              <div className="h-64">
                <Bar
                  data={sentimentData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `${value}%`,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Mention Trend (Last 12 Months)</h3>
              <div className="h-64">
                <Line
                  data={trendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Top Mentions</h3>
                <div className="space-y-4">
                  {searchResults.topMentions.map((mention) => (
                    <div
                      key={mention.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                            mention.sentiment === 'positive'
                              ? 'bg-green-100 text-green-600'
                              : mention.sentiment === 'negative'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {mention.platform === 'twitter' ? (
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                          ) : mention.platform === 'reddit' ? (
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 012.5-.34c.85 0 1.7.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48C17.14 18.16 20 14.42 20 10c0-5.52-4.48-10-10-10z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2 5a2 2 0 012-2h12a2 2 0 110 4H4a2 2 0 01-2-2zm2-1a1 1 0 100 2h12a1 1 0 100-2H4zm0 6a1 1 0 100 2h12a1 1 0 100-2H4zm0 6a1 1 0 100 2h12a1 1 0 100-2H4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">{mention.content}</p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span>@{mention.author}</span>
                            <span className="mx-1">•</span>
                            <span>
                              {new Date(mention.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="mx-1">•</span>
                            <div className="flex items-center space-x-1">
                              <span>👍 {mention.likes.toLocaleString()}</span>
                              <span>🔄 {mention.shares.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Related Searches</h3>
                <div className="space-y-3">
                  {searchResults.relatedQueries.map((query, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <a
                        href={`#${query.query}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          setQuery(query.query);
                          // Trigger search
                          const event = new Event('submit', { cancelable: true });
                          document.querySelector('form').dispatchEvent(event);
                        }}
                      >
                        {query.query}
                      </a>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {query.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Sentiment by Platform</h3>
                <div className="space-y-4">
                  {['Twitter', 'Reddit', 'News'].map((platform) => (
                    <div key={platform} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{platform}</span>
                        <span className="text-gray-500">
                          {Math.floor(Math.random() * 500) + 100} mentions
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.random() * 60 + 20}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {Math.floor(Math.random() * 40) + 50}% positive
                        </span>
                        <span>
                          {Math.floor(Math.random() * 30) + 10}% negative
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;