#!/usr/bin/env python3
"""
SanoTracking.AI Backend API Test Suite
Tests all endpoints with proper image handling
"""

import requests
import sys
import base64
import json
from datetime import datetime
from pathlib import Path
import io
from PIL import Image, ImageDraw

class SanoTrackingAPITester:
    def __init__(self, base_url="https://sano-tracking-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.analysis_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details:
            print(f"   Details: {details}")

    def create_test_image(self):
        """Create a test pharmaceutical advertisement image"""
        # Create a 400x300 image with pharmaceutical content
        img = Image.new('RGB', (400, 300), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple pharmaceutical ad layout
        # Header background
        draw.rectangle([0, 0, 400, 60], fill='#0EA5E9')
        
        # Brand name area
        draw.rectangle([20, 80, 180, 120], fill='#1E293B')
        
        # Medical claims area
        draw.rectangle([20, 140, 380, 200], fill='#F8F9FA')
        
        # CTA button
        draw.rectangle([20, 220, 120, 260], fill='#10B981')
        
        # Regulatory text area
        draw.rectangle([20, 270, 380, 290], fill='#EF4444')
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return img_base64

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_message = "SanoTracking.AI API - Nöromarketing Analiz Motoru"
                success = data.get("message") == expected_message
                details = f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Root Endpoint (/api/)", success, details)
            return success
            
        except Exception as e:
            self.log_test("Root Endpoint (/api/)", False, str(e))
            return False

    def test_history_endpoint_empty(self):
        """Test history endpoint when empty"""
        try:
            response = requests.get(f"{self.api_url}/history", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = isinstance(data, list)
                details = f"Status: {response.status_code}, History count: {len(data)}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("History Endpoint (Empty)", success, details)
            return success
            
        except Exception as e:
            self.log_test("History Endpoint (Empty)", False, str(e))
            return False

    def test_image_analysis(self):
        """Test image analysis endpoint"""
        try:
            # Create test image
            img_base64 = self.create_test_image()
            
            # Create multipart form data
            files = {
                'file': ('test_pharma_ad.png', base64.b64decode(img_base64), 'image/png')
            }
            
            print("🔄 Starting image analysis (this may take 30-60 seconds)...")
            response = requests.post(f"{self.api_url}/analyze", files=files, timeout=120)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = [
                    'id', 'image_name', 'sano_score', 'score_tier',
                    'trust_factor', 'regulatory_visibility', 'cta_focus',
                    'ttff_medical_claims', 'aoi_brand_vs_visual', 'cognitive_load',
                    'before_analysis', 'after_recommendations', 'benchmark_comparison',
                    'doz_artirimi', 'yan_etkiler', 'tedavi_plani', 'created_at'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Store analysis ID for later tests
                    self.analysis_id = data['id']
                    
                    # Verify score ranges
                    score_valid = 0 <= data['sano_score'] <= 100
                    trust_valid = 0 <= data['trust_factor'] <= 100
                    reg_valid = 0 <= data['regulatory_visibility'] <= 100
                    cta_valid = 0 <= data['cta_focus'] <= 100
                    
                    # Verify Turkish content
                    turkish_content = any(word in data['before_analysis'].lower() for word in ['görsel', 'analiz', 'ilaç', 'reklam'])
                    
                    if not all([score_valid, trust_valid, reg_valid, cta_valid]):
                        success = False
                        details = "Score values out of range (0-100)"
                    elif not turkish_content:
                        success = False
                        details = "Analysis not in Turkish"
                    else:
                        details = f"SanoScore: {data['sano_score']}, Tier: {data['score_tier']}, ID: {data['id'][:8]}..."
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Image Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("Image Analysis", False, str(e))
            return False

    def test_get_specific_analysis(self):
        """Test getting a specific analysis by ID"""
        if not self.analysis_id:
            self.log_test("Get Specific Analysis", False, "No analysis ID available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/analysis/{self.analysis_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = data.get('id') == self.analysis_id
                details = f"Status: {response.status_code}, ID match: {success}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Get Specific Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Specific Analysis", False, str(e))
            return False

    def test_history_endpoint_with_data(self):
        """Test history endpoint after analysis"""
        try:
            response = requests.get(f"{self.api_url}/history", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = len(data) > 0 and isinstance(data, list)
                
                if success and len(data) > 0:
                    # Verify history item structure
                    item = data[0]
                    required_fields = ['id', 'image_name', 'sano_score', 'score_tier', 'created_at']
                    missing_fields = [field for field in required_fields if field not in item]
                    
                    if missing_fields:
                        success = False
                        details = f"Missing fields in history item: {missing_fields}"
                    else:
                        details = f"Status: {response.status_code}, History count: {len(data)}"
                else:
                    details = f"Status: {response.status_code}, Empty history"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("History Endpoint (With Data)", success, details)
            return success
            
        except Exception as e:
            self.log_test("History Endpoint (With Data)", False, str(e))
            return False

    def test_delete_analysis(self):
        """Test deleting an analysis"""
        if not self.analysis_id:
            self.log_test("Delete Analysis", False, "No analysis ID available")
            return False
            
        try:
            response = requests.delete(f"{self.api_url}/analysis/{self.analysis_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = data.get('id') == self.analysis_id
                details = f"Status: {response.status_code}, Deleted ID: {data.get('id', 'N/A')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Delete Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("Delete Analysis", False, str(e))
            return False

    def test_invalid_endpoints(self):
        """Test invalid endpoints return proper errors"""
        try:
            # Test non-existent analysis
            response = requests.get(f"{self.api_url}/analysis/invalid-id", timeout=10)
            success = response.status_code == 404
            
            details = f"Status: {response.status_code} (expected 404)"
            self.log_test("Invalid Analysis ID", success, details)
            return success
            
        except Exception as e:
            self.log_test("Invalid Analysis ID", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting SanoTracking.AI Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_history_endpoint_empty,
            self.test_image_analysis,
            self.test_get_specific_analysis,
            self.test_history_endpoint_with_data,
            self.test_delete_analysis,
            self.test_invalid_endpoints
        ]
        
        for test in tests:
            test()
            print()
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            return 1

def main():
    tester = SanoTrackingAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())