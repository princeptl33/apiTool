const express = require('express');
const connectDB = require('./dbConnection');
const Api = require('./apiSchema');
const xlsx = require('xlsx'); 
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(fileUpload());
app.use(cors());

// Connect to MongoDB
connectDB();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/out')));

app.post('/generate-api', async (req, res) => {
  try {
    let jsonData;
    const { endpoint, data } = req.body;

    if (req.files && req.files.file) {
      const file = req.files.file;
      const workbook = xlsx.read(file.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      const headers = rows[0];
      jsonData = rows.slice(1).map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        return rowData;
      });
    } else {
      jsonData = data;
    }

    const api = new Api({ endpoint, data: jsonData });
    await api.save();
    res.json({ message: `API for endpoint '${endpoint}' generated successfully` });
  } catch (error) {
    console.error('Failed to generate API:', error);
    res.status(500).json({ error: 'Failed to generate API' });
  }
});

app.get('/apis', async (req, res) => {
  try {
    const apis = await Api.find();
    const apiUrls = apis.map(api => ({
      endpoint: api.endpoint,
      url: `${req.protocol}://${req.get('host')}/${api.endpoint}`
    }));
    res.json({ apis: apiUrls });
  } catch (error) {
    console.error('Failed to retrieve APIs:', error);
    res.status(500).json({ error: 'Failed to retrieve APIs' });
  }
});

app.get('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  try {
    const apiData = await Api.findOne({ endpoint });
    if (!apiData) {
      return res.status(404).json({ error: 'API not found' });
    }
    res.json(apiData.data);
  } catch (error) {
    console.error('Failed to retrieve API data:', error);
    res.status(500).json({ error: 'Failed to retrieve API data' });
  }
});

app.delete('/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  try {
    const apiData = await Api.findOneAndDelete({ endpoint });
    if (!apiData) {
      return res.status(404).json({ error: 'API not found' });
    }
    res.json({ message: `API for endpoint '${endpoint}' deleted successfully` });
  } catch (error) {
    console.error('Failed to delete API:', error);
    res.status(500).json({ error: 'Failed to delete API' });
  }
});

// Catch-all handler to serve React's index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/out', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
