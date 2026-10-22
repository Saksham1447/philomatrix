from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, EmailStr


class InstitutionBase(BaseModel):
    name: str
    code: str
    slug: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo_url: Optional[str] = None


class InstitutionSettingResponse(BaseModel):
    min_attendance_threshold: Decimal
    allow_late_as_present: bool
    enable_parent_sms_alerts: bool
    report_card_template_id: str

    class Config:
        from_attributes = True


class InstitutionSettingUpdate(BaseModel):
    min_attendance_threshold: Optional[Decimal] = None
    allow_late_as_present: Optional[bool] = None
    enable_parent_sms_alerts: Optional[bool] = None
    report_card_template_id: Optional[str] = None



class InstitutionResponse(InstitutionBase):
    id: str
    status: str
    settings: Optional[InstitutionSettingResponse] = None

    class Config:
        from_attributes = True
