import axios from 'axios';

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentHash } = req.query;

  if (!paymentHash) {
    return res.status(400).json({ error: 'Payment hash required' });
  }

  try {
    const lndUrl = `${process.env.DOMAIN}/v1/invoice/${paymentHash}`;
    const macaroon = process.env.MACAROON;

    const response = await axios.get(lndUrl, {
      headers: {
        'Grpc-Metadata-macaroon': macaroon,
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });

    const { settled } = response.data;

    return res.status(200).json({
      paid: settled,
      details: response.data,
    });
  } catch (error) {
    console.error('Error checking payment:', error.message);
    return res.status(500).json({ error: 'Failed to check payment' });
  }
}
