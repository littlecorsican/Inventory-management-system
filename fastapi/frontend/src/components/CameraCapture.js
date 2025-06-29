import React, { useRef, useEffect, useState } from "react";

export default function CameraCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);

  // Start the camera on component mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
  }, []);

  // Capture image from video
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setImageDataUrl(dataUrl);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline width="320" height="240" />
      <br />
      <button onClick={captureImage}>Take Picture</button>
      <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />
      {imageDataUrl && (
        <div>
          <h4>Captured Image:</h4>
          <img src={imageDataUrl} alt="Snapshot" />
        </div>
      )}
    </div>
  );
}
