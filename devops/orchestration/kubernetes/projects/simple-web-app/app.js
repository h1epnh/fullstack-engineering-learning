const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Our Kubernetes Demo</h1>
    <p>Pod Name: ${process.env.HOSTNAME}</p>
    <p>App Version: ${process.env.APP_VERSION || '1.0.0'}</p>
  `);
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});