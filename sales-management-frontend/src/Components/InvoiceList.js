// src/Components/InvoiceList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Container, Box, Typography, Pagination } from '@mui/material';

function InvoiceList({ onEdit }) {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices(page);
  }, [page]);

  const fetchInvoices = async (page) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/invoices/?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setInvoices(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 100)); // Assuming page size is 100
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Invoices
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Store Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Zip Code</TableCell>
              <TableCell>County</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.store_name}</TableCell>
                <TableCell>{invoice.city}</TableCell>
                <TableCell>{invoice.zip_code}</TableCell>
                <TableCell>{invoice.county}</TableCell>
                <TableCell>
                  <Button onClick={() => onEdit(invoice)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination count={totalPages} page={page} onChange={handlePageChange} />
        </Box>
      </Box>
    </Container>
  );
}

export default InvoiceList;