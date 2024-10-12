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
  paper: {
    padding: 16,
    marginTop: 24,
  },
  chartContainer: {
    position: 'relative',
    height: '400px', // Set a fixed height
    width: '100%', // Set width to 100%
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
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
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