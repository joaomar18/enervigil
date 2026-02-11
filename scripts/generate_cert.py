import os
import ipaddress
from pathlib import Path
from datetime import datetime, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

CERT_DIR = Path("/cert")
CA_DIR = CERT_DIR / "ca"

SERVER_KEY = CERT_DIR / "enervigil.key"
SERVER_CERT = CERT_DIR / "enervigil.crt"
CA_KEY = CA_DIR / "enervigil-ca.key"
CA_CERT = CA_DIR / "enervigil-ca.crt"

VALIDITY_DAYS = 7300  # 20 years
HOSTNAME = os.getenv("DEVICE_HOSTNAME")


def write_key(path, key):
    path.write_bytes(
        key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )


def write_cert(path, cert):
    path.write_bytes(cert.public_bytes(serialization.Encoding.PEM))


def generate():
    CERT_DIR.mkdir(parents=True, exist_ok=True)
    CA_DIR.mkdir(parents=True, exist_ok=True)

    if SERVER_KEY.exists() and SERVER_CERT.exists():
        print("Certificate already exist — skipping.")
        return

    print("Generating CA key...")
    ca_key = rsa.generate_private_key(public_exponent=65537, key_size=4096)

    ca_subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "ENERVIGIL-CA")])

    ca_cert = (
        x509.CertificateBuilder()
        .subject_name(ca_subject)
        .issuer_name(ca_subject)
        .public_key(ca_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.now())
        .not_valid_after(datetime.now() + timedelta(days=VALIDITY_DAYS))
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .sign(ca_key, hashes.SHA256())
    )

    write_key(CA_KEY, ca_key)
    write_cert(CA_CERT, ca_cert)

    print("Generating server key...")
    server_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "ENERVIGIL")])

    san_entries = [
        x509.DNSName("localhost"),
        x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
    ]

    if HOSTNAME:
        try:
            san_entries.append(x509.IPAddress(ipaddress.IPv4Address(HOSTNAME)))
        except ValueError:
            san_entries.append(x509.DNSName(HOSTNAME))

    san = x509.SubjectAlternativeName(san_entries)

    server_cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(ca_cert.subject)
        .public_key(server_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.now())
        .not_valid_after(datetime.now() + timedelta(days=VALIDITY_DAYS))
        .add_extension(san, critical=False)
        .sign(ca_key, hashes.SHA256())
    )

    write_key(SERVER_KEY, server_key)
    write_cert(SERVER_CERT, server_cert)

    print("Certificates generated successfully.")


generate()
