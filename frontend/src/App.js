import { useState, useEffect, useCallback, useRef } from "react";
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
  Clock,
  Download,
  BookOpen,
  Gauge,
  Focus,
  TrendingUp,
  GitCompare,
  Trophy,
  Medal,
  Crown,
  ChevronUp,
  ChevronDown,
  Minus,
  Building2,
  BarChart2,
  Upload,
  Files,
  Users,
  UserPlus,
  Share2,
  LineChart,
  PieChart,
  Mail,
  Shield,
  Edit3,
  Eye as EyeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, Legend } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Eye Tracking Terms & KPIs Content
const EYE_TRACKING_CONTENT = {
  title: "Göz Takibi & Nöromarketing Terimler Sözlüğü",
  sections: [
    {
      title: "🎯 Temel Göz Takibi Metrikleri",
      items: [
        { term: "Fiksasyon (Fixation)", desc: "Gözlerin belirli bir noktada duraksadığı ve odaklandığı anlar. Daha uzun fiksasyonlar, daha yüksek ilgi ve dikkat gösterir." },
        { term: "Sakkad (Saccade)", desc: "Fiksasyonlar arasındaki hızlı göz hareketleri. Sakkad desenleri, tüketicilerin materyalleri nasıl taradığını ve gezindiğini ortaya koyar." },
        { term: "Bakış Yolu (Gaze Plot)", desc: "Fiksasyonların ve sakkadların sırasını ve süresini gösteren göz hareketlerinin görsel temsilleri." },
        { term: "Isı Haritası (Heat Map)", desc: "Renk kodlu kaplamalar kullanarak yüksek ve düşük görsel dikkat alanlarını gösteren toplu göz takibi verileri." }
      ]
    },
    {
      title: "⏱️ Zaman Bazlı Metrikler",
      items: [
        { term: "TTFF (Time to First Fixation)", desc: "İlk Fiksasyon Süresi - Bir kullanıcının belirli bir öğeye ilk kez bakmasının ne kadar sürdüğünü ölçer. Düşük TTFF, yüksek görsel çekicilik demektir." },
        { term: "Fiksasyon Süresi", desc: "Gözün belirli bir noktaya ne kadar süre odaklandığı. Uzun süre = yüksek ilgi veya karmaşıklık." },
        { term: "Ziyaret Sayısı", desc: "Bir AOI'nin kaç kez ziyaret edildiği. Yüksek ziyaret = tekrarlanan ilgi." }
      ]
    },
    {
      title: "📍 İlgi Alanı (AOI) Metrikleri",
      items: [
        { term: "AOI (Area of Interest)", desc: "Hedefli analiz için tanımlanmış stimulus içindeki belirli bölgeler (ör. ürün görselleri, başlıklar, CTA'lar)." },
        { term: "Marka vs Görsel Oranı", desc: "Kullanıcının marka elemanlarına vs görsel içeriğe ayırdığı dikkat yüzdesi." },
        { term: "AOI Hit Oranı", desc: "Katılımcıların belirli bir AOI'ye bakan yüzdesi." }
      ]
    },
    {
      title: "🧠 Nörobilişsel Metrikler",
      items: [
        { term: "Göz Bebeği Genişlemesi (Pupil Dilation)", desc: "Göz bebeği boyutundaki değişiklikler duygusal uyarılma, bilişsel yük ve zihinsel çabayı gösterir. Daha büyük göz bebekleri = artmış etkileşim." },
        { term: "Göz Kırpma Oranı (Blink Rate)", desc: "Bilişsel yük, yorgunluk ve etkileşimin bir göstergesi. Düşük göz kırpma = yüksek konsantrasyon." },
        { term: "Bilişsel Yük", desc: "Görsel bilgiyi işlemek için gereken zihinsel çaba. Yüksek bilişsel yük, kullanıcı deneyimini olumsuz etkileyebilir." }
      ]
    },
    {
      title: "💊 İlaç Sektörü Özel Metrikleri",
      items: [
        { term: "Güven Faktörü (Trust Factor)", desc: "Tasarımın güvenlik ve profesyonellik hissi uyandırıp uyandırmadığını ölçer. İlaç reklamlarında kritik öneme sahiptir." },
        { term: "Regülasyon Görünürlüğü", desc: "Zorunlu uyarılar ve yan etkilerin okunabilir olup olmadığını ancak ana mesajı bölmediğini değerlendirir." },
        { term: "CTA Odak", desc: "'Daha Fazla Bilgi' veya 'Reçete' butonlarına ilk fiksasyon süresi ve dikkat yoğunluğu." },
        { term: "Fair Balance", desc: "FDA gereksinimi - reklam faydaları ve riskleri dengeli sunmalıdır. Görsel dikkat dağılımı kritiktir." }
      ]
    },
    {
      title: "📊 SanoScore Hesaplama",
      items: [
        { term: "Güven Faktörü (%30)", desc: "Tasarımın profesyonellik ve güvenilirlik algısı." },
        { term: "Regülasyon Görünürlüğü (%30)", desc: "Yasal uyarıların görünürlüğü ve okunabilirliği." },
        { term: "CTA Odak (%40)", desc: "Harekete geçirici mesajlara dikkat çekme başarısı." }
      ]
    },
    {
      title: "🎨 Görsel Hiyerarşi Kavramları",
      items: [
        { term: "Saliency (Belirginlik)", desc: "Bir öğenin görsel olarak ne kadar dikkat çekici olduğu. Yüksek kontrast, büyük boyut ve canlı renkler belirginliği artırır." },
        { term: "Banner Körlüğü", desc: "Kullanıcıların reklam benzeri içerikleri otomatik olarak görmezden gelme eğilimi." },
        { term: "F-Pattern / Z-Pattern", desc: "Kullanıcıların web sayfalarını okurken izlediği tipik göz hareketi desenleri." },
        { term: "Görsel Gürültü", desc: "Dikkat dağıtan ve ana mesajı zayıflatan gereksiz görsel elemanlar." }
      ]
    }
  ]
};

// SanoScore Gauge Component with Digital Display on Right
const SanoGauge = ({ score, tier, isAnimating }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [showBlink, setShowBlink] = useState(true);
  
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

  // Blink effect for digital display
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowBlink(prev => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  const getScoreColor = () => {
    if (score <= 40) return "#EF4444";
    if (score <= 60) return "#EAB308";
    if (score <= 80) return "#10B981";
    return "#10B981";
  };

  const rotation = (displayScore / 100) * 180 - 90;

  return (
    <div className="flex items-center justify-between gap-6">
      {/* Gauge on Left */}
      <div className="relative w-48 h-28 flex-shrink-0">
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
              y2="30"
              stroke={getScoreColor()}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="90" r="6" fill={getScoreColor()} />
          </motion.g>
          
          {/* Score labels */}
          <text x="25" y="98" fill="#64748B" fontSize="10" textAnchor="middle">0</text>
          <text x="100" y="20" fill="#64748B" fontSize="10" textAnchor="middle">50</text>
          <text x="175" y="98" fill="#64748B" fontSize="10" textAnchor="middle">100</text>
        </svg>
      </div>

      {/* Digital Score Display on Right */}
      <div className="flex flex-col items-center justify-center">
        <motion.div 
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div 
            className={`text-7xl font-mono tracking-tighter digital-font ${showBlink ? 'opacity-100' : 'opacity-80'}`}
            style={{ 
              color: getScoreColor(),
              textShadow: `0 0 20px ${getScoreColor()}80, 0 0 40px ${getScoreColor()}40`,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500
            }}
          >
            {displayScore}
          </div>
          <div 
            className="absolute inset-0 blur-xl opacity-30"
            style={{ backgroundColor: getScoreColor() }}
          />
        </motion.div>
        
        <Badge 
          variant="outline" 
          className={`mt-3 text-base px-4 py-1 ${
            tier === "KRİTİK" ? "border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" :
            tier === "SINIRDA" ? "border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]" :
            tier === "BAŞARILI" ? "border-green-500 text-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
            "border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
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

// Improved KPI Card Component - Compact Design
const KPICard = ({ icon: Icon, label, value, unit, color }) => (
  <Card className="glass-card hover:border-[#0EA5E9]/50 transition-all duration-300">
    <CardContent className="p-2.5">
      <div className="flex flex-col items-center text-center gap-1">
        <div className="p-1.5 rounded-lg bg-white/5">
          <Icon className={`w-4 h-4 ${color || "text-[#0EA5E9]"}`} />
        </div>
        <span className={`text-base font-mono leading-none ${color || "text-white"}`}>
          {value}{unit}
        </span>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      </div>
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
            <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colorClass.replace("text-", "bg-")}`} />
            {item}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// Terms & KPIs Modal Component
const TermsKPIsModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button 
        variant="outline" 
        className="border-[#0EA5E9]/50 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 gap-2"
        data-testid="terms-kpis-button"
      >
        <BookOpen className="w-4 h-4" />
        Terimler & KPI'lar
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-[#0B101B] border-white/10" aria-describedby="terms-kpis-description">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-3 text-white">
          <BrainCircuit className="w-7 h-7 text-[#0EA5E9]" />
          {EYE_TRACKING_CONTENT.title}
        </DialogTitle>
        <p id="terms-kpis-description" className="sr-only">Göz takibi ve nöromarketing terimler sözlüğü</p>
      </DialogHeader>
      <ScrollArea className="h-[70vh] pr-4">
        <div className="space-y-8 pb-6">
          {EYE_TRACKING_CONTENT.sections.map((section, sIdx) => (
            <motion.div 
              key={sIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                {section.title}
              </h3>
              <div className="grid gap-3">
                {section.items.map((item, iIdx) => (
                  <div 
                    key={iIdx}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#0EA5E9]/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#0EA5E9] mt-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-[#0EA5E9] mb-1">{item.term}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

// PDF Download Function
const generatePDFReport = (result) => {
  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SanoTracking.AI Analiz Raporu</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a2e; background: #fff; }
    .header { text-align: center; border-bottom: 3px solid #0EA5E9; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0EA5E9; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 10px 0 0; }
    .score-section { text-align: center; padding: 30px; background: linear-gradient(135deg, #0EA5E9 0%, #10B981 100%); border-radius: 15px; margin: 20px 0; }
    .score-section h2 { color: white; font-size: 64px; margin: 0; }
    .score-section .tier { color: white; font-size: 24px; opacity: 0.9; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .metric-card { background: #f8fafc; border-radius: 10px; padding: 15px; text-align: center; border: 1px solid #e2e8f0; }
    .metric-card .value { font-size: 28px; font-weight: bold; color: #0EA5E9; }
    .metric-card .label { color: #64748b; font-size: 12px; margin-top: 5px; }
    .section { margin: 25px 0; }
    .section h3 { color: #1e293b; border-left: 4px solid #0EA5E9; padding-left: 12px; margin-bottom: 15px; }
    .recommendation-box { padding: 15px; border-radius: 10px; margin: 10px 0; }
    .recommendation-box.strengths { background: #dcfce7; border-left: 4px solid #22c55e; }
    .recommendation-box.errors { background: #fee2e2; border-left: 4px solid #ef4444; }
    .recommendation-box.optimization { background: #dbeafe; border-left: 4px solid #3b82f6; }
    .recommendation-box h4 { margin: 0 0 10px; }
    .recommendation-box ul { margin: 0; padding-left: 20px; }
    .recommendation-box li { margin: 5px 0; color: #374151; }
    .kpi-row { display: flex; gap: 15px; margin: 15px 0; flex-wrap: wrap; }
    .kpi-item { flex: 1; min-width: 120px; background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center; }
    .kpi-item .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; }
    .kpi-item .kpi-label { font-size: 11px; color: #64748b; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
    .comparison-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .comparison-card { padding: 15px; border-radius: 10px; }
    .comparison-card.before { background: #fee2e2; }
    .comparison-card.after { background: #dcfce7; }
    .comparison-card.benchmark { background: #dbeafe; }
    .comparison-card h4 { margin: 0 0 10px; font-size: 14px; }
    .comparison-card p { font-size: 12px; margin: 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🧠 SanoTracking.AI</h1>
    <p>Nöromarketing Analiz Raporu - ${result.image_name}</p>
    <p style="font-size: 12px; color: #94a3b8;">Oluşturulma: ${new Date(result.created_at).toLocaleString('tr-TR')}</p>
  </div>

  <div class="score-section">
    <h2>${result.sano_score}</h2>
    <div class="tier">${result.score_tier === "MÜKEMMEL" ? "💎" : result.score_tier === "KRİTİK" ? "🔴" : result.score_tier === "SINIRDA" ? "🟡" : "🟢"} ${result.score_tier}</div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="value">${result.trust_factor}%</div>
      <div class="label">Güven Faktörü</div>
    </div>
    <div class="metric-card">
      <div class="value">${result.regulatory_visibility}%</div>
      <div class="label">Regülasyon Görünürlüğü</div>
    </div>
    <div class="metric-card">
      <div class="value">${result.cta_focus}%</div>
      <div class="label">CTA Odak</div>
    </div>
  </div>

  <div class="section">
    <h3>📊 KPI Metrikleri</h3>
    <div class="kpi-row">
      <div class="kpi-item">
        <div class="kpi-value">${result.ttff_medical_claims}s</div>
        <div class="kpi-label">TTFF (İlk Fiksasyon)</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-value">${result.aoi_brand_vs_visual}</div>
        <div class="kpi-label">AOI Dağılımı</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-value">${result.cognitive_load}</div>
        <div class="kpi-label">Bilişsel Yük</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>🔄 Karşılaştırma Analizi</h3>
    <div class="comparison-grid">
      <div class="comparison-card before">
        <h4>📍 Mevcut Durum</h4>
        <p>${result.before_analysis}</p>
      </div>
      <div class="comparison-card after">
        <h4>✨ Öneriler</h4>
        <p>${result.after_recommendations}</p>
      </div>
      <div class="comparison-card benchmark">
        <h4>🏆 Benchmark</h4>
        <p>${result.benchmark_comparison}</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>💊 Yapay Zeka Önerileri</h3>
    
    <div class="recommendation-box strengths">
      <h4 style="color: #16a34a;">✅ Doz Artırımı (Güçlü Yönler)</h4>
      <ul>
        ${result.doz_artirimi.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="recommendation-box errors">
      <h4 style="color: #dc2626;">⚠️ Yan Etkiler (Hatalar)</h4>
      <ul>
        ${result.yan_etkiler.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="recommendation-box optimization">
      <h4 style="color: #2563eb;">🧪 Tedavi Planı (Optimizasyon)</h4>
      <ul>
        ${result.tedavi_plani.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer">
    <p>🧠 SanoTracking.AI - Veriye Dayalı İlaç Pazarlaması: Göz Yanılmaz, Beyin Unutmaz.</p>
    <p>Bu rapor yapay zeka destekli analiz sonuçlarını içermektedir.</p>
  </div>
</body>
</html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SanoTracking_Rapor_${result.image_name}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast.success("Rapor indirildi! Tarayıcıda açıp PDF olarak yazdırabilirsiniz.");
};

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
  
  // A/B Test State
  const [abMode, setAbMode] = useState(false);
  const [selectedForAB, setSelectedForAB] = useState([]);
  const [abComparison, setAbComparison] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  
  // Competitor Benchmark State
  const [competitorData, setCompetitorData] = useState(null);
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  
  // Batch Upload State
  const [batchFiles, setBatchFiles] = useState([]);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  
  // Trend & Stats State
  const [trendData, setTrendData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  
  // Team State
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("viewer");
  const [selectedAnalysesForShare, setSelectedAnalysesForShare] = useState([]);

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

  // A/B Test Functions
  const handleSelectForAB = (id) => {
    if (selectedForAB.includes(id)) {
      setSelectedForAB(selectedForAB.filter(i => i !== id));
    } else if (selectedForAB.length < 2) {
      setSelectedForAB([...selectedForAB, id]);
    } else {
      toast.error("A/B testi için maksimum 2 görsel seçebilirsiniz");
    }
  };

  const handleCompareAB = async () => {
    if (selectedForAB.length !== 2) {
      toast.error("Lütfen karşılaştırmak için 2 analiz seçin");
      return;
    }

    setIsComparing(true);
    try {
      const response = await axios.post(`${API}/compare`, {
        analysis_id_a: selectedForAB[0],
        analysis_id_b: selectedForAB[1]
      });
      setAbComparison(response.data);
      toast.success("A/B karşılaştırma tamamlandı!");
    } catch (error) {
      console.error("Comparison error:", error);
      toast.error("Karşılaştırma sırasında hata oluştu");
    } finally {
      setIsComparing(false);
    }
  };

  const handleFetchCompetitorBenchmark = async (analysisId) => {
    try {
      const response = await axios.get(`${API}/competitor-benchmark/${analysisId}`);
      setCompetitorData(response.data);
      setShowCompetitorModal(true);
    } catch (error) {
      console.error("Benchmark error:", error);
      toast.error("Rakip karşılaştırması alınamadı");
    }
  };

  // Batch Upload Functions
  const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      toast.error("Maksimum 10 dosya yükleyebilirsiniz");
      return;
    }
    setBatchFiles(files);
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) {
      toast.error("Lütfen dosya seçin");
      return;
    }

    setIsBatchUploading(true);
    setBatchProgress(0);
    
    try {
      const formData = new FormData();
      batchFiles.forEach(file => {
        formData.append("files", file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setBatchProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await axios.post(`${API}/analyze-batch`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(progressInterval);
      setBatchProgress(100);
      setBatchResults(response.data);
      fetchHistory();
      toast.success(`${response.data.success_count}/${response.data.total} görsel başarıyla analiz edildi!`);
      
    } catch (error) {
      console.error("Batch upload error:", error);
      toast.error("Toplu yükleme sırasında hata oluştu");
    } finally {
      setIsBatchUploading(false);
      setBatchFiles([]);
    }
  };

  // Trend & Stats Functions
  const handleFetchTrends = async () => {
    try {
      const [trendsRes, statsRes] = await Promise.all([
        axios.get(`${API}/trends`),
        axios.get(`${API}/stats`)
      ]);
      setTrendData(trendsRes.data);
      setStatsData(statsRes.data);
      setShowTrendsModal(true);
    } catch (error) {
      console.error("Trends error:", error);
      toast.error("Trend verileri alınamadı");
    }
  };

  // Team Functions
  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error("Teams fetch error:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Takım adı gerekli");
      return;
    }

    try {
      const response = await axios.post(`${API}/teams`, {
        name: newTeamName,
        description: newTeamDesc
      });
      toast.success("Takım oluşturuldu!");
      setShowCreateTeamModal(false);
      setNewTeamName("");
      setNewTeamDesc("");
      fetchTeams();
    } catch (error) {
      toast.error("Takım oluşturulamadı");
    }
  };

  const handleAddMember = async () => {
    if (!currentTeam || !newMemberEmail.trim()) {
      toast.error("E-posta gerekli");
      return;
    }

    try {
      await axios.post(`${API}/teams/${currentTeam.id}/members`, {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole
      });
      toast.success("Üye eklendi!");
      setNewMemberName("");
      setNewMemberEmail("");
      // Refresh team data
      const res = await axios.get(`${API}/teams/${currentTeam.id}`);
      setCurrentTeam(res.data);
    } catch (error) {
      toast.error("Üye eklenemedi");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!currentTeam) return;
    
    try {
      await axios.delete(`${API}/teams/${currentTeam.id}/members/${memberId}`);
      toast.success("Üye kaldırıldı");
      const res = await axios.get(`${API}/teams/${currentTeam.id}`);
      setCurrentTeam(res.data);
    } catch (error) {
      toast.error("Üye kaldırılamadı");
    }
  };

  const handleShareWithTeam = async () => {
    if (!currentTeam || selectedAnalysesForShare.length === 0) {
      toast.error("Paylaşılacak analiz seçin");
      return;
    }

    try {
      await axios.post(`${API}/teams/${currentTeam.id}/share`, {
        analysis_ids: selectedAnalysesForShare
      });
      toast.success(`${selectedAnalysesForShare.length} analiz paylaşıldı!`);
      setSelectedAnalysesForShare([]);
    } catch (error) {
      toast.error("Paylaşım başarısız");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`${API}/teams/${teamId}`);
      toast.success("Takım silindi");
      fetchTeams();
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
      }
    } catch (error) {
      toast.error("Takım silinemedi");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

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
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBatchModal(true)}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 gap-2"
                data-testid="batch-upload-btn"
              >
                <Files className="w-4 h-4" />
                Toplu Yükleme
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchTrends}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10 gap-2"
                data-testid="trends-btn"
              >
                <LineChart className="w-4 h-4" />
                Trend Analizi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { fetchTeams(); setShowTeamModal(true); }}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 gap-2"
                data-testid="team-btn"
              >
                <Users className="w-4 h-4" />
                Takım Paylaşımı
              </Button>
            </div>
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

            {/* History Card with A/B Test Mode */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="w-5 h-5 text-[#0EA5E9]" />
                    Analiz Geçmişi
                  </CardTitle>
                  <Button
                    variant={abMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAbMode(!abMode);
                      setSelectedForAB([]);
                      setAbComparison(null);
                    }}
                    className={abMode ? "bg-purple-600 hover:bg-purple-700" : "border-purple-500/50 text-purple-400"}
                    data-testid="ab-mode-toggle"
                  >
                    <GitCompare className="w-3 h-3 mr-1" />
                    A/B
                  </Button>
                </div>
                {abMode && (
                  <p className="text-xs text-purple-400 mt-2">
                    Karşılaştırmak için 2 analiz seçin ({selectedForAB.length}/2)
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-52">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Henüz analiz yapılmamış
                    </p>
                  ) : (
                    <div className="space-y-1 p-4">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 group cursor-pointer ${
                            selectedForAB.includes(item.id) ? 'bg-purple-500/20 border border-purple-500/50' : ''
                          }`}
                          onClick={() => abMode ? handleSelectForAB(item.id) : handleLoadAnalysis(item.id)}
                          data-testid={`history-item-${item.id}`}
                        >
                          {abMode && (
                            <Checkbox
                              checked={selectedForAB.includes(item.id)}
                              onCheckedChange={() => handleSelectForAB(item.id)}
                              className="border-purple-500 data-[state=checked]:bg-purple-600"
                            />
                          )}
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
                          {!abMode && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteAnalysis(item.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded"
                              data-testid={`delete-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {/* A/B Compare Button */}
                {abMode && selectedForAB.length === 2 && (
                  <div className="p-4 border-t border-white/10">
                    <Button
                      onClick={handleCompareAB}
                      disabled={isComparing}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      data-testid="compare-ab-button"
                    >
                      {isComparing ? (
                        <>Karşılaştırılıyor...</>
                      ) : (
                        <>
                          <GitCompare className="w-4 h-4 mr-2" />
                          A/B Karşılaştır
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#0EA5E9]" />
                        📊 SanoScore
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFetchCompetitorBenchmark(result.id)}
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 gap-1"
                          data-testid="competitor-benchmark-button"
                        >
                          <Trophy className="w-4 h-4" />
                          Rakip Karşılaştır
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDFReport(result)}
                          className="border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/10 gap-1"
                          data-testid="download-pdf-button"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
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
                        <TabsTrigger value="saliency" data-testid="tab-saliency">🎭 Saliency</TabsTrigger>
                        <TabsTrigger value="comparison" data-testid="tab-comparison">📊 Karşılaştır</TabsTrigger>
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
                              <CardTitle className="text-sm text-red-400">📍 Mevcut</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-xs text-muted-foreground">{result.before_analysis}</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-green-500/10 border-green-500/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-green-400">✨ Öneri</CardTitle>
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

                {/* KPI Grid - 7 Cards in a single row */}
                <div className="grid grid-cols-7 gap-2">
                  <KPICard 
                    icon={Clock}
                    label="TTFF"
                    value={result.ttff_medical_claims}
                    unit="s"
                    color="text-[#0EA5E9]"
                  />
                  <KPICard 
                    icon={Target}
                    label="AOI"
                    value={parseInt(result.aoi_brand_vs_visual.match(/\d+/)?.[0] || "40")}
                    unit="%"
                    color="text-[#10B981]"
                  />
                  <KPICard 
                    icon={Activity}
                    label="Yük"
                    value={result.cognitive_load === "Yüksek" ? "Y" : result.cognitive_load === "Orta" ? "O" : "D"}
                    unit=""
                    color={result.cognitive_load === "Yüksek" ? "text-red-500" : result.cognitive_load === "Orta" ? "text-yellow-500" : "text-green-500"}
                  />
                  <KPICard 
                    icon={Zap}
                    label="Dikkat"
                    value={Math.round((result.trust_factor + result.cta_focus) / 2)}
                    unit="%"
                    color="text-[#F43F5E]"
                  />
                  <KPICard 
                    icon={Gauge}
                    label="Etkinlik"
                    value={Math.round((result.sano_score + result.trust_factor) / 2)}
                    unit="%"
                    color="text-purple-500"
                  />
                  <KPICard 
                    icon={Focus}
                    label="Odak"
                    value={Math.round((result.cta_focus + result.regulatory_visibility) / 2)}
                    unit="%"
                    color="text-amber-500"
                  />
                  <KPICard 
                    icon={TrendingUp}
                    label="Potans."
                    value={Math.min(100, result.sano_score + 15)}
                    unit="%"
                    color="text-cyan-400"
                  />
                </div>
              </>
            ) : abComparison ? (
              /* A/B Comparison Results */
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <GitCompare className="w-5 h-5 text-purple-500" />
                      A/B Test Sonuçları
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAbComparison(null);
                        setSelectedForAB([]);
                        setAbMode(false);
                      }}
                      className="border-white/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Winner Banner */}
                  <div className={`p-4 rounded-xl text-center ${
                    abComparison.winner === "A" ? "bg-blue-500/20 border border-blue-500/50" :
                    abComparison.winner === "B" ? "bg-green-500/20 border border-green-500/50" :
                    "bg-yellow-500/20 border border-yellow-500/50"
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {abComparison.winner === "TIE" ? (
                        <Minus className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <Crown className="w-6 h-6 text-yellow-400" />
                      )}
                      <span className="text-2xl font-bold">
                        {abComparison.winner === "TIE" ? "Berabere!" : `Kazanan: Görsel ${abComparison.winner}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {abComparison.winner !== "TIE" && `${abComparison.score_difference} puan farkla`}
                    </p>
                  </div>

                  {/* Side by Side Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Analysis A */}
                    <div className={`p-4 rounded-xl ${abComparison.winner === "A" ? "bg-blue-500/10 border-2 border-blue-500" : "bg-white/5 border border-white/10"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-500">A</Badge>
                        <span className="text-sm truncate">{abComparison.analysis_a.image_name}</span>
                        {abComparison.winner === "A" && <Trophy className="w-4 h-4 text-yellow-400 ml-auto" />}
                      </div>
                      <div className="text-4xl font-mono font-bold text-center mb-2" style={{ color: abComparison.analysis_a.sano_score > 60 ? "#10B981" : abComparison.analysis_a.sano_score > 40 ? "#EAB308" : "#EF4444" }}>
                        {abComparison.analysis_a.sano_score}
                      </div>
                      <p className="text-xs text-center text-muted-foreground mb-3">{abComparison.analysis_a.score_tier}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span>Güven</span><span>{abComparison.analysis_a.trust_factor}%</span></div>
                        <div className="flex justify-between"><span>Regülasyon</span><span>{abComparison.analysis_a.regulatory_visibility}%</span></div>
                        <div className="flex justify-between"><span>CTA</span><span>{abComparison.analysis_a.cta_focus}%</span></div>
                      </div>
                    </div>

                    {/* Analysis B */}
                    <div className={`p-4 rounded-xl ${abComparison.winner === "B" ? "bg-green-500/10 border-2 border-green-500" : "bg-white/5 border border-white/10"}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-green-500">B</Badge>
                        <span className="text-sm truncate">{abComparison.analysis_b.image_name}</span>
                        {abComparison.winner === "B" && <Trophy className="w-4 h-4 text-yellow-400 ml-auto" />}
                      </div>
                      <div className="text-4xl font-mono font-bold text-center mb-2" style={{ color: abComparison.analysis_b.sano_score > 60 ? "#10B981" : abComparison.analysis_b.sano_score > 40 ? "#EAB308" : "#EF4444" }}>
                        {abComparison.analysis_b.sano_score}
                      </div>
                      <p className="text-xs text-center text-muted-foreground mb-3">{abComparison.analysis_b.score_tier}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span>Güven</span><span>{abComparison.analysis_b.trust_factor}%</span></div>
                        <div className="flex justify-between"><span>Regülasyon</span><span>{abComparison.analysis_b.regulatory_visibility}%</span></div>
                        <div className="flex justify-between"><span>CTA</span><span>{abComparison.analysis_b.cta_focus}%</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Metric Comparison Bars */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Metrik Karşılaştırması</h4>
                    {abComparison.metric_comparisons.map((metric, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{metric.name}</span>
                          <span className={metric.winner === "A" ? "text-blue-400" : metric.winner === "B" ? "text-green-400" : "text-yellow-400"}>
                            {metric.winner === "TIE" ? "=" : metric.winner}
                          </span>
                        </div>
                        <div className="flex gap-1 h-4">
                          <div 
                            className="bg-blue-500 rounded-l"
                            style={{ width: `${(metric.a / (metric.a + metric.b)) * 100}%` }}
                          />
                          <div 
                            className="bg-green-500 rounded-r"
                            style={{ width: `${(metric.b / (metric.a + metric.b)) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>A: {metric.a}{metric.lower_is_better ? 's' : '%'}</span>
                          <span>B: {metric.b}{metric.lower_is_better ? 's' : '%'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Summary */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <BrainCircuit className="w-4 h-4 text-purple-400" />
                      AI Karşılaştırma Özeti
                    </h4>
                    <p className="text-sm text-muted-foreground">{abComparison.comparison_summary}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card h-96 flex items-center justify-center">
                <div className="text-center">
                  <BrainCircuit className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analiz Bekleniyor</h3>
                  <p className="text-sm text-muted-foreground">
                    İlaç reklamı veya HCP materyali yükleyerek başlayın
                  </p>
                  {history.length >= 2 && (
                    <p className="text-xs text-purple-400 mt-4">
                      💡 İpucu: A/B testi için geçmişten 2 analiz seçebilirsiniz
                    </p>
                  )}
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
                  title="💊 Doz Artırımı"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  items={result.doz_artirimi}
                  colorClass="text-green-500"
                />
                
                <RecommendationCard 
                  title="⚠️ Yan Etkiler"
                  icon={<AlertTriangle className="w-5 h-5" />}
                  items={result.yan_etkiler}
                  colorClass="text-red-500"
                />
                
                <RecommendationCard 
                  title="🧪 Tedavi Planı"
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

      {/* Competitor Benchmark Modal */}
      <Dialog open={showCompetitorModal} onOpenChange={setShowCompetitorModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-[#0B101B] border-white/10" aria-describedby="competitor-modal-desc">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-white">
              <Trophy className="w-6 h-6 text-amber-400" />
              Rakip Karşılaştırması - Global İlaç Şirketleri
            </DialogTitle>
            <p id="competitor-modal-desc" className="sr-only">Global ilaç şirketleri ile karşılaştırma</p>
          </DialogHeader>
          
          {competitorData && (
            <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-6">
                {/* Your Score & Ranking */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#0EA5E9]/20 to-purple-500/20 border border-[#0EA5E9]/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sizin Puanınız</p>
                      <p className="text-4xl font-mono font-bold text-[#0EA5E9]">{competitorData.analysis_score}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Medal className="w-8 h-8 text-amber-400" />
                        <span className="text-3xl font-bold">#{competitorData.ranking}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Top %{Math.round(100 - competitorData.percentile)}</p>
                    </div>
                  </div>
                  <p className="text-sm">{competitorData.summary}</p>
                </div>

                {/* Competitor List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Global İlaç Şirketleri Sıralaması
                  </h4>
                  
                  {competitorData.competitors.map((comp, idx) => (
                    <motion.div
                      key={comp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-3 rounded-lg flex items-center gap-4 ${
                        comp.status === "below" ? "bg-red-500/10" : comp.status === "above" ? "bg-green-500/10" : "bg-yellow-500/10"
                      }`}
                    >
                      <div className="w-8 text-center font-mono text-lg">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{comp.name}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Güven: {comp.trust}%</span>
                          <span>Reg: {comp.regulatory}%</span>
                          <span>CTA: {comp.cta}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-mono font-bold">{comp.avg_score}</p>
                        <div className={`flex items-center gap-1 text-xs ${
                          comp.status === "above" ? "text-green-400" : comp.status === "below" ? "text-red-400" : "text-yellow-400"
                        }`}>
                          {comp.status === "above" ? (
                            <><ChevronUp className="w-3 h-3" />+{comp.difference}</>
                          ) : comp.status === "below" ? (
                            <><ChevronDown className="w-3 h-3" />{comp.difference}</>
                          ) : (
                            <><Minus className="w-3 h-3" />0</>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Your Position Indicator */}
                <div className="p-3 rounded-lg bg-[#0EA5E9]/20 border-2 border-[#0EA5E9] flex items-center gap-4">
                  <div className="w-8 text-center">
                    <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#0EA5E9]">Sizin Görseliniz</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold text-[#0EA5E9]">{competitorData.analysis_score}</p>
                    <p className="text-xs text-muted-foreground">#{competitorData.ranking} sırada</p>
                  </div>
                </div>

                {/* Chart Visualization */}
                <div className="p-4 rounded-xl bg-white/5">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    Puan Dağılımı
                  </h4>
                  <div className="space-y-2">
                    {competitorData.competitors.map((comp) => (
                      <div key={comp.id} className="flex items-center gap-2">
                        <span className="w-24 text-xs truncate">{comp.name.split(' ')[0]}</span>
                        <div className="flex-1 h-4 bg-white/10 rounded overflow-hidden">
                          <div 
                            className={`h-full ${comp.status === "below" ? "bg-amber-500" : "bg-slate-500"}`}
                            style={{ width: `${comp.avg_score}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-right">{comp.avg_score}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                      <span className="w-24 text-xs text-[#0EA5E9] font-medium">Siz</span>
                      <div className="flex-1 h-4 bg-white/10 rounded overflow-hidden">
                        <div 
                          className="h-full bg-[#0EA5E9]"
                          style={{ width: `${competitorData.analysis_score}%` }}
                        />
                      </div>
                      <span className="w-8 text-xs text-right text-[#0EA5E9] font-medium">{competitorData.analysis_score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Batch Upload Modal */}
      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogContent className="max-w-2xl bg-[#0B101B] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-white">
              <Files className="w-6 h-6 text-purple-400" />
              Toplu Görsel Yükleme
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Birden fazla görseli aynı anda analiz edin (maks. 10 dosya)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleBatchFileSelect}
                className="hidden"
                id="batch-file-input"
                data-testid="batch-file-input"
              />
              <label htmlFor="batch-file-input" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Birden fazla görsel seçmek için tıklayın
                </p>
              </label>
            </div>

            {batchFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{batchFiles.length} dosya seçildi:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {batchFiles.map((file, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Files className="w-3 h-3" />
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isBatchUploading && (
              <div className="space-y-2">
                <Progress value={batchProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">Analiz ediliyor... %{batchProgress}</p>
              </div>
            )}

            {batchResults && (
              <div className="p-4 rounded-xl bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-400">✓ Başarılı: {batchResults.success_count}</span>
                  {batchResults.fail_count > 0 && (
                    <span className="text-red-400">✗ Başarısız: {batchResults.fail_count}</span>
                  )}
                </div>
                {batchResults.successful.map((item, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between">
                    <span>{item.image_name}</span>
                    <Badge variant="outline" className={
                      item.score_tier === "KRİTİK" ? "border-red-500 text-red-500" :
                      item.score_tier === "SINIRDA" ? "border-yellow-500 text-yellow-500" :
                      "border-green-500 text-green-500"
                    }>
                      {item.sano_score}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleBatchUpload}
              disabled={batchFiles.length === 0 || isBatchUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isBatchUploading ? "Yükleniyor..." : `${batchFiles.length} Görseli Analiz Et`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trends Modal */}
      <Dialog open={showTrendsModal} onOpenChange={setShowTrendsModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-[#0B101B] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-white">
              <LineChart className="w-6 h-6 text-green-400" />
              Tarihsel Trend Analizi
            </DialogTitle>
          </DialogHeader>
          
          {trendData && statsData && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-mono font-bold text-[#0EA5E9]">{statsData.total_analyses}</p>
                      <p className="text-xs text-muted-foreground">Toplam Analiz</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-mono font-bold text-green-400">{statsData.averages.sano_score}</p>
                      <p className="text-xs text-muted-foreground">Ortalama Skor</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                      <p className={`text-3xl font-mono font-bold ${
                        trendData.overall_trend === "improving" ? "text-green-400" :
                        trendData.overall_trend === "declining" ? "text-red-400" : "text-yellow-400"
                      }`}>
                        {trendData.overall_trend === "improving" ? "↑" : trendData.overall_trend === "declining" ? "↓" : "→"}
                        {Math.abs(trendData.avg_improvement)}
                      </p>
                      <p className="text-xs text-muted-foreground">Trend</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-mono font-bold text-purple-400">{statsData.distribution.excellent}</p>
                      <p className="text-xs text-muted-foreground">Mükemmel</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Line Chart */}
                {trendData.data_points.length > 0 && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">Skor Trendi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={trendData.data_points}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="avg_score" stroke="#0EA5E9" strokeWidth={2} dot={{ fill: '#0EA5E9' }} name="Ortalama" />
                            <Line type="monotone" dataKey="max_score" stroke="#10B981" strokeWidth={1} strokeDasharray="5 5" name="Maksimum" />
                            <Line type="monotone" dataKey="min_score" stroke="#EF4444" strokeWidth={1} strokeDasharray="5 5" name="Minimum" />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Distribution Pie Chart */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">Skor Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: 'Kritik', value: statsData.distribution.critical, fill: '#EF4444' },
                                { name: 'Sınırda', value: statsData.distribution.borderline, fill: '#EAB308' },
                                { name: 'Başarılı', value: statsData.distribution.successful, fill: '#10B981' },
                                { name: 'Mükemmel', value: statsData.distribution.excellent, fill: '#8B5CF6' }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">Metrik Ortalamaları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={[
                            { name: 'SanoScore', value: statsData.averages.sano_score, fill: '#0EA5E9' },
                            { name: 'Güven', value: statsData.averages.trust_factor, fill: '#10B981' },
                            { name: 'Regülasyon', value: statsData.averages.regulatory, fill: '#8B5CF6' },
                            { name: 'CTA', value: statsData.averages.cta_focus, fill: '#F59E0B' }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 9 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {[
                                { fill: '#0EA5E9' },
                                { fill: '#10B981' },
                                { fill: '#8B5CF6' },
                                { fill: '#F59E0B' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Team Modal */}
      <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-[#0B101B] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-white">
              <Users className="w-6 h-6 text-blue-400" />
              Takım Paylaşımı
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 h-[60vh]">
            {/* Teams List */}
            <div className="col-span-1 border-r border-white/10 pr-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">Takımlarım</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCreateTeamModal(true)}
                  className="h-7 text-blue-400"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {teams.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Henüz takım yok
                    </p>
                  ) : (
                    teams.map((team) => (
                      <div
                        key={team.id}
                        onClick={() => setCurrentTeam(team)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentTeam?.id === team.id ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-medium text-sm">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.members?.length || 0} üye</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Team Details */}
            <div className="col-span-2 pl-4">
              {currentTeam ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{currentTeam.name}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTeam(currentTeam.id)}
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {currentTeam.description && (
                    <p className="text-sm text-muted-foreground">{currentTeam.description}</p>
                  )}

                  {/* Members Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Üyeler</h4>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="İsim"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="h-8 text-xs bg-white/5 border-white/10"
                      />
                      <Input
                        placeholder="E-posta"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="h-8 text-xs bg-white/5 border-white/10"
                      />
                      <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                        <SelectTrigger className="w-24 h-8 text-xs bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Görüntüle</SelectItem>
                          <SelectItem value="editor">Düzenle</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={handleAddMember} className="h-8 bg-blue-600">
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-24">
                      {currentTeam.members?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded bg-white/5 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-xs">{member.name?.charAt(0) || '?'}</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {member.role === 'admin' ? <Shield className="w-3 h-3" /> : 
                               member.role === 'editor' ? <Edit3 className="w-3 h-3" /> : 
                               <EyeIcon className="w-3 h-3" />}
                            </Badge>
                            <button onClick={() => handleRemoveMember(member.id)} className="text-red-400 hover:text-red-300">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  {/* Share Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Analiz Paylaş</h4>
                    <ScrollArea className="h-32 border border-white/10 rounded-lg p-2">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-1">
                          <Checkbox
                            checked={selectedAnalysesForShare.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAnalysesForShare([...selectedAnalysesForShare, item.id]);
                              } else {
                                setSelectedAnalysesForShare(selectedAnalysesForShare.filter(i => i !== item.id));
                              }
                            }}
                          />
                          <span className="text-xs flex-1">{item.image_name}</span>
                          <Badge variant="outline" className="text-xs">{item.sano_score}</Badge>
                        </div>
                      ))}
                    </ScrollArea>
                    <Button
                      size="sm"
                      onClick={handleShareWithTeam}
                      disabled={selectedAnalysesForShare.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {selectedAnalysesForShare.length} Analizi Paylaş
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Bir takım seçin veya yeni takım oluşturun</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Team Modal */}
      <Dialog open={showCreateTeamModal} onOpenChange={setShowCreateTeamModal}>
        <DialogContent className="max-w-md bg-[#0B101B] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              Yeni Takım Oluştur
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Takım Adı</Label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Örn: Pazarlama Ekibi"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="team-desc">Açıklama (Opsiyonel)</Label>
              <Input
                id="team-desc"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                placeholder="Takım açıklaması"
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTeamModal(false)}>İptal</Button>
            <Button onClick={handleCreateTeam} className="bg-blue-600 hover:bg-blue-700">Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer with Terms & KPIs Button */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <TermsKPIsModal />
            <p className="text-sm text-muted-foreground text-center">
              🧠 SanoTracking.AI - Veriye Dayalı İlaç Pazarlaması: Göz Yanılmaz, Beyin Unutmaz.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
