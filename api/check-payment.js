// Removed https import and agent creation

export default async (req, res) => {
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
      // Removed agent property - fetch will use default TLS validation
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
    // Certificate validation errors might appear here as TypeError in some Node versions
    const errorMessage = error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.code === 'CERT_HAS_EXPIRED' || error instanceof TypeError
      ? 'Network error or TLS certificate issue'
      : 'Internal server error';
     return res.status(500).json({ error: errorMessage });
  }
};
