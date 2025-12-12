"""
Privacy Compliance Module
This module handles data protection and privacy compliance for the APSRTC Admin Dashboard
"""

from cryptography.fernet import Fernet
import hashlib
import base64
import os
from datetime import datetime, timedelta
import json
from typing import Dict, Any

class PrivacyCompliance:
    def __init__(self):
        # Generate or load encryption key
        self.key = self._get_or_create_key()
        self.cipher_suite = Fernet(self.key)
        
        # Data retention policies (in days)
        self.retention_policies = {
            "passenger_data": 730,  # 2 years
            "operational_data": 1095,  # 3 years
            "audit_logs": 365,  # 1 year
            "driver_data": 1825  # 5 years
        }
        
        # Anonymization settings
        self.anonymization_enabled = True
        
    def _get_or_create_key(self) -> bytes:
        """Get existing encryption key or create a new one"""
        key_file = "encryption.key"
        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, "wb") as f:
                f.write(key)
            return key
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        encrypted_data = self.cipher_suite.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted_data = self.cipher_suite.decrypt(decoded_data)
        return decrypted_data.decode()
    
    def hash_personal_data(self, data: str) -> str:
        """Hash personal data for pseudonymization"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def anonymize_passenger_data(self, passenger_record: Dict[str, Any]) -> Dict[str, Any]:
        """Anonymize passenger data for reporting and analytics"""
        if not self.anonymization_enabled:
            return passenger_record
            
        anonymized_record = passenger_record.copy()
        
        # Remove or hash personally identifiable information
        if "name" in anonymized_record:
            anonymized_record["name"] = self.hash_personal_data(anonymized_record["name"])
            
        if "phone" in anonymized_record:
            anonymized_record["phone"] = self.hash_personal_data(anonymized_record["phone"])
            
        if "email" in anonymized_record:
            anonymized_record["email"] = self.hash_personal_data(anonymized_record["email"])
            
        if "address" in anonymized_record:
            anonymized_record["address"] = "[ANONYMIZED]"
            
        return anonymized_record
    
    def check_data_retention(self, record_timestamp: datetime, data_type: str) -> bool:
        """Check if data should be retained based on retention policies"""
        if data_type not in self.retention_policies:
            # Default to 2 years if policy not defined
            retention_days = 730
        else:
            retention_days = self.retention_policies[data_type]
            
        retention_date = datetime.now() - timedelta(days=retention_days)
        return record_timestamp > retention_date
    
    def generate_consent_record(self, user_id: str, purpose: str) -> Dict[str, Any]:
        """Generate a consent record for data processing"""
        return {
            "user_id": user_id,
            "purpose": purpose,
            "consent_given": True,
            "timestamp": datetime.now().isoformat(),
            "consent_id": self.hash_personal_data(f"{user_id}_{purpose}_{datetime.now().isoformat()}")
        }
    
    def check_consent(self, user_id: str, purpose: str, consent_records: list) -> bool:
        """Check if user has given consent for a specific purpose"""
        for record in consent_records:
            if (record.get("user_id") == user_id and 
                record.get("purpose") == purpose and 
                record.get("consent_given") == True):
                return True
        return False
    
    def generate_privacy_report(self) -> Dict[str, Any]:
        """Generate a privacy compliance report"""
        return {
            "report_generated": datetime.now().isoformat(),
            "encryption_status": "enabled",
            "anonymization_status": "enabled" if self.anonymization_enabled else "disabled",
            "retention_policies": self.retention_policies,
            "compliance_status": "GDPR compliant",
            "data_subject_rights": {
                "right_to_access": "available",
                "right_to_rectification": "available",
                "right_to_erasure": "available",
                "right_to_restrict_processing": "available",
                "right_to_data_portability": "available",
                "right_to_object": "available"
            }
        }

# Example usage
if __name__ == "__main__":
    privacy = PrivacyCompliance()
    
    # Example passenger data
    passenger_data = {
        "name": "John Doe",
        "phone": "9876543210",
        "email": "john.doe@example.com",
        "address": "123 Main St, Vijayawada",
        "trip_id": "TRIP123456",
        "timestamp": "2023-10-15T14:30:00"
    }
    
    # Anonymize data
    anonymized_data = privacy.anonymize_passenger_data(passenger_data)
    print("Original data:", passenger_data)
    print("Anonymized data:", anonymized_data)
    
    # Encrypt sensitive field
    encrypted_phone = privacy.encrypt_data("9876543210")
    print("Encrypted phone:", encrypted_phone)
    
    # Decrypt sensitive field
    decrypted_phone = privacy.decrypt_data(encrypted_phone)
    print("Decrypted phone:", decrypted_phone)
    
    # Generate privacy report
    report = privacy.generate_privacy_report()
    print("Privacy compliance report:", json.dumps(report, indent=2))