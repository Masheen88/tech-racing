export const compressAudio = async (audioFile) => {
  return new Promise((resolve, reject) => {
    console.log("Compressing audio...", audioFile);
    const workerUrl = new URL("./ffmpegWorker.js", import.meta.url);
    console.log("Worker URL:", workerUrl);
    const worker = new Worker(workerUrl, { type: "module" }); // Add type: 'module'
    console.log("Worker created", worker);
    worker.postMessage({ audioFile });

    worker.onmessage = (event) => {
      console.log("Worker message received:", event.data);
      const { compressedUrl, error } = event.data;
      console.log("Compressed URL:", compressedUrl);
      if (error) {
        console.error("Error received from worker:", error);
        reject(new Error(error));
      } else {
        resolve(compressedUrl);
      }
    };

    worker.onerror = (error) => {
      console.error("Worker error:", error);
      reject(error);
    };
  });
};

export default compressAudio;
