const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Canteen Menu API is running standard & healthy' });
});

// -------------------------------------------------------------------
// CATEGORIES ENDPOINTS
// -------------------------------------------------------------------

// GET /api/categories - Fetch all categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// -------------------------------------------------------------------
// MENU ITEMS ENDPOINTS (CRUD)
// -------------------------------------------------------------------

// GET /api/menu - Fetch all menu items (with optional category filter & search query)
app.get('/api/menu', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = supabase.from('menu_items').select('*, categories(name)').order('id', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching menu items:', err.message);
    res.status(500).json({ error: 'Failed to fetch menu items', details: err.message });
  }
});

// POST /api/menu - Create a new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, description, price, category_id, is_available, image_url } = req.body;

    if (!name || price == null || !category_id) {
      return res.status(400).json({ error: 'Name, price, and category_id are required fields.' });
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ 
        name, 
        description: description || '', 
        price: parseFloat(price), 
        category_id: parseInt(category_id), 
        is_available: is_available !== undefined ? is_available : true,
        image_url: image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Menu item created successfully', item: data[0] });
  } catch (err) {
    console.error('Error creating menu item:', err.message);
    res.status(500).json({ error: 'Failed to create menu item', details: err.message });
  }
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, is_available, image_url } = req.body;

    const updates = { updated_at: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (category_id !== undefined) updates.category_id = parseInt(category_id);
    if (is_available !== undefined) updates.is_available = is_available;
    if (image_url !== undefined) updates.image_url = image_url;

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated successfully', item: data[0] });
  } catch (err) {
    console.error('Error updating menu item:', err.message);
    res.status(500).json({ error: 'Failed to update menu item', details: err.message });
  }
});

// DELETE /api/menu/:id - Delete a menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully', deletedId: id });
  } catch (err) {
    console.error('Error deleting menu item:', err.message);
    res.status(500).json({ error: 'Failed to delete menu item', details: err.message });
  }
});

// -------------------------------------------------------------------
// ORDERS ENDPOINTS
// -------------------------------------------------------------------

// POST /api/orders - Place a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, items, total_amount } = req.body;

    if (!customer_name || !customer_phone || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    // Insert order record
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_phone,
        total_amount: parseFloat(total_amount),
        status: 'Pending'
      }])
      .select();

    if (orderError) throw orderError;
    const orderId = orderData[0].id;

    // Prepare order items
    const orderItemsToInsert = items.map(item => ({
      order_id: orderId,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: parseFloat(item.price)
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: orderId,
      order: orderData[0]
    });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

// GET /api/orders - Fetch all orders (Admin view)
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(name))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'Order status updated', order: data[0] });
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Smart Canteen Menu Backend Server listening on http://localhost:${PORT}`);
});