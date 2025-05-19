
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoStreamProps {
  onCapture?: (imageData: string) => void;
}

const VideoStream = ({ onCapture }: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast("无法访问摄像头，请检查权限设置", {
        description: "Camera access error",
        variant: "destructive"
      });
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data as base64 string
        const imageData = canvas.toDataURL("image/jpeg");
        
        // Call onCapture callback with the image data
        if (onCapture) {
          onCapture(imageData);
        }
        
        toast("已捕获图像，准备进行分析", {
          description: "Image captured successfully"
        });
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full aspect-video object-cover rounded-lg"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <p className="text-white bg-black/50 px-4 py-2 rounded">摄像头未启动</p>
          </div>
        )}
      </div>
      
      {/* Hidden canvas used for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="mt-4 flex justify-center space-x-4">
        {!isStreaming ? (
          <Button onClick={startStream}>
            启动摄像头
          </Button>
        ) : (
          <>
            <Button onClick={captureImage} variant="default">
              捕获图像
            </Button>
            <Button onClick={stopStream} variant="outline">
              停止摄像头
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoStream;
