// Einfache Retry-Funktion (für den Anfang)
export async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error; // Letzter Versuch fehlgeschlagen
      }
      
      console.log(`Retry ${attempt}/${maxRetries} after error:`, error.message);
      
      // Einfacher Backoff: warte länger bei jedem Retry
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * attempt)
      );
    }
  }
}
 