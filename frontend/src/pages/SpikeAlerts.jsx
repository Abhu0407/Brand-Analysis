// frontend/src/pages/SpikeAlerts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SpikeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpikeAlerts = async () => {
      try {
        setLoading(true);
        // In a real app, replace with actual API call
        const res = await axios.get('/api/alerts');
        setAlerts(res.data);
        if (res.data.length > 0) {
          setSelectedAlert(res.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching spike alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpikeAlerts();
  }, []);

  const selectedAlertData = alerts.find((a) => a.id === selectedAlert);

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Spike Alerts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedAlert === alert.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedAlert(alert.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getAlertColor(alert.severity)}`}
                    >
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-1">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedAlertData && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedAlertData.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedAlertData.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${getAlertColor(
                    selectedAlertData.severity
                  )}`}
                >
                  {selectedAlertData.severity.charAt(0).toUpperCase() +
                    selectedAlertData.severity.slice(1)}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Alert Details</h3>
                <p className="text-gray-700">{selectedAlertData.description}</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Platform</p>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedAlertData.platform.charAt(0).toUpperCase() +
                        selectedAlertData.platform.slice(1)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Mentions Before</p>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedAlertData.mentionsBefore} / hour
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Mentions After</p>
                    <p className="mt-1 text-lg font-semibold text-red-600">
                      {selectedAlertData.mentionsAfter} / hour
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Mention Volume</h3>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: selectedAlertData.volumeData.labels,
                        datasets: [
                          {
                            label: 'Mentions per hour',
                            data: selectedAlertData.volumeData.values,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.3,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Top Related Mentions</h3>
              <div className="space-y-4">
                {selectedAlertData.topMentions.map((mention) => (
                  <div key={mention._id} className="p-4 border rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                        {mention.platform === 'twitter' ? '🐦' : '🌐'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{mention.content}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          {mention.author} • {new Date(mention.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-1 flex space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              mention.sentiment === 'positive'
                                ? 'bg-green-100 text-green-800'
                                : mention.sentiment === 'negative'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {mention.sentiment}
                          </span>
                          {mention.topics.slice(0, 2).map((topic) => (
                            <span
                              key={topic}
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpikeAlerts;