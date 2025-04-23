import axios from 'axios';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, memo } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount required' });
  }

  try {
    const lndUrl = `${process.env.DOMAIN}/v1/invoices`;
    const macaroon = process.env.MACAROON;

    const response = await axios.post(
      lndUrl,
      {
        value: amount, // Amount in satoshis
        memo: memo || 'Payment to sepiropht@sepiropht.me', // Optional description
      },
      {
        headers: {
          'Grpc-Metadata-macaroon': macaroon,
        },
        // Disable SSL verification if using self-signed certs (not recommended for production)
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    const { payment_request } = response.data;

    return res.status(200).json({
      invoice: payment_request,
      paymentHash: response.data.payment_hash,
    });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
}
