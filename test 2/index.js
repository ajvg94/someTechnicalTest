const pooledDownload = async (connect, save, downloadList, maxConcurrency) => {
  // check input parameters
  if (typeof connect !== 'function' || typeof save !== 'function' || !Array.isArray(downloadList) || typeof maxConcurrency !== 'number') {
    throw new Error('Invalid parameters');
  }

  // Helper function to download files
  const downloadFile = async (connection, url) => {
    try {
      const fileContents = await connection.download(url);
      await save(fileContents);
    } catch (error) {
      throw error;
    } finally {
      connection.close();
    }
  };

  const downloads = [];

  // Iterate over the downloadList
  for (const url of downloadList) {
    if (downloads.length >= maxConcurrency) {
      // Wait for any of the ongoing downloads to complete
      await Promise.race(downloads);
      // Remove completed downloads from the array
      downloads.splice(downloads.findIndex((p) => p.isResolved || p.isRejected), 1);
    }

    // Open a new connection
    const connection = await connect();

    // Start downloading the file and add the promise to the downloads array
    const downloadPromise = downloadFile(connection, url);
    downloads.push(downloadPromise);
  }

  await Promise.all(downloads);
}

module.exports = pooledDownload
