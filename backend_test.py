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
        self.analysis_id_a = None
        self.analysis_id_b = None

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

    def test_create_analysis_for_ab(self, name="A"):
        """Create an analysis for A/B testing"""
        try:
            # Create test image
            img_base64 = self.create_test_image()
            
            # Create multipart form data
            files = {
                'file': (f'test_pharma_ad_{name}.png', base64.b64decode(img_base64), 'image/png')
            }
            
            print(f"🔄 Creating analysis {name} for A/B test (this may take 30-60 seconds)...")
            response = requests.post(f"{self.api_url}/analyze", files=files, timeout=120)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                analysis_id = data.get('id')
                
                if name == "A":
                    self.analysis_id_a = analysis_id
                else:
                    self.analysis_id_b = analysis_id
                
                details = f"Created analysis {name} with ID: {analysis_id[:8]}..., Score: {data.get('sano_score')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test(f"Create Analysis {name} for A/B", success, details)
            return success
            
        except Exception as e:
            self.log_test(f"Create Analysis {name} for A/B", False, str(e))
            return False

    def test_ab_comparison(self):
        """Test A/B comparison endpoint"""
        if not self.analysis_id_a or not self.analysis_id_b:
            self.log_test("A/B Comparison", False, "Missing analysis IDs for A/B test")
            return False
            
        try:
            payload = {
                "analysis_id_a": self.analysis_id_a,
                "analysis_id_b": self.analysis_id_b
            }
            
            print("🔄 Running A/B comparison (this may take 10-20 seconds for AI summary)...")
            response = requests.post(f"{self.api_url}/compare", json=payload, timeout=60)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['winner', 'score_difference', 'analysis_a', 'analysis_b', 'comparison_summary', 'metric_comparisons']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Verify winner is valid
                    winner_valid = data['winner'] in ['A', 'B', 'TIE']
                    
                    # Verify metric_comparisons is a list
                    metrics_valid = isinstance(data['metric_comparisons'], list) and len(data['metric_comparisons']) > 0
                    
                    # Verify comparison_summary is not empty
                    summary_valid = len(data['comparison_summary']) > 0
                    
                    if not all([winner_valid, metrics_valid, summary_valid]):
                        success = False
                        details = f"Invalid data: winner={winner_valid}, metrics={metrics_valid}, summary={summary_valid}"
                    else:
                        details = f"Winner: {data['winner']}, Score Diff: {data['score_difference']}, Metrics: {len(data['metric_comparisons'])}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("A/B Comparison", success, details)
            return success
            
        except Exception as e:
            self.log_test("A/B Comparison", False, str(e))
            return False

    def test_competitor_benchmark(self):
        """Test competitor benchmark endpoint"""
        if not self.analysis_id_a:
            self.log_test("Competitor Benchmark", False, "No analysis ID available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/competitor-benchmark/{self.analysis_id_a}", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['analysis_score', 'competitors', 'ranking', 'percentile', 'summary']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Verify competitors list
                    competitors_valid = isinstance(data['competitors'], list) and len(data['competitors']) == 10
                    
                    # Verify ranking is valid
                    ranking_valid = 1 <= data['ranking'] <= 11
                    
                    # Verify percentile is valid
                    percentile_valid = 0 <= data['percentile'] <= 100
                    
                    if not all([competitors_valid, ranking_valid, percentile_valid]):
                        success = False
                        details = f"Invalid data: competitors={competitors_valid}, ranking={ranking_valid}, percentile={percentile_valid}"
                    else:
                        details = f"Score: {data['analysis_score']}, Ranking: #{data['ranking']}, Percentile: {data['percentile']}%, Competitors: {len(data['competitors'])}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Competitor Benchmark", success, details)
            return success
            
        except Exception as e:
            self.log_test("Competitor Benchmark", False, str(e))
            return False

    # ========== NEW FEATURE TESTS ==========
    
    def test_batch_upload(self):
        """Test batch upload endpoint"""
        try:
            # Create 3 test images
            files_list = []
            for i in range(3):
                img_base64 = self.create_test_image()
                files_list.append(('files', (f'batch_test_{i}.png', base64.b64decode(img_base64), 'image/png')))
            
            print("🔄 Testing batch upload with 3 images (this may take 60-90 seconds)...")
            response = requests.post(f"{self.api_url}/analyze-batch", files=files_list, timeout=180)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['successful', 'failed', 'total', 'success_count', 'fail_count']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Verify counts
                    total_valid = data['total'] == 3
                    success_valid = data['success_count'] >= 0
                    fail_valid = data['fail_count'] >= 0
                    sum_valid = data['success_count'] + data['fail_count'] == data['total']
                    
                    if not all([total_valid, success_valid, fail_valid, sum_valid]):
                        success = False
                        details = f"Invalid counts: total={data['total']}, success={data['success_count']}, fail={data['fail_count']}"
                    else:
                        details = f"Total: {data['total']}, Success: {data['success_count']}, Failed: {data['fail_count']}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Batch Upload", success, details)
            return success
            
        except Exception as e:
            self.log_test("Batch Upload", False, str(e))
            return False

    def test_trends_endpoint(self):
        """Test trends endpoint"""
        try:
            response = requests.get(f"{self.api_url}/trends", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['data_points', 'overall_trend', 'avg_improvement', 'total_analyses']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Verify data_points is a list
                    data_points_valid = isinstance(data['data_points'], list)
                    
                    # Verify overall_trend is valid
                    trend_valid = data['overall_trend'] in ['improving', 'declining', 'stable']
                    
                    # Verify total_analyses is a number
                    total_valid = isinstance(data['total_analyses'], int) and data['total_analyses'] >= 0
                    
                    if not all([data_points_valid, trend_valid, total_valid]):
                        success = False
                        details = f"Invalid data: data_points={data_points_valid}, trend={trend_valid}, total={total_valid}"
                    else:
                        details = f"Trend: {data['overall_trend']}, Improvement: {data['avg_improvement']}, Total: {data['total_analyses']}, Data Points: {len(data['data_points'])}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Trends Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Trends Endpoint", False, str(e))
            return False

    def test_stats_endpoint(self):
        """Test stats endpoint"""
        try:
            response = requests.get(f"{self.api_url}/stats", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['total_analyses', 'distribution', 'averages']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Verify distribution has required keys
                    dist_keys = ['critical', 'borderline', 'successful', 'excellent']
                    dist_valid = all(key in data['distribution'] for key in dist_keys)
                    
                    # Verify averages has required keys
                    avg_keys = ['sano_score', 'trust_factor', 'regulatory', 'cta_focus']
                    avg_valid = all(key in data['averages'] for key in avg_keys)
                    
                    if not all([dist_valid, avg_valid]):
                        success = False
                        details = f"Invalid structure: distribution={dist_valid}, averages={avg_valid}"
                    else:
                        details = f"Total: {data['total_analyses']}, Avg Score: {data['averages']['sano_score']}, Excellent: {data['distribution']['excellent']}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Stats Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Stats Endpoint", False, str(e))
            return False

    def test_create_team(self):
        """Test creating a team"""
        try:
            payload = {
                "name": "Test Team",
                "description": "A test team for API testing"
            }
            
            response = requests.post(f"{self.api_url}/teams", json=payload, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['id', 'name', 'message']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Store team ID for later tests
                    self.team_id = data['id']
                    details = f"Team created with ID: {data['id'][:8]}..., Name: {data['name']}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Create Team", success, details)
            return success
            
        except Exception as e:
            self.log_test("Create Team", False, str(e))
            return False

    def test_get_teams(self):
        """Test getting all teams"""
        try:
            response = requests.get(f"{self.api_url}/teams", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify it's a list
                list_valid = isinstance(data, list)
                
                if not list_valid:
                    success = False
                    details = "Response is not a list"
                else:
                    details = f"Teams count: {len(data)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Get Teams", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Teams", False, str(e))
            return False

    def test_add_team_member(self):
        """Test adding a member to a team"""
        if not hasattr(self, 'team_id'):
            self.log_test("Add Team Member", False, "No team ID available")
            return False
            
        try:
            payload = {
                "name": "Test Member",
                "email": "test@example.com",
                "role": "viewer"
            }
            
            response = requests.post(f"{self.api_url}/teams/{self.team_id}/members", json=payload, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify required fields
                required_fields = ['message', 'member']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    # Store member ID for later tests
                    self.member_id = data['member']['id']
                    details = f"Member added: {data['member']['name']}, Role: {data['member']['role']}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Add Team Member", success, details)
            return success
            
        except Exception as e:
            self.log_test("Add Team Member", False, str(e))
            return False

    def test_share_analyses_with_team(self):
        """Test sharing analyses with a team"""
        if not hasattr(self, 'team_id') or not self.analysis_id_a:
            self.log_test("Share Analyses with Team", False, "Missing team ID or analysis ID")
            return False
            
        try:
            payload = {
                "analysis_ids": [self.analysis_id_a]
            }
            
            response = requests.post(f"{self.api_url}/teams/{self.team_id}/share", json=payload, timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify message field
                message_valid = 'message' in data
                
                if not message_valid:
                    success = False
                    details = "Missing message field"
                else:
                    details = f"Message: {data['message']}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Share Analyses with Team", success, details)
            return success
            
        except Exception as e:
            self.log_test("Share Analyses with Team", False, str(e))
            return False

    def test_get_team_analyses(self):
        """Test getting analyses shared with a team"""
        if not hasattr(self, 'team_id'):
            self.log_test("Get Team Analyses", False, "No team ID available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/teams/{self.team_id}/analyses", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify it's a list
                list_valid = isinstance(data, list)
                
                if not list_valid:
                    success = False
                    details = "Response is not a list"
                else:
                    details = f"Shared analyses count: {len(data)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Get Team Analyses", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Team Analyses", False, str(e))
            return False

    def test_delete_team(self):
        """Test deleting a team"""
        if not hasattr(self, 'team_id'):
            self.log_test("Delete Team", False, "No team ID available")
            return False
            
        try:
            response = requests.delete(f"{self.api_url}/teams/{self.team_id}", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                
                # Verify message field
                message_valid = 'message' in data
                
                if not message_valid:
                    success = False
                    details = "Missing message field"
                else:
                    details = f"Message: {data['message']}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Delete Team", success, details)
            return success
            
        except Exception as e:
            self.log_test("Delete Team", False, str(e))
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
            self.test_invalid_endpoints,
            # A/B Test and Competitor Benchmark tests
            lambda: self.test_create_analysis_for_ab("A"),
            lambda: self.test_create_analysis_for_ab("B"),
            self.test_ab_comparison,
            self.test_competitor_benchmark,
            # NEW FEATURE TESTS
            self.test_batch_upload,
            self.test_trends_endpoint,
            self.test_stats_endpoint,
            self.test_create_team,
            self.test_get_teams,
            self.test_add_team_member,
            self.test_share_analyses_with_team,
            self.test_get_team_analyses,
            self.test_delete_team
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