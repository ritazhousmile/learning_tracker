import React, { useEffect, useState } from 'react';
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
  TimeScale,
} from 'chart.js';
import { Box, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { ProgressResponse } from '../../types';
import api from '../../config/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ProgressChart: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number>(30);

  useEffect(() => {
    fetchProgressData();
  }, [selectedDays]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await api.get<ProgressResponse>(`/api/dashboard/progress?days=${selectedDays}`);
      setProgressData(response.data);
    } catch (err: any) {
      setError('Failed to load progress data');
      console.error('Progress data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box>Loading chart...</Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!progressData || progressData.progress_data.length === 0) {
    return <Alert severity="info">No progress data available yet.</Alert>;
  }

  const chartData = {
    labels: progressData.progress_data.map(item => 
      new Date(item.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Completed Tasks',
        data: progressData.progress_data.map(item => item.completed_tasks),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Completion Rate %',
        data: progressData.progress_data.map(item => item.completion_rate),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.1,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Learning Progress - Last ${selectedDays} Days`,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Completed Tasks',
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Completion Rate (%)',
        },
        beginAtZero: true,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={selectedDays}
            label="Time Period"
            onChange={(e) => setSelectedDays(Number(e.target.value))}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
            <MenuItem value={180}>Last 6 months</MenuItem>
            <MenuItem value={365}>Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ height: 400 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default ProgressChart; 