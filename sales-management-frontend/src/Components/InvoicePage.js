// src/Components/InvoicePage.js
import React, { useState, useEffect } from 'react';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import axios from 'axios';
import { Container, Box, Button } from '@mui/material';
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function InvoicePage() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/invoices/?page=${page}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      });
      setInvoices(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
      toast.error('Failed to fetch invoices');
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setSelectedInvoice(null);
    fetchInvoices(); // Fetch the latest invoices after saving
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedInvoice(null);
  };

  const handleDelete = async (invoiceId) => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/invoices/${invoiceId}/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      });
  
      if (response.status === 204) {
        toast.success('Invoice deleted successfully');
        fetchInvoices(); // Fetch the latest invoices after deletion
      } else {
        toast.error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Failed to delete invoice', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
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
            <InvoiceList 
              invoices={invoices} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              page={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        )}
      </Box>
    </Container>
  );
}

export default InvoicePage;