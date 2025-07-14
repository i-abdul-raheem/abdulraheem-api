const {app} = require('../server');

app.get('/', (req, res) => {
  res.send('Hello World');
});

module.exports = app;