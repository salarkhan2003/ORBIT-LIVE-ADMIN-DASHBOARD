import requests
import sys
from datetime import datetime
import json

class FleetDashboardAPITester:
    def __init__(self, base_url="https://bustrack-admin.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Response text: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.failed_tests.append(f"{name}: Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            self.failed_tests.append(f"{name}: Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "api/", 200)

    def test_create_status_check(self):
        """Test creating a status check"""
        test_data = {
            "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
        }
        success, response = self.run_test(
            "Create Status Check",
            "POST", 
            "api/status",
            200,
            data=test_data
        )
        return response.get('id') if success else None

    def test_get_status_checks(self):
        """Test getting all status checks"""
        success, response = self.run_test(
            "Get Status Checks",
            "GET",
            "api/status", 
            200
        )
        return success

def main():
    print("🚀 Starting Fleet Dashboard API Tests...")
    print("=" * 50)
    
    # Setup
    tester = FleetDashboardAPITester()
    
    # Test basic connectivity
    print("\n📡 Testing API Connectivity...")
    root_success, _ = tester.test_root_endpoint()
    
    if not root_success:
        print("❌ Root endpoint failed - API may be down")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        if tester.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in tester.failed_tests:
                print(f"  - {failure}")
        return 1
    
    # Test status check creation
    print("\n📝 Testing Status Check Creation...")
    status_id = tester.test_create_status_check()
    
    # Test status check retrieval
    print("\n📋 Testing Status Check Retrieval...")
    tester.test_get_status_checks()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"  - {failure}")
    else:
        print("✅ All API tests passed!")
    
    print("\n🎯 Backend API Status: " + ("HEALTHY" if tester.tests_passed == tester.tests_run else "ISSUES DETECTED"))
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())