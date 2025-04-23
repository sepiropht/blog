import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false,
});

export default async (req, res) => {
  // Log the domain being used
  console.log(`LNURL Callback - Domain: ${process.env.DOMAIN}`);

  // Set CORS Headers - Crucial for wallets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Proceed only for GET requests after handling OPTIONS
  if (req.method !== 'GET') {
    // Send generic error for non-GET, non-OPTIONS methods
     return res.status(405).json({ status: 'ERROR', reason: 'Method Not Allowed' });
  }

  const { amount } = req.query;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ status: 'ERROR', reason: 'Valid amount required' });
  }

  try {
    const lndUrlString = `${process.env.DOMAIN}/v1/invoices`;
    const macaroon = process.env.MACAROON;
    const postData = JSON.stringify({
      value_msat: amount,
      memo: 'Payment via LNURL',
    });

    const response = await fetch(lndUrlString, {
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': macaroon,
        'Content-Type': 'application/json',
      },
      body: postData,
      agent: agent,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`LND API Error (${response.status}):`, responseData);
       const reason = responseData?.error || responseData?.message || 'Failed to create invoice';
      // Ensure LNURL error structure is returned
      return res.status(response.status).json({ status: 'ERROR', reason: reason });
    }

    // Return LNURL success structure
    return res.status(200).json({
      pr: responseData.payment_request,
      routes: [], // routes is typically empty
    });

  } catch (error) {
    console.error('Error in LNURL callback:', error.message);
    const reason = error instanceof TypeError ? 'Network error or failed to fetch' : 'Internal server error';
    // Ensure LNURL error structure is returned
    return res.status(500).json({ status: 'ERROR', reason: reason });
  }
};
