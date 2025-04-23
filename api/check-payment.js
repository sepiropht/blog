import https from 'https';

// Re-add agent creation
const agent = new https.Agent({
  rejectUnauthorized: false, // Bypass TLS verification
});

export default async (req, res) => {
  // Log the domain being used
  console.log(`Check Payment - Domain: ${process.env.DOMAIN}`);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentHash } = req.query;

  if (!paymentHash) {
    return res.status(400).json({ error: 'Payment hash required' });
  }

  try {
    const lndUrlString = `${process.env.DOMAIN}/v1/invoice/${paymentHash}`;
    const macaroon = process.env.MACAROON;

    const response = await fetch(lndUrlString, {
      method: 'GET',
      headers: {
        'Grpc-Metadata-macaroon': macaroon,
      },
      agent: agent, // Add agent back to fetch options
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`LND API Error (${response.status}):`, responseData);
      const errorMessage = responseData?.error || responseData?.message || 'Failed to check payment';
      return res.status(response.status).json({ error: errorMessage });
    }

    const { settled } = responseData;
    return res.status(200).json({
      paid: settled,
      details: responseData,
    });

  } catch (error) {
    console.error('Error checking payment:', error.message);
    // Keep original error message differentiation
    const errorMessage = error instanceof TypeError ? 'Network error or failed to fetch' : 'Internal server error';
     return res.status(500).json({ error: errorMessage });
  }
};
