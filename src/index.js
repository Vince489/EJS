const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts'); // Import express-ejs-layouts

const app = express();
const PORT = 3021; // Change the port if needed

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define the views directory
app.set('views', path.join(__dirname, 'views'));

// Enable express-ejs-layouts
app.use(expressLayouts);

// Set the default layout file
app.set('layout', 'layouts/main'); // Default layout (views/layouts/main.ejs)

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Example route
app.get('/', (req, res) => {
  res.render('index', { title: 'Welcome to EJS with Layouts' }); // Content goes into the layout
});

// Example route for another page
app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

app.get('/links', (req, res) => {
    res.render('links', { title: 'Links Page' });
});

app.get('/bob', (req, res) => {
    res.render('bob', { title: 'Bob Page' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
