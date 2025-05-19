
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { Separator } from "@/components/ui/separator";
import ReportGenerationService from "../services/ReportGenerationService";

interface PlacedFigure {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  category: string;
}

interface AnalysisResult {
  categoryDistribution: { name: string; count: number; percentage: number }[];
  placementPatterns: { name: string; description: string; score: number }[];
  quadrantAnalysis: { name: string; description: string; figureCount: number }[];
  totalFigures: number;
  overallAnalysis: string;
  detailedAnalysis?: string;
}

const ResultsPage = () => {
  const [figures, setFigures] = useState<PlacedFigure[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isGeneratingLLMAnalysis, setIsGeneratingLLMAnalysis] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load saved figures from sessionStorage
    const savedFigures = sessionStorage.getItem("sandTrayFigures");
    if (!savedFigures) {
      toast({
        variant: "destructive",
        title: "没有找到沙盘数据",
        description: "请先完成沙盘摆放",
      });
      navigate("/sand-tray");
      return;
    }
    
    const figures = JSON.parse(savedFigures);
    setFigures(figures);

    // Simulate analysis processing
    setLoading(true);
    setTimeout(() => {
      const analysisResult = analyzeResults(figures);
      setAnalysis(analysisResult);
      setLoading(false);

      // Save analysis to session storage for report page
      sessionStorage.setItem("sandTrayAnalysis", JSON.stringify(analysisResult));
    }, 1500);
  }, [navigate, toast]);

  // Fake analysis function - in a real app, this would be much more sophisticated
  const analyzeResults = (figures: PlacedFigure[]): AnalysisResult => {
    const totalFigures = figures.length;
    
    // Category distribution
    const categories = [
      { id: "nature", name: "自然类" },
      { id: "animal", name: "动物类" },
      { id: "human", name: "人物类" },
      { id: "building", name: "建筑类" }
    ];
    
    const categoryDistribution = categories.map(category => {
      const count = figures.filter(fig => fig.category === category.id).length;
      const percentage = (count / totalFigures) * 100;
      return {
        name: category.name,
        count,
        percentage
      };
    }).filter(cat => cat.count > 0);

    // Quadrant analysis
    const quadrantFigures = {
      "左上": figures.filter(fig => fig.x <= 50 && fig.y <= 50).length,
      "右上": figures.filter(fig => fig.x > 50 && fig.y <= 50).length,
      "左下": figures.filter(fig => fig.x <= 50 && fig.y > 50).length,
      "右下": figures.filter(fig => fig.x > 50 && fig.y > 50).length
    };
    
    const quadrantAnalysis = [
      { 
        name: "左上象限", 
        description: "代表过去或回忆", 
        figureCount: quadrantFigures["左上"] 
      },
      { 
        name: "右上象限", 
        description: "代表未来或期待", 
        figureCount: quadrantFigures["右上"] 
      },
      { 
        name: "左下象限", 
        description: "代表潜意识或隐藏情感", 
        figureCount: quadrantFigures["左下"]
      },
      { 
        name: "右下象限", 
        description: "代表社交或外部关系", 
        figureCount: quadrantFigures["右下"] 
      }
    ];

    // Placement patterns
    const centerX = figures.reduce((sum, fig) => sum + fig.x, 0) / totalFigures;
    const centerY = figures.reduce((sum, fig) => sum + fig.y, 0) / totalFigures;
    
    const dispersion = figures.reduce((sum, fig) => {
      const dx = fig.x - centerX;
      const dy = fig.y - centerY;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0) / totalFigures;
    
    const humanCount = figures.filter(fig => fig.category === "human").length;
    const humanRatio = humanCount / totalFigures;
    
    const naturalCount = figures.filter(fig => fig.category === "nature").length;
    const naturalRatio = naturalCount / totalFigures;

    const placementPatterns = [
      { 
        name: "集中趋势", 
        description: "沙具摆放的集中或分散程度", 
        score: 100 - Math.min(dispersion * 3, 100) 
      },
      { 
        name: "人物关联", 
        description: "通过人物沙具表达的关系强度", 
        score: humanRatio * 100 
      },
      { 
        name: "自然关联", 
        description: "通过自然元素表达的情感状态", 
        score: naturalRatio * 100 
      }
    ];

    // Generate overall analysis
    let overallAnalysis = "";
    const dominantQuadrant = quadrantAnalysis.reduce((prev, current) => 
      (current.figureCount > prev.figureCount) ? current : prev, quadrantAnalysis[0]);
      
    const dominantCategory = categoryDistribution.reduce((prev, current) => 
      (current.count > prev.count) ? current : prev, categoryDistribution[0]);

    if (dispersion < 20) {
      overallAnalysis = `沙具摆放较为集中，可能表示当前聚焦于特定问题或情境。主要集中在${dominantQuadrant.name}区域，与${dominantQuadrant.description}有关。`;
    } else {
      overallAnalysis = `沙具摆放较为分散，可能表示思维开放或面临多种情境。特别关注了${dominantCategory.name}元素，占比${dominantCategory.percentage.toFixed(1)}%。`;
    }

    if (humanRatio > 0.3) {
      overallAnalysis += " 人物沙具比例较高，表明社交关系或人际互动在当前有重要意义。";
    } else if (naturalRatio > 0.3) {
      overallAnalysis += " 自然元素沙具比例较高，可能表示对环境、成长或变化有特别关注。";
    }

    return {
      categoryDistribution,
      placementPatterns,
      quadrantAnalysis,
      totalFigures,
      overallAnalysis
    };
  };

  const handleGenerateLLMAnalysis = async () => {
    if (!apiKey && !analysis) return;
    
    setIsGeneratingLLMAnalysis(true);
    
    try {
      // Set API key for the service
      ReportGenerationService.setApiKey(apiKey);
      
      // Generate detailed analysis using LLM
      const detailedAnalysis = await ReportGenerationService.generateReport({
        figures,
        quadrantAnalysis: analysis!.quadrantAnalysis,
        categoryDistribution: analysis!.categoryDistribution
      });
      
      // Update analysis with LLM results
      const updatedAnalysis = {
        ...analysis!,
        detailedAnalysis
      };
      
      setAnalysis(updatedAnalysis);
      
      // Update in session storage
      sessionStorage.setItem("sandTrayAnalysis", JSON.stringify(updatedAnalysis));
      
      toast.success("大模型分析已完成");
    } catch (error) {
      console.error("Error generating LLM analysis:", error);
      toast.error("生成分析失败，请检查API密钥或网络连接");
    } finally {
      setIsGeneratingLLMAnalysis(false);
    }
  };

  const handleViewReport = () => {
    navigate("/report");
  };

  const handleBackToSandTray = () => {
    navigate("/sand-tray");
  };

  return (
    <Layout title="结果识别" currentStep={3}>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">分析中...</h3>
              <Progress value={75} className="w-1/2 mx-auto" />
              <p className="text-gray-500">正在分析沙盘摆放结果，请稍候</p>
            </div>
          </Card>
        ) : analysis ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">总体分析</h3>
                <p className="text-gray-700">{analysis.overallAnalysis}</p>
                
                <div className="mt-4 p-3 bg-therapy-neutral-light rounded-md text-sm">
                  <p className="font-medium">共摆放了 {analysis.totalFigures} 个沙具，涵盖 {analysis.categoryDistribution.length} 种类别</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">类别分布</h3>
                  <div className="space-y-4">
                    {analysis.categoryDistribution.map((category) => (
                      <div key={category.name}>
                        <div className="flex justify-between mb-1">
                          <span>{category.name}</span>
                          <span>{category.count} ({category.percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={category.percentage} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">象限分析</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {analysis.quadrantAnalysis.map((quadrant) => (
                      <div key={quadrant.name} className="border rounded p-3">
                        <h4 className="font-medium">{quadrant.name} ({quadrant.figureCount})</h4>
                        <p className="text-sm text-gray-500">{quadrant.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">摆放模式分析</h3>
                <div className="space-y-4">
                  {analysis.placementPatterns.map((pattern) => (
                    <div key={pattern.name}>
                      <div className="flex justify-between mb-1">
                        <span>{pattern.name}</span>
                        <span>{pattern.score.toFixed(1)}%</span>
                      </div>
                      <Progress value={pattern.score} />
                      <p className="text-sm text-gray-500 mt-1">{pattern.description}</p>
                      <Separator className="my-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* LLM Analysis Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">大模型详细分析</h3>
                {analysis.detailedAnalysis ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="text-gray-700 whitespace-pre-line">
                      {analysis.detailedAnalysis}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-500">使用AI大模型获取更详细的沙盘分析报告</p>
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium mb-1">大模型API密钥</label>
                        <Input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="输入OpenAI API密钥"
                        />
                      </div>
                      <Button 
                        onClick={handleGenerateLLMAnalysis} 
                        disabled={!apiKey || isGeneratingLLMAnalysis}
                      >
                        {isGeneratingLLMAnalysis ? "生成中..." : "生成分析"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      API密钥仅在本地使用，不会被保存或发送到服务器
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBackToSandTray}>
                返回编辑
              </Button>
              <Button onClick={handleViewReport}>
                生成报告
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>没有数据可显示</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={handleBackToSandTray}
            >
              开始沙盘摆放
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResultsPage;
