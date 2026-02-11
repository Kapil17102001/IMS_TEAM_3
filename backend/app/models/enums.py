from enum import Enum

class RoundName(Enum):
    ASSESSMENT = "assessment"
    INTERVIEW1 = "interview1"
    INTERVIEW2 = "interview2"
    HR = "hr"
    HIRED = "hired"
    REJECTED = "rejected"
    ONBOARDED = "onboarded"

class FileUploadStatus(Enum):
    VERIFIED = "verified"
    PENDING = "pending"
    REJECTED = "rejected"
    
class FileType(Enum):
    AADHAR = "aadhaar"
    PAN_CARD = "pan_card"
    MATRICULATION_CERTIFICATE = "marticulation_certificate"  
    INTERMEDIATE_CERTIFICATE = "intermediate_certificate"  
    DEGREE_CERTIFICATE = "degree_certificate"