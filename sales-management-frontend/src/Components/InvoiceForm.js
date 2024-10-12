// src/Components/InvoiceForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
function InvoiceForm({ invoice, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    invoice_number: "",
    date: "",
    store_number: "",
    store_name: "",
    address: "",
    city: "",
    zip_code: "",
    store_location: "",
    county_number: "",
    county: "",
    category: "",
    category_name: "",
    vendor_number: "",
    vendor_name: "",
    item_number: "",
    item_desc: "",
    pack: "",
    bottle_volume_ml: "",
    state_bottle_cost: "",
    state_bottle_retail: "",
    bottles_sold: "",
    sale_dollars: "",
    volume_sold_liters: "",
    volume_sold_gallons: "",
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
        await axios.put(
          `${process.env.REACT_APP_API_URL}/invoices/${invoice.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("access_token")}`,
            },
          }
        );
        toast.success("Invoice updated successfully!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/invoices/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("access_token")}`,
            },
          }
        );
        toast.success("Invoice created successfully!");
      }
      onSave();
    } catch (error) {
      console.error("Failed to save invoice", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              toast.error(`${field}: ${message}`);
            });
          } else {
            toast.error(`${field}: ${messages}`);
          }
        }
      } else {
        toast.error("Failed to save invoice");
      }
    }
  };

  return (
    <Container>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          {invoice ? "Edit Invoice" : "Create Invoice"}
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
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Store Number"
            name="store_number"
            value={formData.store_number}
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
            label="Address"
            name="address"
            value={formData.address}
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
            label="Store Location"
            name="store_location"
            value={formData.store_location}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="County Number"
            name="county_number"
            value={formData.county_number}
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
          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category Name"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Vendor Number"
            name="vendor_number"
            value={formData.vendor_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Vendor Name"
            name="vendor_name"
            value={formData.vendor_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Item Number"
            name="item_number"
            value={formData.item_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Item Description"
            name="item_desc"
            value={formData.item_desc}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Pack"
            name="pack"
            value={formData.pack}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Bottle Volume (ml)"
            name="bottle_volume_ml"
            value={formData.bottle_volume_ml}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="State Bottle Cost"
            name="state_bottle_cost"
            value={formData.state_bottle_cost}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="State Bottle Retail"
            name="state_bottle_retail"
            value={formData.state_bottle_retail}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Bottles Sold"
            name="bottles_sold"
            value={formData.bottles_sold}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Sale Dollars"
            name="sale_dollars"
            value={formData.sale_dollars}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Volume Sold (Liters)"
            name="volume_sold_liters"
            value={formData.volume_sold_liters}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Volume Sold (Gallons)"
            name="volume_sold_gallons"
            value={formData.volume_sold_gallons}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box mt={2}>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
            <Button
              onClick={onCancel}
              variant="contained"
              color="secondary"
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}

export default InvoiceForm;
