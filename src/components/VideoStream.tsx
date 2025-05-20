
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChatEcnuService from "../services/ChatEcnuService";
import { figureCategories } from "../data/figureData";

interface VideoStreamProps {
  onCapture?: (imageData: string) => void;
}

const VideoStream = ({ onCapture }: VideoStreamProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  // Set the default API key
  useEffect(() => {
    // Using the default API key provided
    ChatEcnuService.setApiKey("sk-f178bb48f976477b9002a1bc817a9544");
  }, []);

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
        description: "Camera access error"
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
        
        toast("已捕获图像，准备进行分析");
        
        // Automatically analyze the image
        analyzeImage(imageData);
      }
    }
  };
  
  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Generate mock data for analysis
      const mockFigures = generateMockFiguresFromImage();
      
      // Generate quadrant analysis
      const quadrantAnalysis = [
        { name: "左上象限", description: "代表过去或回忆", figureCount: mockFigures.filter(f => f.x <= 50 && f.y <= 50).length },
        { name: "右上象限", description: "代表未来或期待", figureCount: mockFigures.filter(f => f.x > 50 && f.y <= 50).length },
        { name: "左下象限", description: "代表潜意识或隐藏情感", figureCount: mockFigures.filter(f => f.x <= 50 && f.y > 50).length },
        { name: "右下象限", description: "代表社交或外部关系", figureCount: mockFigures.filter(f => f.x > 50 && f.y > 50).length }
      ];
      
      // Generate category distribution
      const categoryCounter: Record<string, number> = {};
      mockFigures.forEach(figure => {
        if (categoryCounter[figure.category]) {
          categoryCounter[figure.category]++;
        } else {
          categoryCounter[figure.category] = 1;
        }
      });
      
      const categoryDistribution = Object.entries(categoryCounter).map(([categoryId, count]) => {
        const categoryName = figureCategories.find(cat => cat.id === categoryId)?.name || categoryId;
        const percentage = (count / mockFigures.length) * 100;
        return { name: categoryName, count, percentage };
      });

      // Generate analysis using ChatECNU
      console.log("Starting ChatECNU analysis...");
      const result = await ChatEcnuService.generateSandTrayReport({
        figures: mockFigures,
        quadrantAnalysis,
        categoryDistribution
      });
      
      console.log("ChatECNU analysis complete:", result.substring(0, 100) + "...");
      setAnalysisResult(result);
      toast("分析完成");
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast("分析失败，请重试", {
        description: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Generate mock figures data based on the captured image
  const generateMockFiguresFromImage = () => {
    // This would normally use actual image recognition, but we'll create mock data
    const mockFigures = [];
    const categories = ["nature", "animal", "human", "building"];
    
    // Generate between 5-10 random figures
    const figureCount = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < figureCount; i++) {
      // Pick a random category
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const category = categories[categoryIndex];
      
      // Pick a random figure from that category
      const categoryData = figureCategories.find(cat => cat.id === category);
      if (!categoryData) continue;
      
      const figureIndex = Math.floor(Math.random() * categoryData.figures.length);
      const figure = categoryData.figures[figureIndex];
      
      // Generate random position
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      
      mockFigures.push({
        id: figure.id,
        name: figure.name,
        emoji: figure.emoji,
        x,
        y,
        category
      });
    }
    
    return mockFigures;
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
            <Button onClick={captureImage} disabled={isAnalyzing}>
              {isAnalyzing ? "分析中..." : "捕获并分析"}
            </Button>
            <Button onClick={stopStream} variant="outline">
              停止摄像头
            </Button>
          </>
        )}
      </div>
      
      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-bold mb-2">分析结果</h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStream;
