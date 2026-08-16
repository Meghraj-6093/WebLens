document.addEventListener('DOMContentLoaded', async () => {
  const urlBox = document.getElementById('url-box');
  const analyzeBtn = document.getElementById('analyze-btn');
  let currentUrl = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
      currentUrl = tab.url;
      urlBox.textContent = currentUrl;
      analyzeBtn.disabled = false;
    } else {
      urlBox.textContent = 'Cannot scan non-HTTP(S) internal page.';
      analyzeBtn.disabled = true;
    }
  } catch (err) {
    urlBox.textContent = 'Failed to get active tab.';
    analyzeBtn.disabled = true;
  }

  analyzeBtn.addEventListener('click', async () => {
    if (!currentUrl) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Starting scan...';

    try {
      const apiUrl = 'http://localhost:3001/api/scans';
      const webUrl = 'http://localhost:5173';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl })
      });

      const data = await response.json();
      if (data && data.scanId) {
        // Open scan progress in new tab
        chrome.tabs.create({ url: `${webUrl}/scan/${data.scanId}` });
        window.close();
      } else {
        analyzeBtn.textContent = 'Scan failed';
      }
    } catch (err) {
      // Fallback: open WebLens home with URL query
      const webUrl = 'http://localhost:5173';
      chrome.tabs.create({ url: `${webUrl}/?url=${encodeURIComponent(currentUrl)}` });
      window.close();
    }
  });
});
