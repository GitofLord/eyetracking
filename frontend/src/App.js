import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, 
  BrainCircuit, 
  BarChart3, 
  History, 
  Eye, 
  AlertTriangle, 
  CheckCircle2,
  ArrowLeftRight,
  Trash2,
  X,
  Zap,
  Activity,
  Target,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// SanoScore Gauge Component
const SanoGauge = ({ score, tier, isAnimating }) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    if (isAnimating) {
      setDisplayScore(0);
      const duration = 2000;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.round(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, isAnimating]);

  const getScoreColor = () => {
    if (score <= 40) return "#EF4444";
    if (score <= 60) return "#EAB308";
    if (score <= 80) return "#10B981";
    return "#10B981";
  };

  const rotation = (displayScore / 100) * 180 - 90;

  return (
    <div className="relative w-64 h-36 mx-auto">
      {/* Gauge background */}
      <svg viewBox="0 0 200 100" className="w-full h-full">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="33%" stopColor="#EAB308" />
            <stop offset="66%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        
        {/* Background arc */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="#1E293B"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Colored arc */}
        <path
          d="M 20 90 A 80 80 0 0 1 180 90"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(displayScore / 100) * 251.2} 251.2`}
        />
        
        {/* Needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ transformOrigin: "100px 90px" }}
        >
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="25"
            stroke={getScoreColor()}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="90" r="8" fill={getScoreColor()} />
        </motion.g>
        
        {/* Score labels */}
        <text x="20" y="98" fill="#64748B" fontSize="10" textAnchor="middle">0</text>
        <text x="100" y="15" fill="#64748B" fontSize="10" textAnchor="middle">50</text>
        <text x="180" y="98" fill="#64748B" fontSize="10" textAnchor="middle">100</text>
      </svg>
      
      {/* Score display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <motion.div 
          className="text-4xl font-bold font-mono"
          style={{ color: getScoreColor() }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          {displayScore}
        </motion.div>
        <Badge 
          variant="outline" 
          className={`mt-1 ${
            tier === "KRİTİK" ? "border-red-500 text-red-500" :
            tier === "SINIRDA" ? "border-yellow-500 text-yellow-500" :
            tier === "BAŞARILI" ? "border-green-500 text-green-500" :
            "border-emerald-400 text-emerald-400"
          }`}
        >
          {tier === "MÜKEMMEL" ? "💎" : tier === "KRİTİK" ? "🔴" : tier === "SINIRDA" ? "🟡" : "🟢"} {tier}
        </Badge>
      </div>
    </div>
  );
};

// Loading Animation Component
const LoadingAnimation = ({ progress }) => {
  const metrics = [
    "Pupil Dilatation Simulating...",
    "Foveal Focus Calculating...",
    "Pharma Compliance Checking...",
    "Heat Map Generating...",
    "Saliency Mask Processing...",
    "Cognitive Load Analyzing..."
  ];
  
  const [currentMetric, setCurrentMetric] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % metrics.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#020408]/95 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-32 h-32 mx-auto relative"
        >
          <BrainCircuit className="w-full h-full text-[#0EA5E9]" />
          <div className="absolute inset-0 bg-[#0EA5E9]/20 rounded-full animate-pulse-glow" />
        </motion.div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">🧠 Nöro-İşleme</h2>
          <div className="w-80 mx-auto">
            <Progress value={progress} className="h-3 bg-[#1E293B]" />
          </div>
          <motion.p
            key={currentMetric}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[#0EA5E9] font-mono text-sm"
          >
            {metrics[currentMetric]}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, unit, color }) => (
  <Card className="glass-card hover:border-[#0EA5E9]/50 transition-colors duration-300">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-[#0EA5E9]/10">
          <Icon className="w-5 h-5 text-[#0EA5E9]" />
        </div>
        <span className={`text-2xl font-mono font-bold ${color || "text-white"}`}>
          {value}{unit}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </CardContent>
  </Card>
);

// Recommendation Card Component
const RecommendationCard = ({ title, icon, items, colorClass }) => (
  <Card className="glass-card">
    <CardHeader className="pb-3">
      <CardTitle className={`text-lg flex items-center gap-2 ${colorClass}`}>
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full ${colorClass.replace("text-", "bg-")}`} />
            {item}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// Main App Component
function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState("heatmap");

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("History fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Lütfen bir görsel yükleyin");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAnalysisProgress(100);
      setTimeout(() => {
        setResult(response.data);
        setIsAnalyzing(false);
        fetchHistory();
        
        // Show confetti for excellent scores
        if (response.data.sano_score > 80) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
        
        // Flash red for critical scores
        if (response.data.sano_score <= 40) {
          document.body.classList.add("animate-flash-red");
          setTimeout(() => document.body.classList.remove("animate-flash-red"), 1500);
        }
        
        toast.success("Analiz tamamlandı!");
      }, 500);

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analiz sırasında bir hata oluştu");
      setIsAnalyzing(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleDeleteAnalysis = async (id) => {
    try {
      await axios.delete(`${API}/analysis/${id}`);
      toast.success("Analiz silindi");
      fetchHistory();
      if (result?.id === id) {
        setResult(null);
      }
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const handleLoadAnalysis = async (id) => {
    try {
      const response = await axios.get(`${API}/analysis/${id}`);
      setResult(response.data);
      setPreview(null);
      setFile(null);
    } catch (error) {
      toast.error("Analiz yüklenemedi");
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] grid-background">
      <Toaster theme="dark" position="top-right" />
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <AnimatePresence>
        {isAnalyzing && <LoadingAnimation progress={analysisProgress} />}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative hero-glow pt-8 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BrainCircuit className="w-10 h-10 text-[#0EA5E9]" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Sano<span className="text-[#0EA5E9]">Tracking</span>.AI
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              🧪 Nöromarketing ile Reklamlarınızın Bilinçaltı Etkisini Ölçün
            </p>
            <Badge variant="outline" className="mt-4 border-[#0EA5E9]/50 text-[#0EA5E9]">
              💊 İlaç Sektörü İçin Optimize Edilmiş
            </Badge>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel - Upload & History */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Upload Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#0EA5E9]" />
                  Görsel Yükle
                </CardTitle>
                <CardDescription>
                  İlaç reklamı veya HCP materyali yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#0EA5E9]/50 transition-colors cursor-pointer"
                >
                  {preview ? (
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => { setPreview(null); setFile(null); }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Sürükleyip bırakın veya tıklayın
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        data-testid="file-input"
                      />
                    </label>
                  )}
                </div>
                
                <Button 
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="w-full mt-4 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white neon-glow"
                  data-testid="analyze-button"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Görseli Analiz Et
                </Button>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#0EA5E9]" />
                  Analiz Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Henüz analiz yapılmamış
                    </p>
                  ) : (
                    <div className="space-y-1 p-4">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group cursor-pointer"
                          onClick={() => handleLoadAnalysis(item.id)}
                          data-testid={`history-item-${item.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.image_name}</p>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  item.score_tier === "KRİTİK" ? "border-red-500 text-red-500" :
                                  item.score_tier === "SINIRDA" ? "border-yellow-500 text-yellow-500" :
                                  item.score_tier === "BAŞARILI" ? "border-green-500 text-green-500" :
                                  "border-emerald-400 text-emerald-400"
                                }`}
                              >
                                {item.sano_score}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString("tr-TR")}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAnalysis(item.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded"
                            data-testid={`delete-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Center Panel - Results */}
          <motion.div 
            className="lg:col-span-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {result ? (
              <>
                {/* SanoScore Card */}
                <Card className="glass-card neon-glow">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl flex items-center justify-center gap-2">
                      <BarChart3 className="w-6 h-6 text-[#0EA5E9]" />
                      📊 SanoScore
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SanoGauge 
                      score={result.sano_score} 
                      tier={result.score_tier}
                      isAnimating={true}
                    />
                    
                    {/* Score Breakdown */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Güven Faktörü</p>
                        <Progress value={result.trust_factor} className="h-2 mb-1" />
                        <span className="text-sm font-mono">{result.trust_factor}%</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Regülasyon</p>
                        <Progress value={result.regulatory_visibility} className="h-2 mb-1" />
                        <span className="text-sm font-mono">{result.regulatory_visibility}%</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">CTA Odak</p>
                        <Progress value={result.cta_focus} className="h-2 mb-1" />
                        <span className="text-sm font-mono">{result.cta_focus}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Analysis Tabs */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5 text-[#0EA5E9]" />
                      Görsel Analiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3 bg-[#121926]">
                        <TabsTrigger value="heatmap" data-testid="tab-heatmap">🔥 Heat Map</TabsTrigger>
                        <TabsTrigger value="saliency" data-testid="tab-saliency">🎭 Saliency Mask</TabsTrigger>
                        <TabsTrigger value="comparison" data-testid="tab-comparison">📊 Karşılaştırma</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="heatmap" className="mt-4">
                        {result.heat_map_base64 ? (
                          <img 
                            src={`data:image/png;base64,${result.heat_map_base64}`}
                            alt="Heat Map"
                            className="w-full rounded-lg"
                          />
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            Heat map oluşturulamadı
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="saliency" className="mt-4">
                        {result.saliency_mask_base64 ? (
                          <img 
                            src={`data:image/png;base64,${result.saliency_mask_base64}`}
                            alt="Saliency Mask"
                            className="w-full rounded-lg"
                          />
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            Saliency mask oluşturulamadı
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="comparison" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="bg-red-500/10 border-red-500/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-red-400">📍 Before (Mevcut)</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">{result.before_analysis}</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-green-500/10 border-green-500/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-green-400">✨ After (Öneri)</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">{result.after_recommendations}</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-blue-500/10 border-blue-500/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-blue-400">🏆 Benchmark</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">{result.benchmark_comparison}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KPICard 
                    icon={Clock}
                    label="TTFF (İlk Fiksasyon)"
                    value={result.ttff_medical_claims}
                    unit="s"
                    color="text-[#0EA5E9]"
                  />
                  <KPICard 
                    icon={Target}
                    label="AOI Dağılımı"
                    value={result.aoi_brand_vs_visual.split(",")[0]?.replace("Marka ", "") || "40%"}
                    unit=""
                    color="text-[#10B981]"
                  />
                  <KPICard 
                    icon={Activity}
                    label="Bilişsel Yük"
                    value={result.cognitive_load}
                    unit=""
                    color={result.cognitive_load === "Yüksek" ? "text-red-500" : result.cognitive_load === "Orta" ? "text-yellow-500" : "text-green-500"}
                  />
                  <KPICard 
                    icon={Zap}
                    label="Dikkat Puanı"
                    value={Math.round((result.trust_factor + result.cta_focus) / 2)}
                    unit="%"
                    color="text-[#F43F5E]"
                  />
                </div>
              </>
            ) : (
              <Card className="glass-card h-96 flex items-center justify-center">
                <div className="text-center">
                  <BrainCircuit className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analiz Bekleniyor</h3>
                  <p className="text-sm text-muted-foreground">
                    İlaç reklamı veya HCP materyali yükleyerek başlayın
                  </p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Right Panel - Recommendations */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {result ? (
              <>
                <RecommendationCard 
                  title="💊 Doz Artırımı (Güçlü Yönler)"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  items={result.doz_artirimi}
                  colorClass="text-green-500"
                />
                
                <RecommendationCard 
                  title="⚠️ Yan Etkiler (Hatalar)"
                  icon={<AlertTriangle className="w-5 h-5" />}
                  items={result.yan_etkiler}
                  colorClass="text-red-500"
                />
                
                <RecommendationCard 
                  title="🧪 Tedavi Planı (Optimizasyon)"
                  icon={<Zap className="w-5 h-5" />}
                  items={result.tedavi_plani}
                  colorClass="text-[#0EA5E9]"
                />
              </>
            ) : (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-[#0EA5E9]" />
                    Yapay Zeka Önerileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Analiz sonrası öneriler burada görünecek
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          🧠 SanoTracking.AI - Veriye Dayalı İlaç Pazarlaması: Göz Yanılmaz, Beyin Unutmaz.
        </p>
      </footer>
    </div>
  );
}

export default App;
