import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const useStyles = makeStyles(() => ({
  header: {
    backgroundColor: '#3f51b5',
    color: '#fff',
    padding: '16px 0',
    textAlign: 'center',
  },
  card: {
    marginTop: 24, // 3 * 8px (default spacing unit)
  },
  filterButton: {
    marginTop: 16, // 2 * 8px (default spacing unit)
  },
  clearButton: {
    marginTop: 16, // 2 * 8px (default spacing unit)
    marginLeft: 8, // 1 * 8px (default spacing unit)
  },
  icon: {
    verticalAlign: 'middle',
    marginRight: 8, // 1 * 8px (default spacing unit)
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  paper: {
    padding: 16,
    marginTop: 24,
  },
  formControl: {
    marginTop: 16,
  },
  chartContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
}));

const ChartComponent = ({ title, data, chartType }) => {
  const classes = useStyles();

  console.log('Chart data:', data); // Add this line

  const chartProps = {
    data: {
      labels: data?.labels || [],
      datasets: [
        {
          label: title,
          data: data?.values || [],
          backgroundColor: chartType === 'pie' ? [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ] : '#36A2EB',
          borderColor: chartType === 'line' ? '#36A2EB' : undefined,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true, // Maintain aspect ratio
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      default:
        return <Line {...chartProps} />;
    }
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <div className={classes.chartContainer}>
        {renderChart()}
      </div>
    </Paper>
  );
};

export default ChartComponent;