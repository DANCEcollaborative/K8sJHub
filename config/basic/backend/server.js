const express = require('express');
const app = express();
const port = 3000;

app.get('/chat', (req, res) => {
  const username = process.env.JUPYTERHUB_USER || 'Chas';
  const { roomName = 'regex', roomId = '500' } = req.query;
  const url = `https://bazaar.lti.cs.cmu.edu/bazaar/login?roomName=${roomName}&roomId=${roomId}&id=1&username=${username}&html=chat_mm`;
  res.redirect(url);
});

app.listen(port, () => {
  console.log(`Chat proxy listening at http://localhost:${port}`);
});
