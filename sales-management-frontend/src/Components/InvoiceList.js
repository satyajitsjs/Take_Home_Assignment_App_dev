// src/Components/InvoiceList.js
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Container,
  Box,
  Typography,
  Pagination,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function InvoiceList({ invoices, onEdit, onDelete, page, totalPages, onPageChange }) {
  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          <b>Invoices</b>
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Invoice Number</b></TableCell>
              <TableCell><b>Store Name</b></TableCell>
              <TableCell><b>City</b></TableCell>
              <TableCell><b>Zip Code</b></TableCell>
              <TableCell><b>County</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
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
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => onEdit(invoice)}
                    style={{ marginRight: "10px", minWidth: "30px" }}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => onDelete(invoice.id)}
                    style={{ minWidth: "30px" }}
                  >
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
}

export default InvoiceList;