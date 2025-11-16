// frontend/src/pages/TopicClustering.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Cloud, defaultFont } from 'react-d3-cloud';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TopicClustering = () => {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wordcloudError, setWordcloudError] = useState(false);

  useEffect(() => {
    const fetchTopicClusters = async () => {
      try {
        setLoading(true);
        // In a real app, replace with actual API call
        const res = await axios.get('/api/topics/clusters');
        setClusters(res.data);
        if (res.data.length > 0) {
          setSelectedCluster(res.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching topic clusters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopicClusters();
  }, []);

  const selectedClusterData = clusters.find((c) => c.id === selectedCluster);

  const clusterData = {
    labels: clusters.map((c) => c.name),
    datasets: [
      {
        data: clusters.map((c) => c.mentions),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#14B8A6',
          '#F97316',
        ],
      },
    ],
  };

  const bubbleData = {
    datasets: clusters.map((cluster) => ({
      label: cluster.name,
      data: [
        {
          x: cluster.sentiment * 100, // X-axis: Sentiment (-1 to 1 scaled to -100 to 100)
          y: cluster.mentions, // Y-axis: Number of mentions
          r: Math.sqrt(cluster.keywords.length) * 5, // Size based on number of keywords
        },
      ],
      backgroundColor: cluster.color || '#3B82F6',
    })),
  };

  const wordCloudData = selectedClusterData
    ? selectedClusterData.keywords.map((word) => ({
      text: word.text,
      value: word.count * 10,
    }))
    : [];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Topic & Theme Clustering</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Topic Clusters</h3>
          <div className="h-64">
            <Doughnut
              data={clusterData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: (_, elements) => {
                  if (elements.length > 0) {
                    setSelectedCluster(clusters[elements[0].index].id);
                  }
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Topic Distribution</h3>
          <div className="h-64">
            <Bubble
              data={bubbleData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -100,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Sentiment (-100 to 100)',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Number of Mentions',
                    },
                    beginAtZero: true,
                  },
                },
                onClick: (_, elements) => {
                  if (elements.length > 0) {
                    setSelectedCluster(clusters[elements[0].datasetIndex].id);
                  }
                },
              }}
            />
          </div>
        </div>
      </div>

      {selectedClusterData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-medium mb-4">
              {selectedClusterData.name} - Keywords
            </h3>
            <div className="h-96">
              <div className="w-full h-96 flex justify-center items-center">
                <Cloud
                  data={wordCloudData}
                  width={400}
                  height={300}
                  font={defaultFont}
                  fontSize={(word) => Math.log2(word.value) * 5}
                  rotate={(word) => word.rotate}
                  padding={5}
                  random={() => 0.5}
                >
                  {(cloud) =>
                    cloud.words.map((w, i) => (
                      <text
                        key={i}
                        textAnchor="middle"
                        transform={`translate(${w.x},${w.y})rotate(${w.rotate})`}
                        fontSize={w.size}
                        fillOpacity={0.8}
                      >
                        {w.text}
                      </text>
                    ))
                  }
                </Cloud>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Sentiment</h3>
              <div className="flex items-center">
                <div
                  className={`h-4 rounded-full ${selectedClusterData.sentiment > 0
                    ? 'bg-green-500'
                    : selectedClusterData.sentiment < 0
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                    }`}
                  style={{
                    width: `${Math.abs(selectedClusterData.sentiment) * 100}%`,
                    marginLeft: selectedClusterData.sentiment < 0 ? 'auto' : '0',
                  }}
                ></div>
                <span className="ml-2 text-sm font-medium">
                  {selectedClusterData.sentiment > 0 ? 'Positive' : selectedClusterData.sentiment < 0 ? 'Negative' : 'Neutral'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {selectedClusterData.sentiment > 0
                  ? 'Overall sentiment is positive'
                  : selectedClusterData.sentiment < 0
                    ? 'Overall sentiment is negative'
                    : 'Neutral sentiment'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Top Mentions</h3>
              <div className="space-y-4">
                {selectedClusterData.topMentions.map((mention) => (
                  <div key={mention._id} className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-900 line-clamp-2">{mention.content}</p>
                    <div className="mt-1 text-xs text-gray-500">
                      {mention.author} • {new Date(mention.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicClustering;