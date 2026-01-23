from enum import Enum

class RoundName(Enum):
    PENDING = "pending"
    ASSESSMENT = "assessment"
    INTERVIEW1 = "interview1"
    INTERVIEW2 = "interview2"
    HR = "hr"
    HIRED = "hired"
    REJECTED = "rejected"