// src/Components/InvoiceForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Box, Typography } from '@mui/material';

function InvoiceForm({ invoice, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    invoice_number: '',
    store_name: '',
    city: '',
    zip_code: '',
    county: '',
  });

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }
  }, [invoice]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (invoice) {
        await axios.put(`${process.env.REACT_APP_API_URL}/invoices/${invoice.id}/`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/invoices/`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save invoice', error);
    }
  };

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          {invoice ? 'Edit Invoice' : 'Create Invoice'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Invoice Number"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Store Name"
            name="store_name"
            value={formData.store_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Zip Code"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="County"
            name="county"
            value={formData.county}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
            <Button onClick={onCancel} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}

export default InvoiceForm;