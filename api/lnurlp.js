export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'GET' && req.url === '/.well-known/lnurlp/sepiropht') {
    res.status(200).json(
      res.json({
        status: 'OK',
        tag: 'payRequest',
        commentAllowed: 255,
        callback: 'https://getalby.com/lnurlp/sepiropht/callback',
        metadata:
          '[["text/identifier","sepiropht@getalby.com"],["text/plain","Sats for Sepiropht"]]',
        minSendable: 1000,
        maxSendable: 11000000000,
        payerData: {
          name: { mandatory: false },
          email: { mandatory: false },
          pubkey: { mandatory: false },
        },
        nostrPubkey:
          '79f00d3f5a19ec806189fcab03c1be4ff81d18ee4f653c88fac41fe03570f432',
        allowsNostr: true,
      })
    )
  } else {
    res.status(404).json({ error: 'Not Found' })
  }
}
