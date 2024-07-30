import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

self.onmessage = async (event) => {
  console.log("Worker received message:", event.data);
  const { audioFile } = event.data;

  const ffmpeg = new FFmpeg();
  const baseURL =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm";

  try {
    console.log("Loading FFmpeg...");
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });

    console.log("FFmpeg loaded");

    // Convert File to Uint8Array to write to FFmpeg filesystem
    console.log("Converting File to Uint8Array...");
    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log("Writing file to FFmpeg filesystem...");
    await ffmpeg.writeFile("input.mp3", uint8Array);

    console.log("Executing FFmpeg command...");
    await ffmpeg.exec(["-i", "input.mp3", "-b:a", "128k", "output.mp3"]);

    console.log("Reading output file from FFmpeg filesystem...");
    const data = await ffmpeg.readFile("output.mp3", "binary");

    const compressedBlob = new Blob([data.buffer], { type: "audio/mp3" });
    const compressedUrl = URL.createObjectURL(compressedBlob);

    console.log("Compression successful, sending URL back");
    self.postMessage({ compressedUrl });
  } catch (error) {
    console.error("Error in worker:", error);
    self.postMessage({ error: error.message });
  }
};
