export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, memo } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount required' });
  }

  try {
    const lndUrlString = `${process.env.DOMAIN}/v1/invoices`;
    const macaroon = process.env.MACAROON;
    const postData = JSON.stringify({
      value: amount, // Amount in satoshis
      memo: memo || 'Payment to sepiropht@sepiropht.me', // Optional description
    });

    const response = await fetch(lndUrlString, {
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': macaroon,
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`LND API Error (${response.status}):`, responseData);
      const errorMessage = responseData?.error || responseData?.message || 'Failed to create invoice';
      return res.status(response.status).json({ error: errorMessage });
    }

    const { payment_request, r_hash } = responseData; // LND returns r_hash, often base64 encoded
    // The payment_hash used in check-payment is usually the hex representation of r_hash.
    // LND API for invoices provides r_hash (base64). We need to convert it to hex for consistency if needed elsewhere.
    // However, the client might just need the invoice string. Let's return r_hash as is for now.
    // If hex is needed: Buffer.from(r_hash, 'base64').toString('hex')

    return res.status(200).json({
      invoice: payment_request,
      // Returning the raw r_hash as provided by the API response
      // If the hex payment hash is needed by the client, it should be derived from r_hash
      paymentHash: Buffer.from(r_hash, 'base64').toString('hex'), // Provide the hex payment hash directly
      // r_hash_base64: r_hash // Optionally return the base64 version too
    });

  } catch (error) {
    console.error('Error creating invoice:', error.message);
    const errorMessage = error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.code === 'CERT_HAS_EXPIRED' || error instanceof TypeError
      ? 'Network error or TLS certificate issue'
      : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
};
