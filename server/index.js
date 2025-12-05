const express = require('express');
const app = express();

app.use(express.json());

// Test route
app.get('/api/ping', (req, res) => {
  res.json({ message: "pong" });
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
