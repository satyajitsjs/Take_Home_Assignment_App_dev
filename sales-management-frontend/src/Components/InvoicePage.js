// src/Components/InvoicePage.js
import React, { useState } from 'react';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import axios from 'axios';
import { Container, Box, Button } from '@mui/material';

function InvoicePage() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setSelectedInvoice(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async (invoiceId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/invoices/${invoiceId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      handleSave();
    } catch (error) {
      console.error('Failed to delete invoice', error);
    }
  };

  return (
    <Container>
      <Box mt={5}>
        {showForm ? (
          <InvoiceForm invoice={selectedInvoice} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <>
            <Button variant="contained" color="primary" onClick={() => setShowForm(true)}>
              Create Invoice
            </Button>
            <InvoiceList onEdit={handleEdit} onDelete={handleDelete} />
          </>
        )}
      </Box>
    </Container>
  );
}

export default InvoicePage;