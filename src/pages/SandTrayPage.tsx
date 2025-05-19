
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import Layout from "../components/Layout";
import VideoStream from "../components/VideoStream";
import YoloDetectionService from "../services/YoloDetectionService";

// 我们为简单起见，将沙具图像存储在 public/figures 文件夹中
// 在实际应用中，这些图像应该从后端获取
const figureCategories = [
  {
    id: "nature",
    name: "自然类",
    figures: [
      { id: "tree", name: "树", emoji: "🌲" },
      { id: "mountain", name: "山", emoji: "⛰️" },
      { id: "stone", name: "石头", emoji: "🪨" },
      { id: "flower", name: "花", emoji: "🌸" },
      { id: "river", name: "河流", emoji: "🌊" },
    ]
  },
  {
    id: "animal",
    name: "动物类",
    figures: [
      { id: "dog", name: "狗", emoji: "🐕" },
      { id: "cat", name: "猫", emoji: "🐈" },
      { id: "bird", name: "鸟", emoji: "🐦" },
      { id: "fish", name: "鱼", emoji: "🐠" },
      { id: "tiger", name: "老虎", emoji: "🐅" },
    ]
  },
  {
    id: "human",
    name: "人物类",
    figures: [
      { id: "adult-male", name: "成年男性", emoji: "👨" },
      { id: "adult-female", name: "成年女性", emoji: "👩" },
      { id: "child-boy", name: "男孩", emoji: "👦" },
      { id: "child-girl", name: "女孩", emoji: "👧" },
      { id: "baby", name: "婴儿", emoji: "👶" },
    ]
  },
  {
    id: "building",
    name: "建筑类",
    figures: [
      { id: "house", name: "房子", emoji: "🏠" },
      { id: "bridge", name: "桥", emoji: "🌉" },
      { id: "fence", name: "栅栏", emoji: "🧱" },
      { id: "tower", name: "塔", emoji: "🏛️" },
      { id: "gate", name: "门", emoji: "🚪" },
    ]
  },
];

interface PlacedFigure {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  category: string;
}

const SandTrayPage = () => {
  const [selectedFigure, setSelectedFigure] = useState<any>(null);
  const [placedFigures, setPlacedFigures] = useState<PlacedFigure[]>([]);
  const sandboxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [view, setView] = useState<"manual" | "camera">("manual");
  const [isDetecting, setIsDetecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Handle placing a figure in the sandbox
  const handleSandboxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFigure || isDragging || view === "camera") return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const category = figureCategories.find(cat => 
      cat.figures.some(fig => fig.id === selectedFigure.id)
    )?.id || "";

    setPlacedFigures([
      ...placedFigures,
      {
        ...selectedFigure,
        x,
        y,
        category
      }
    ]);
    
    setSelectedFigure(null);
  };

  // Handle starting drag of a placed figure
  const handleDragStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle moving a dragged figure
  const handleDrag = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (!sandboxRef.current) return;
    
    const rect = sandboxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      const newPlacedFigures = [...placedFigures];
      newPlacedFigures[index] = {
        ...newPlacedFigures[index],
        x,
        y
      };
      setPlacedFigures(newPlacedFigures);
    }
  };

  // Handle ending drag
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle removing a figure
  const handleRemoveFigure = (index: number) => {
    const newPlacedFigures = [...placedFigures];
    newPlacedFigures.splice(index, 1);
    setPlacedFigures(newPlacedFigures);
  };

  // Handle finishing the arrangement
  const handleFinish = () => {
    if (placedFigures.length < 3) {
      toast({
        variant: "destructive",
        title: "沙具数量不足",
        description: "请至少放置3个沙具以完成摆放",
      });
      return;
    }
    
    // Store the placed figures in sessionStorage
    sessionStorage.setItem("sandTrayFigures", JSON.stringify(placedFigures));
    
    toast({
      title: "摆放完成",
      description: "您已成功完成沙盘摆放",
    });
    
    navigate("/results");
  };

  // Load any saved figures from sessionStorage
  useEffect(() => {
    const savedFigures = sessionStorage.getItem("sandTrayFigures");
    if (savedFigures) {
      setPlacedFigures(JSON.parse(savedFigures));
    }
    
    // Preload the YOLO detection model
    YoloDetectionService.loadModel().catch(error => {
      console.error("Failed to preload YOLO model:", error);
    });
  }, []);
  
  // Handle image capture from video stream
  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    detectObjects(imageData);
  };

  // Detect objects in captured image using YOLO model
  const detectObjects = async (imageData: string) => {
    setIsDetecting(true);
    
    try {
      toast.info("正在识别沙具...", { duration: 2000 });
      
      const detectedObjects = await YoloDetectionService.detectObjects(imageData);
      
      if (detectedObjects.length === 0) {
        toast.warning("未检测到沙具，请尝试调整摄像头或光线");
        return;
      }
      
      // Convert detected objects to placed figures
      const newFigures: PlacedFigure[] = detectedObjects.map(obj => {
        // Find matching figure in our categories
        let emoji = "❓";
        let categoryId = obj.category;
        
        const category = figureCategories.find(cat => cat.id === obj.category);
        if (category) {
          const figure = category.figures.find(fig => fig.id === obj.name);
          if (figure) {
            emoji = figure.emoji;
          }
        }
        
        return {
          id: obj.id,
          name: obj.name,
          emoji: emoji,
          x: obj.bbox.x + obj.bbox.width/2,
          y: obj.bbox.y + obj.bbox.height/2,
          category: categoryId
        };
      });
      
      setPlacedFigures(newFigures);
      
      toast.success(`成功识别 ${newFigures.length} 个沙具`);
    } catch (error) {
      console.error("Error detecting objects:", error);
      toast.error("沙具识别失败，请重试");
    } finally {
      setIsDetecting(false);
    }
  };
  
  // Extract statistics for the sidebar
  const figureStats = figureCategories.map(category => {
    const count = placedFigures.filter(fig => fig.category === category.id).length;
    return {
      name: category.name,
      count
    };
  });
  
  const totalFigures = placedFigures.length;

  return (
    <Layout title="沙具摆放" currentStep={2}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <div className="md:col-span-3">
          <div className="bg-white p-4 rounded-lg shadow">
            <Tabs value={view} onValueChange={(v) => setView(v as "manual" | "camera")} className="w-full mb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="manual">手动摆放</TabsTrigger>
                <TabsTrigger value="camera">摄像头识别</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {view === "manual" ? (
              <div 
                ref={sandboxRef}
                className="relative w-full aspect-[4/3] border-4 border-sand-dark bg-sand-light rounded overflow-hidden cursor-pointer"
                onClick={handleSandboxClick}
              >
                {/* Placed Figures */}
                {placedFigures.map((figure, index) => (
                  <div
                    key={`${figure.id}-${index}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none"
                    style={{ 
                      left: `${figure.x}%`, 
                      top: `${figure.y}%`,
                      fontSize: '32px'
                    }}
                    onMouseDown={(e) => handleDragStart(e, index)}
                    onMouseMove={(e) => isDragging && handleDrag(e, index)}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={() => handleRemoveFigure(index)}
                  >
                    <div className="relative group">
                      <span className="block">{figure.emoji}</span>
                      <span className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                        {figure.name}（双击移除）
                      </span>
                    </div>
                  </div>
                ))}
                {placedFigures.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p>从右侧选择沙具并点击此处放置</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                <VideoStream onCapture={handleImageCapture} />
                {capturedImage && (
                  <div className="mt-4">
                    <div className="relative w-full aspect-[4/3] border-4 border-sand-dark bg-sand-light rounded overflow-hidden">
                      <img 
                        src={capturedImage} 
                        alt="Captured Sand Tray" 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay detected objects */}
                      {placedFigures.map((figure, index) => (
                        <div
                          key={`${figure.id}-${index}`}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ 
                            left: `${figure.x}%`, 
                            top: `${figure.y}%`,
                            fontSize: '32px'
                          }}
                        >
                          <div className="relative">
                            <span className="block">{figure.emoji}</span>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {figure.name}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {isDetecting && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <p className="text-lg font-medium mb-2">正在识别沙具...</p>
                            <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin mx-auto"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                已放置 {totalFigures} 个沙具 | {view === "manual" ? "双击沙具可移除" : "使用摄像头自动识别"}
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (confirm("确定要清空所有沙具吗？")) {
                      setPlacedFigures([]);
                      setCapturedImage(null);
                    }
                  }}
                >
                  清空
                </Button>
                <Button onClick={handleFinish}>
                  完成摆放
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full">
            <Tabs defaultValue="nature" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-2">
                <TabsTrigger value="figures" disabled={view === "camera"}>沙具选择</TabsTrigger>
                <TabsTrigger value="stats">统计信息</TabsTrigger>
              </TabsList>
              <TabsContent value="figures" className="h-[500px] overflow-auto">
                <Tabs defaultValue="nature" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full mb-2">
                    {figureCategories.map(category => (
                      <TabsTrigger key={category.id} value={category.id}>
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {figureCategories.map(category => (
                    <TabsContent key={category.id} value={category.id}>
                      <div className="grid grid-cols-2 gap-2">
                        {category.figures.map(figure => (
                          <Button
                            key={figure.id}
                            variant={selectedFigure?.id === figure.id ? "default" : "outline"}
                            onClick={() => setSelectedFigure(figure)}
                            className="h-16 flex flex-col items-center justify-center"
                            disabled={view === "camera"}
                          >
                            <span className="text-xl mb-1">{figure.emoji}</span>
                            <span className="text-xs">{figure.name}</span>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
              
              <TabsContent value="stats" className="h-[500px] overflow-auto">
                <div className="space-y-4 p-2">
                  <h3 className="font-medium text-lg">类别统计</h3>
                  {figureStats.map(stat => (
                    <div key={stat.name} className="flex justify-between items-center">
                      <span>{stat.name}</span>
                      <span className="font-semibold">{stat.count}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span>总计</span>
                      <span>{totalFigures}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SandTrayPage;
