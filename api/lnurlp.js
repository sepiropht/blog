export default (_, res) => {
  console.log('YESSSSSSS')
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({
    status: 'OK',
    tag: 'payRequest',
    commentAllowed: 255,
    callback: `https://elimbi.com/api/lnurl-callback`,
    metadata:
      '[["text/plain","Sats for Sepiropht"]]',
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
}
