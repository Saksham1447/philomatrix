import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.core.security import get_password_hash, verify_password
from app.main import app
from app.models.institution import Institution
from app.models.user import User
from app.seeds.seed_demo import run_seed

client = TestClient(app)
LOGIN_URL = "/api/v1/auth/login"
INVALID_CREDENTIALS_DETAIL = "Incorrect username/email or password"

ROYAL_PRINCIPAL = "principal@royalscience.edu"
APEX_PRINCIPAL = "principal@apexcollege.edu"
ADMISSIONS = "admissions@royalscience.edu"
PHYSICS_FACULTY = "physics.prof@royalscience.edu"
SUPERADMIN = "superadmin@philomatrix.local"

DEMO_PASSWORDS = {
    SUPERADMIN: "Philomatrix@2026",
    ROYAL_PRINCIPAL: "Royal@Principal2026",
    APEX_PRINCIPAL: "Apex@Principal2026",
    ADMISSIONS: "Staff@Pass2026",
    PHYSICS_FACULTY: "Faculty@Pass2026",
}


@pytest.fixture
def login_user():
    """Create a throwaway user for login tests and remove it afterwards."""
    suffix = uuid.uuid4().hex[:8]
    password = "Temp@Login" + suffix
    db = SessionLocal()
    user = User(
        username=f"login_test_{suffix}",
        email=f"login_test_{suffix}@example.com",
        password_hash=get_password_hash(password),
        first_name="Login",
        last_name="Tester",
        is_active=True,
    )
    db.add(user)
    db.commit()
    user_id = user.id
    info = {"username": user.username, "email": user.email, "password": password}
    db.close()

    yield info

    db = SessionLocal()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    db.close()


@pytest.fixture(scope="module")
def seeded_db():
    run_seed()


def _login(identifier, password):
    return client.post(LOGIN_URL, json={"username_or_email": identifier, "password": password})


# --- Password hashing ---------------------------------------------------------

def test_password_hash_is_not_plaintext_and_verifies():
    hashed = get_password_hash("Sample@123")
    assert hashed != "Sample@123"
    assert verify_password("Sample@123", hashed)
    assert not verify_password("Sample@124", hashed)


def test_password_hash_is_salted():
    assert get_password_hash("Same@Pass1") != get_password_hash("Same@Pass1")


# --- Login endpoint -----------------------------------------------------------

def test_login_success_with_email(login_user):
    res = _login(login_user["email"], login_user["password"])
    assert res.status_code == 200
    body = res.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"


def test_login_success_with_username(login_user):
    res = _login(login_user["username"], login_user["password"])
    assert res.status_code == 200
    assert res.json()["access_token"]


def test_login_tolerates_surrounding_whitespace_and_email_case(login_user):
    identifier = f"  {login_user['email'].upper()}  "
    res = _login(identifier, login_user["password"])
    assert res.status_code == 200


def test_login_wrong_password_is_rejected(login_user):
    res = _login(login_user["email"], "Wrong@Password1")
    assert res.status_code == 401
    assert res.json()["detail"] == INVALID_CREDENTIALS_DETAIL


def test_login_nonexistent_email_is_rejected():
    res = _login("nobody_here_" + uuid.uuid4().hex[:8] + "@example.com", "Any@Password1")
    assert res.status_code == 401
    assert res.json()["detail"] == INVALID_CREDENTIALS_DETAIL


def test_login_inactive_user_is_forbidden(login_user):
    db = SessionLocal()
    db.query(User).filter(User.email == login_user["email"]).update({"is_active": False})
    db.commit()
    db.close()

    res = _login(login_user["email"], login_user["password"])
    assert res.status_code == 403


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"username_or_email": "someone@example.com"},
        {"password": "Only@Password1"},
    ],
)
def test_login_missing_fields_are_rejected(payload):
    res = client.post(LOGIN_URL, json=payload)
    assert res.status_code == 422


# --- Demo account seeding -----------------------------------------------------

def test_seed_creates_demo_accounts_with_expected_passwords(seeded_db):
    db = SessionLocal()
    try:
        for email, password in DEMO_PASSWORDS.items():
            user = db.query(User).filter(User.email == email).first()
            assert user is not None, f"Demo account missing: {email}"
            assert verify_password(password, user.password_hash), f"Hash mismatch for {email}"
    finally:
        db.close()


def test_seed_is_idempotent_and_keeps_existing_passwords(seeded_db):
    db = SessionLocal()
    count_before = db.query(User).count()
    hash_before = db.query(User.password_hash).filter(User.email == ROYAL_PRINCIPAL).scalar()
    db.close()

    run_seed()

    db = SessionLocal()
    try:
        assert db.query(User).count() == count_before
        hash_after = db.query(User.password_hash).filter(User.email == ROYAL_PRINCIPAL).scalar()
        assert hash_after == hash_before
    finally:
        db.close()


def test_demo_accounts_have_correct_tenant_and_roles(seeded_db):
    db = SessionLocal()
    try:
        royal = db.query(Institution).filter(Institution.code == "RJCS-001").first()
        apex = db.query(Institution).filter(Institution.code == "APEX-002").first()
        assert royal is not None and apex is not None

        def roles_of(email):
            user = db.query(User).filter(User.email == email).first()
            assert user is not None, f"Demo account missing: {email}"
            return user, sorted(a.role.name for a in user.role_assignments)

        royal_principal, roles = roles_of(ROYAL_PRINCIPAL)
        assert royal_principal.institution_id == royal.id
        assert "PRINCIPAL" in roles

        apex_principal, roles = roles_of(APEX_PRINCIPAL)
        assert apex_principal.institution_id == apex.id
        assert "PRINCIPAL" in roles

        admissions, roles = roles_of(ADMISSIONS)
        assert admissions.institution_id == royal.id
        assert "OFFICE_STAFF" in roles

        faculty, roles = roles_of(PHYSICS_FACULTY)
        assert faculty.institution_id == royal.id
        assert "FACULTY" in roles

        _, roles = roles_of(SUPERADMIN)
        assert "SUPER_ADMIN" in roles
    finally:
        db.close()
