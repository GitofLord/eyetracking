from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
import asyncio

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get API key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Models
class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_name: str
    image_base64: str
    sano_score: int
    score_tier: str
    trust_factor: int
    regulatory_visibility: int
    cta_focus: int
    ttff_medical_claims: float
    aoi_brand_vs_visual: str
    cognitive_load: str
    heat_map_base64: Optional[str] = None
    saliency_mask_base64: Optional[str] = None
    before_analysis: str
    after_recommendations: str
    benchmark_comparison: str
    doz_artirimi: List[str]
    yan_etkiler: List[str]
    tedavi_plani: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    image_name: str
    sano_score: int
    score_tier: str
    trust_factor: int
    regulatory_visibility: int
    cta_focus: int
    ttff_medical_claims: float
    aoi_brand_vs_visual: str
    cognitive_load: str
    heat_map_base64: Optional[str] = None
    saliency_mask_base64: Optional[str] = None
    before_analysis: str
    after_recommendations: str
    benchmark_comparison: str
    doz_artirimi: List[str]
    yan_etkiler: List[str]
    tedavi_plani: List[str]
    created_at: str

class AnalysisHistoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    image_name: str
    sano_score: int
    score_tier: str
    created_at: str

# Helper functions
def get_score_tier(score: int) -> str:
    if score <= 40:
        return "KRİTİK"
    elif score <= 60:
        return "SINIRDA"
    elif score <= 80:
        return "BAŞARILI"
    else:
        return "MÜKEMMEL"

async def analyze_pharmaceutical_image(image_base64: str) -> dict:
    """Analyze pharmaceutical advertisement using Gemini 3 Flash"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"analysis-{uuid.uuid4()}",
            system_message="""Sen bir ilaç sektörü nöromarketing ve göz takibi uzmanısın. 
            Yüklenen ilaç reklamlarını, HCP portallarını ve hasta farkındalık materyallerini analiz ediyorsun.
            Değerlendirmende Güven, Regülasyon Netliği ve Bilişsel Kolaylık faktörlerini göz önünde bulunduruyorsun.
            
            Analiz sonuçlarını JSON formatında ver. Yanıtın sadece JSON olmalı, başka bir şey olmamalı."""
        ).with_model("gemini", "gemini-3-flash-preview")
        
        analysis_prompt = """Bu ilaç/sağlık sektörü görselini analiz et ve aşağıdaki JSON formatında yanıt ver:

{
    "sano_score": <0-100 arası puan>,
    "trust_factor": <0-100 arası güven faktörü puanı>,
    "regulatory_visibility": <0-100 arası regülasyon görünürlük puanı>,
    "cta_focus": <0-100 arası CTA odak puanı>,
    "ttff_medical_claims": <saniye cinsinden ilk fiksasyon süresi, örn: 1.2>,
    "aoi_brand_vs_visual": "<Marka vs Görsel oranı açıklaması, örn: Marka %40, Görsel %60>",
    "cognitive_load": "<Düşük/Orta/Yüksek>",
    "before_analysis": "<Mevcut görseldeki sorunların detaylı analizi>",
    "after_recommendations": "<Görselin nasıl iyileştirilebileceğinin detaylı tarifi>",
    "benchmark_comparison": "<Global ilaç şirketleri kıyaslaması>",
    "doz_artirimi": ["<güçlü yön 1>", "<güçlü yön 2>", "<güçlü yön 3>"],
    "yan_etkiler": ["<hata 1>", "<hata 2>", "<hata 3>"],
    "tedavi_plani": ["<optimizasyon adımı 1>", "<optimizasyon adımı 2>", "<optimizasyon adımı 3>"]
}

Değerlendirme Kriterleri:
- Trust Factor (30%): Tasarım güvenlik ve profesyonellik hissi uyandırıyor mu?
- Regulatory Visibility (30%): Zorunlu uyarılar ve yan etkiler okunabilir ama ana mesajı bölmüyor mu?
- CTA Focus (40%): "Daha Fazla Bilgi" veya "Reçete" butonuna ilk fiksasyon süresi

SADECE JSON formatında yanıt ver, başka açıklama ekleme."""

        msg = UserMessage(
            text=analysis_prompt,
            file_contents=[ImageContent(image_base64=image_base64)]
        )
        
        response = await chat.send_message(msg)
        
        # Parse JSON from response
        import json
        # Clean response - remove markdown code blocks if present
        cleaned_response = response.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.startswith("```"):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        result = json.loads(cleaned_response)
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        # Return default values if analysis fails
        return {
            "sano_score": 55,
            "trust_factor": 60,
            "regulatory_visibility": 50,
            "cta_focus": 55,
            "ttff_medical_claims": 2.5,
            "aoi_brand_vs_visual": "Marka %35, Görsel %65",
            "cognitive_load": "Orta",
            "before_analysis": "Görsel analiz yapılamadı. Lütfen farklı bir görsel deneyin.",
            "after_recommendations": "Daha net ve yüksek çözünürlüklü bir görsel yükleyerek tekrar deneyin.",
            "benchmark_comparison": "Kıyaslama yapılamadı.",
            "doz_artirimi": ["Görsel yüklendi"],
            "yan_etkiler": ["Analiz başarısız oldu"],
            "tedavi_plani": ["Farklı bir görsel deneyin"]
        }

async def generate_heat_map(image_base64: str, analysis_text: str) -> str:
    """Generate heat map visualization using Gemini Nano Banana"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"heatmap-{uuid.uuid4()}",
            system_message="You are an expert at creating eye-tracking heat map visualizations."
        ).with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
        
        prompt = f"""Create an eye-tracking heat map overlay for this pharmaceutical advertisement image.
        
Based on this analysis: {analysis_text}

Generate a heat map visualization showing:
- RED/HOT areas where eyes fixate most (brand name, CTA buttons, key medical claims)
- YELLOW/WARM areas of secondary attention
- BLUE/COOL areas of low attention
- The heat map should be semi-transparent overlaid on the original image

Make it look like professional eye-tracking software output with gradient heat zones."""

        msg = UserMessage(
            text=prompt,
            file_contents=[ImageContent(image_base64=image_base64)]
        )
        
        text, images = await chat.send_message_multimodal_response(msg)
        
        if images and len(images) > 0:
            return images[0]['data']
        return None
        
    except Exception as e:
        logger.error(f"Error generating heat map: {str(e)}")
        return None

async def generate_saliency_mask(image_base64: str, analysis_text: str) -> str:
    """Generate saliency mask (black & white hierarchy mask) using Gemini Nano Banana"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"saliency-{uuid.uuid4()}",
            system_message="You are an expert at creating visual saliency masks."
        ).with_model("gemini", "gemini-3-pro-image-preview").with_params(modalities=["image", "text"])
        
        prompt = f"""Create a saliency mask (visual hierarchy mask) for this pharmaceutical advertisement image.

Based on this analysis: {analysis_text}

Generate a BLACK AND WHITE saliency mask showing:
- WHITE/BRIGHT areas: Most visually salient elements that grab attention first (what the brain 'actually' sees first)
- GRAY areas: Secondary attention elements
- BLACK/DARK areas: Elements that get overlooked or ignored

This mask should prove what parts of the design the brain processes first vs what gets filtered out.
Make it look like professional neuromarketing saliency analysis output."""

        msg = UserMessage(
            text=prompt,
            file_contents=[ImageContent(image_base64=image_base64)]
        )
        
        text, images = await chat.send_message_multimodal_response(msg)
        
        if images and len(images) > 0:
            return images[0]['data']
        return None
        
    except Exception as e:
        logger.error(f"Error generating saliency mask: {str(e)}")
        return None

# Routes
@api_router.get("/")
async def root():
    return {"message": "SanoTracking.AI API - Nöromarketing Analiz Motoru"}

@api_router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """Analyze a pharmaceutical advertisement image"""
    try:
        # Read and encode image
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Analyze image with Gemini 3 Flash
        analysis = await analyze_pharmaceutical_image(image_base64)
        
        # Generate heat map and saliency mask in parallel
        before_text = analysis.get('before_analysis', '')
        heat_map_task = generate_heat_map(image_base64, before_text)
        saliency_task = generate_saliency_mask(image_base64, before_text)
        
        heat_map_base64, saliency_mask_base64 = await asyncio.gather(
            heat_map_task, saliency_task
        )
        
        # Get score tier
        sano_score = analysis.get('sano_score', 55)
        score_tier = get_score_tier(sano_score)
        
        # Create result
        result = AnalysisResult(
            image_name=file.filename or "uploaded_image",
            image_base64=image_base64,
            sano_score=sano_score,
            score_tier=score_tier,
            trust_factor=analysis.get('trust_factor', 60),
            regulatory_visibility=analysis.get('regulatory_visibility', 50),
            cta_focus=analysis.get('cta_focus', 55),
            ttff_medical_claims=analysis.get('ttff_medical_claims', 2.5),
            aoi_brand_vs_visual=analysis.get('aoi_brand_vs_visual', 'Marka %40, Görsel %60'),
            cognitive_load=analysis.get('cognitive_load', 'Orta'),
            heat_map_base64=heat_map_base64,
            saliency_mask_base64=saliency_mask_base64,
            before_analysis=analysis.get('before_analysis', ''),
            after_recommendations=analysis.get('after_recommendations', ''),
            benchmark_comparison=analysis.get('benchmark_comparison', ''),
            doz_artirimi=analysis.get('doz_artirimi', []),
            yan_etkiler=analysis.get('yan_etkiler', []),
            tedavi_plani=analysis.get('tedavi_plani', [])
        )
        
        # Save to database
        doc = result.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.analyses.insert_one(doc)
        
        return AnalysisResponse(
            id=result.id,
            image_name=result.image_name,
            sano_score=result.sano_score,
            score_tier=result.score_tier,
            trust_factor=result.trust_factor,
            regulatory_visibility=result.regulatory_visibility,
            cta_focus=result.cta_focus,
            ttff_medical_claims=result.ttff_medical_claims,
            aoi_brand_vs_visual=result.aoi_brand_vs_visual,
            cognitive_load=result.cognitive_load,
            heat_map_base64=result.heat_map_base64,
            saliency_mask_base64=result.saliency_mask_base64,
            before_analysis=result.before_analysis,
            after_recommendations=result.after_recommendations,
            benchmark_comparison=result.benchmark_comparison,
            doz_artirimi=result.doz_artirimi,
            yan_etkiler=result.yan_etkiler,
            tedavi_plani=result.tedavi_plani,
            created_at=doc['created_at']
        )
        
    except Exception as e:
        logger.error(f"Error in analyze_image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analiz sırasında hata oluştu: {str(e)}")

@api_router.get("/history", response_model=List[AnalysisHistoryItem])
async def get_analysis_history():
    """Get analysis history"""
    analyses = await db.analyses.find(
        {}, 
        {"_id": 0, "id": 1, "image_name": 1, "sano_score": 1, "score_tier": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(50)
    
    return [AnalysisHistoryItem(**item) for item in analyses]

@api_router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str):
    """Get a specific analysis by ID"""
    analysis = await db.analyses.find_one(
        {"id": analysis_id},
        {"_id": 0, "image_base64": 0}
    )
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analiz bulunamadı")
    
    return AnalysisResponse(**analysis)

@api_router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete an analysis"""
    result = await db.analyses.delete_one({"id": analysis_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analiz bulunamadı")
    
    return {"message": "Analiz silindi", "id": analysis_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
