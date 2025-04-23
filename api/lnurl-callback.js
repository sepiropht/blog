export default async (req, res) => {
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
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`LND API Error (${response.status}):`, responseData);
       const reason = responseData?.error || responseData?.message || 'Failed to create invoice';
      return res.status(response.status).json({ status: 'ERROR', reason: reason });
    }

    return res.status(200).json({
      pr: responseData.payment_request,
      routes: [],
    });

  } catch (error) {
    console.error('Error in LNURL callback:', error.message);
    const reason = error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.code === 'CERT_HAS_EXPIRED' || error instanceof TypeError
      ? 'Network error or TLS certificate issue'
      : 'Internal server error';
    return res.status(500).json({ status: 'ERROR', reason: reason });
  }
};
