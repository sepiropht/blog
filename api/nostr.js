export default (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // or specify a domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // No content for preflight
    return;
  }

  // Set the response status and content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  
  // Respond with JSON data
  res.json({
    names: {
      sepiropht:
        '8fac8f40655ed30f55e647f82c18b4a029e4ffd06d66ebde1f8c24e03065fad1',
      _: '8fac8f40655ed30f55e647f82c18b4a029e4ffd06d66ebde1f8c24e03065fad1',
    },
  });
};
