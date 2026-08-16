async function testScanApi() {
  console.log('Initiating scan on http://localhost:3001/api/scans ...');
  const res = await fetch('http://localhost:3001/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' })
  });

  const data = await res.json();
  console.log('Scan initiated:', data);

  const scanId = data.scanId;
  let attempts = 0;
  while (attempts < 60) {
    attempts++;
    await new Promise(r => setTimeout(r, 1000));
    const statusRes = await fetch(`http://localhost:3001/api/scans/${scanId}`);
    const statusData = await statusRes.json();
    console.log(`[Attempt ${attempts}] Status:`, statusData.status, 'Stage:', statusData.stage, 'Progress:', statusData.progress);
    if (statusData.status === 'completed') {
      console.log('Scan completed successfully!');
      const resultsRes = await fetch(`http://localhost:3001/api/scans/${scanId}/results`);
      const resultsData = await resultsRes.json();
      console.log('Overall score:', resultsData.overall.score);
      break;
    }
    if (statusData.status === 'failed') {
      console.error('Scan failed:', statusData);
      break;
    }
  }
}

testScanApi().catch(console.error);
