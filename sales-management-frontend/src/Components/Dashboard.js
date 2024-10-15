import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Grid, CircularProgress, Autocomplete, Paper, Checkbox, FormControlLabel, FormGroup, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import FilterListIcon from '@mui/icons-material/FilterList';
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
    marginTop: 24, 
    marginBottom: 32, 
  },
  filterButton: {
    marginTop: 16, 
  },
  clearButton: {
    marginTop: 16, 
    marginLeft: 8,
  },
  icon: {
    verticalAlign: 'middle',
    marginRight: 8,
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

function Dashboard() {
  const classes = useStyles();
  const initialFilters = {
    store_name: '',
    city: '',
    zip_code: '',
    store_location: '',
    county_number: '',
    county: '',
    category: '',
    category_name: '',
    vendor_number: '',
    vendor_name: '',
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
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const activeFilters = selectedFilters.reduce((acc, filter) => {
        if (filters[filter]) {
          acc[filter] = filters[filter];
        }
        return acc;
      }, {});

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/dashboard/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`
        },
        params: activeFilters
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
    setFilterDialogOpen(false);
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
    setSelectedFilters(prevSelectedFilters => {
      const newSelectedFilters = checked
        ? [...prevSelectedFilters, name]
        : prevSelectedFilters.filter(filter => filter !== name);

      if (!checked) {
        setFilters(prevFilters => {
          const newFilters = { ...prevFilters };
          delete newFilters[name];
          return newFilters;
        });
      }

      return newSelectedFilters;
    });
  };

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
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
      <Grid container justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          className={classes.filterButton}
          startIcon={<FilterListIcon />}
          onClick={handleOpenFilterDialog}
        >
          Add Filter
        </Button>
      </Grid>
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
      <Dialog open={filterDialogOpen} onClose={handleCloseFilterDialog} fullWidth maxWidth="md">
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
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
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilterDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleFilterSubmit} color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={3} className={classes.card}>
        <Grid item xs={12} md={6} className={classes.chartContainer}>
          <ChartComponent title="Sales Over Time" data={data.salesData} chartType={chartType} />
        </Grid>
        <Grid item xs={12} md={6} className={classes.chartContainer}>
          <ChartComponent title="Stock Over Time" data={data.stockData} chartType={chartType} />
        </Grid>
        <Grid item xs={12} md={6} className={classes.chartContainer}>
          <ChartComponent title="Profit Over Time" data={data.profitData} chartType={chartType} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;