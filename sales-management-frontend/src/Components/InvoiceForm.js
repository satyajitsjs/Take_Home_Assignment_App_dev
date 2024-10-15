import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { TextField, Button, Container, Box, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const InvoiceForm = React.memo(({ invoice, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    invoice_number: "",
    date: "",
    store_id: "",
    item_id: "",
    bottles_sold: "",
    sale_dollars: "",
    volume_sold_liters: "",
    volume_sold_gallons: "",
  });

  const [foreignKeyData, setForeignKeyData] = useState({
    stores: [],
    items: [],
  });

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }
  }, [invoice]);

  useEffect(() => {
    const fetchInvoiceSelectData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get_invoice_select_data/`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token")}`,
          },
        });
        setForeignKeyData(response.data);
      } catch (error) {
        console.error("Failed to fetch foreign key data", error);
        toast.error("Failed to fetch foreign key data");
      }
    };

    fetchInvoiceSelectData();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }, []);

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

  const storeOptions = useMemo(() => (
    foreignKeyData.stores.map((store) => (
      <MenuItem key={store.id} value={store.id}>
        {store.store_name}
      </MenuItem>
    ))
  ), [foreignKeyData.stores]);

  const itemOptions = useMemo(() => (
    foreignKeyData.items.map((item) => (
      <MenuItem key={item.id} value={item.id}>
        {item.item_desc}
      </MenuItem>
    ))
  ), [foreignKeyData.items]);

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
          <FormControl fullWidth margin="normal">
            <InputLabel>Store</InputLabel>
            <Select
              name="store_id"
              value={formData.store_id}
              onChange={handleChange}
            >
              {storeOptions}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Item</InputLabel>
            <Select
              name="item_id"
              value={formData.item_id}
              onChange={handleChange}
            >
              {itemOptions}
            </Select>
          </FormControl>
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
});

export default InvoiceForm;