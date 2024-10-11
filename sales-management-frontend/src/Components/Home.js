// src/Components/Home.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Home
        </Typography>
        <Typography variant="body1">
          Welcome to the Sales Management System.
        </Typography>
      </Box>
    </Container>
  );
}