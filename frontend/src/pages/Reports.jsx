// frontend/src/pages/Reports.jsx
import React, { useState } from 'react';
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
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

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

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Sample data - replace with actual API calls
  const reportData = {
    daily: {
      title: 'Daily Report',
      dateRange: 'Last 30 days',
      metrics: {
        totalMentions: 1245,
        sentiment: { positive: 45, negative: 25, neutral: 30 },
        topPlatforms: { Twitter: 650, Reddit: 350, News: 245 },
        topTopics: [
          { name: 'Customer Service', count: 320 },
          { name: 'Product Quality', count: 280 },
          { name: 'Pricing', count: 195 },
          { name: 'New Features', count: 150 },
          { name: 'Competitors', count: 100 },
        ],
      },
      trendData: {
        labels: Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        values: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50),
      },
    },
    weekly: {
      title: 'Weekly Report',
      dateRange: 'Last 12 weeks',
      metrics: {
        totalMentions: 5230,
        sentiment: { positive: 48, negative: 22, neutral: 30 },
        topPlatforms: { Twitter: 2800, Reddit: 1500, News: 930 },
        topTopics: [
          { name: 'Product Quality', count: 1250 },
          { name: 'Customer Service', count: 980 },
          { name: 'Pricing', count: 850 },
          { name: 'New Features', count: 720 },
          { name: 'Competitors', count: 430 },
        ],
      },
      trendData: {
        labels: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
        values: Array.from({ length: 12 }, () => Math.floor(Math.random() * 200) + 300),
      },
    },
    monthly: {
      title: 'Monthly Report',
      dateRange: 'Last 6 months',
      metrics: {
        totalMentions: 15600,
        sentiment: { positive: 50, negative: 20, neutral: 30 },
        topPlatforms: { Twitter: 8500, Reddit: 4500, News: 2600 },
        topTopics: [
          { name: 'Product Quality', count: 4200 },
          { name: 'Customer Service', count: 3800 },
          { name: 'Pricing', count: 2900 },
          { name: 'New Features', count: 2500 },
          { name: 'Competitors', count: 1800 },
        ],
      },
      trendData: {
        labels: Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return d.toLocaleDateString('en-US', { month: 'long' });
        }),
        values: Array.from({ length: 6 }, () => Math.floor(Math.random() * 1000) + 1500),
      },
    },
  };

  const currentReport = reportData[reportType];

  const sentimentData = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          currentReport.metrics.sentiment.positive,
          currentReport.metrics.sentiment.negative,
          currentReport.metrics.sentiment.neutral,
        ],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
      },
    ],
  };

  const platformData = {
    labels: Object.keys(currentReport.metrics.topPlatforms),
    datasets: [
      {
        label: 'Mentions',
        data: Object.values(currentReport.metrics.topPlatforms),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
      },
    ],
  };

  const topicData = {
    labels: currentReport.metrics.topTopics.map((t) => t.name),
    datasets: [
      {
        label: 'Mentions',
        data: currentReport.metrics.topTopics.map((t) => t.count),
        backgroundColor: '#8B5CF6',
      },
    ],
  };

  const trendData = {
    labels: currentReport.trendData.labels,
    datasets: [
      {
        label: 'Mentions',
        data: currentReport.trendData.values,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const exportToPDF = async () => {
    setPdfError(null);
    setPdfLoading(true);
    try {
      const { PDFDocument, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText('Report', { x: 50, y: height - 50, size: 18, font });
      // ...compose more PDF content using reportData if needed...
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed or pdf-lib not installed:', err);
      setPdfError('PDF export is unavailable (optional package not installed).');
    } finally {
      setPdfLoading(false);
    }
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const data = [
      ['Metric', 'Value'],
      ['Total Mentions', currentReport.metrics.totalMentions],
      ['Positive Sentiment', `${currentReport.metrics.sentiment.positive}%`],
      ['Negative Sentiment', `${currentReport.metrics.sentiment.negative}%`],
      ['Neutral Sentiment', `${currentReport.metrics.sentiment.neutral}%`],
      ['', ''],
      ['Platform', 'Mentions'],
      ...Object.entries(currentReport.metrics.topPlatforms).map(([platform, count]) => [
        platform,
        count,
      ]),
      ['', ''],
      ['Topic', 'Mentions'],
      ...currentReport.metrics.topTopics.map((topic) => [topic.name, topic.count]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    // Generate Excel file
    XLSX.writeFile(
      wb,
      `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const sendEmail = () => {
    // In a real app, implement email sending functionality
    alert('Email functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              disabled={pdfLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {pdfLoading ? 'Preparing PDF…' : 'Export PDF'}
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Excel
            </button>
            <button
              onClick={sendEmail}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Email Report
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{currentReport.title}</h2>
          <p className="text-gray-500">{currentReport.dateRange}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500">Total Mentions</p>
            <p className="mt-1 text-3xl font-semibold">
              {currentReport.metrics.totalMentions.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-700">Positive</p>
            <p className="mt-1 text-3xl font-semibold text-green-600">
              {currentReport.metrics.sentiment.positive}%
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-700">Negative</p>
            <p className="mt-1 text-3xl font-semibold text-red-600">
              {currentReport.metrics.sentiment.negative}%
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Neutral</p>
            <p className="mt-1 text-3xl font-semibold text-gray-600">
              {currentReport.metrics.sentiment.neutral}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Mention Trend</h3>
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
          <div>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Top Platforms</h3>
            <div className="h-64">
              <Bar
                data={platformData}
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
          <div>
            <h3 className="text-lg font-medium mb-4">Top Topics</h3>
            <div className="h-64">
              <Bar
                data={topicData}
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
      </div>
    </div>
  );
};

export default Reports;