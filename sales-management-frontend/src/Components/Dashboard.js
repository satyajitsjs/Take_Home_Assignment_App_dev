// src/Components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import FilterListIcon from '@mui/icons-material/FilterList';
import StoreIcon from '@mui/icons-material/Store';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const useStyles = makeStyles(() => ({
  card: {
    marginTop: 24, // 3 * 8px (default spacing unit)
  },
  filterButton: {
    marginTop: 16, // 2 * 8px (default spacing unit)
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
}));

function Dashboard() {
  const classes = useStyles();
  const [filters, setFilters] = useState({
    store_name: '',
    city: '',
    zip_code: '',
    county_number: '',
    county: '',
    category: '',
    vendor_number: '',
    item_number: ''
  });
  const [data, setData] = useState({
    total_stock: 0,
    total_sales: 0,
    total_profit: 0
  });
  const [loading, setLoading] = useState(false);

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
        params: filters
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

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <form onSubmit={handleFilterSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Store Name"
                name="store_name"
                value={filters.store_name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="City"
                name="city"
                value={filters.city}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Zip Code"
                name="zip_code"
                value={filters.zip_code}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="County Number"
                name="county_number"
                value={filters.county_number}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="County"
                name="county"
                value={filters.county}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Category"
                name="category"
                value={filters.category}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Vendor Number"
                name="vendor_number"
                value={filters.vendor_number}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Item Number"
                name="item_number"
                value={filters.item_number}
                onChange={handleInputChange}
                fullWidth
              />
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
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <StoreIcon className={classes.icon} />
                  Total Stock
                </Typography>
                <Typography variant="h4">{data.total_stock}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AttachMoneyIcon className={classes.icon} />
                  Total Sales
                </Typography>
                <Typography variant="h4">{data.total_sales}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingUpIcon className={classes.icon} />
                  Total Profit
                </Typography>
                <Typography variant="h4">{data.total_profit}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard;