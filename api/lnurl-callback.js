import axios from 'axios';

export default async (req, res) => {
  const { amount } = req.query;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ status: 'ERROR', reason: 'Valid amount required' });
  }

  try {
    const lndUrl = `${process.env.DOMAIN}/v1/invoices`;
    const macaroon = process.env.MACAROON;

    const response = await axios.post(
      lndUrl,
      {
        value_msat: amount, // Amount in millisatoshis
        memo: 'Payment to sepiropht@sepiropht.me',
      },
      {
        headers: {
          'Grpc-Metadata-macaroon': macaroon,
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      }
    );

    return res.status(200).json({
      pr: response.data.payment_request,
      routes: [],
    });
  } catch (error) {
    console.error('Error in LNURL callback:', error.message);
    return res.status(500).json({ status: 'ERROR', reason: 'Failed to create invoice' });
  }
}
