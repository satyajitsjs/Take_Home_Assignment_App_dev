import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Grid, CircularProgress, Autocomplete, Paper, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import StoreIcon from '@mui/icons-material/Store';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChartComponent from './ChartComponent';
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
}));

function Dashboard() {
  const classes = useStyles();
  const initialFilters = {
    store_name: '',
    city: '',
    zip_code: '',
    county_number: '',
    county: '',
    category: '',
    vendor_number: '',
    item_number: ''
  };
  const [filters, setFilters] = useState(initialFilters);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [data, setData] = useState({
    total_stock: 0,
    total_sales: 0,
    total_profit: 0,
    salesData: { labels: [], values: [] },
    stockData: { labels: [], values: [] },
    profitData: { labels: [], values: [] },
  });
  const [loading, setLoading] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState({});
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`
        },
        params: selectedFilters.length > 0 ? filters : {}
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setSelectedFilters([]);
    fetchDashboardData();
  };

  const handleAutocompleteChange = async (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleAutocompleteInputChange = async (filterType, value) => {
    if (value.length >= 3) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/autocomplete/`, {
          params: { query: value, filter_type: filterType }
        });
        setAutocompleteOptions(prevOptions => ({
          ...prevOptions,
          [filterType]: response.data.results
        }));
      } catch (error) {
        console.error('Failed to fetch autocomplete options', error);
      }
    }
  };

  const handleFilterSelection = (event) => {
    const { name, checked } = event.target;
    setSelectedFilters(prevSelectedFilters => 
      checked ? [...prevSelectedFilters, name] : prevSelectedFilters.filter(filter => filter !== name)
    );
  };

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Grid container spacing={3} className={classes.card}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              <StoreIcon className={classes.icon} />
              Total Stock
            </Typography>
            <Typography variant="h4">{data.total_stock}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              <AttachMoneyIcon className={classes.icon} />
              Total Sales
            </Typography>
            <Typography variant="h4">{data.total_sales}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon className={classes.icon} />
              Total Profit
            </Typography>
            <Typography variant="h4">{data.total_profit}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <form onSubmit={handleFilterSubmit}>
        <FormGroup row>
          {Object.keys(initialFilters).map(filterType => (
            <FormControlLabel
              key={filterType}
              control={
                <Checkbox
                  checked={selectedFilters.includes(filterType)}
                  onChange={handleFilterSelection}
                  name={filterType}
                />
              }
              label={filterType.replace('_', ' ').toUpperCase()}
            />
          ))}
        </FormGroup>
        <Grid container spacing={2} className={classes.formControl}>
          {selectedFilters.map(filterType => (
            <Grid item xs={12} sm={6} md={4} key={filterType}>
              <Autocomplete
                freeSolo
                options={autocompleteOptions[filterType] || []}
                onInputChange={(event, value) => handleAutocompleteInputChange(filterType, value)}
                onChange={(event, value) => handleAutocompleteChange(filterType, value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={filterType.replace('_', ' ').toUpperCase()}
                    name={filterType}
                    fullWidth
                    onChange={handleInputChange}
                  />
                )}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Chart Type"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.filterButton}
              startIcon={<FilterListIcon />}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </form>
      <Grid container spacing={3} className={classes.card}>
        <Grid item xs={12}>
          <ChartComponent title="Sales Over Time" data={data.salesData} chartType={chartType} />
        </Grid>
        <Grid item xs={12}>
          <ChartComponent title="Stock Over Time" data={data.stockData} chartType={chartType} />
        </Grid>
        <Grid item xs={12}>
          <ChartComponent title="Profit Over Time" data={data.profitData} chartType={chartType} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;