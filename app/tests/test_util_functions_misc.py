########### EXTERNAL IMPORTS ############

import pytest
from typing import List, Optional
from cryptography.fernet import Fernet

#########################################

############# LOCAL IMPORTS #############

import util.functions.generic as generic
import util.functions.objects as objects
import util.functions.auth as auth
from model.controller.node import NodeType

#########################################


###############     G E N E R I C     ###############


def test_generate_random_number_within_bounds():
    for _ in range(50):
        value = generic.generate_random_number(1, 5)
        assert 1 <= value <= 5


def test_generate_random_number_default_bounds():
    value = generic.generate_random_number()
    assert 0 <= value <= 100000


###############     O B J E C T S     ###############


def test_require_env_variable_returns_value(monkeypatch):
    monkeypatch.setenv("SOME_TEST_VAR", "hello")
    assert objects.require_env_variable("SOME_TEST_VAR") == "hello"


def test_require_env_variable_missing_raises_key_error(monkeypatch):
    monkeypatch.delenv("MISSING_TEST_VAR", raising=False)
    with pytest.raises(KeyError):
        objects.require_env_variable("MISSING_TEST_VAR")


def test_convert_str_to_enum_valid_name():
    assert objects.convert_str_to_enum("FLOAT", NodeType) == NodeType.FLOAT


def test_convert_str_to_enum_invalid_name_raises_value_error():
    with pytest.raises(ValueError):
        objects.convert_str_to_enum("NOT_A_TYPE", NodeType)


def test_resolve_type_returns_origin_for_generics():
    assert objects.resolve_type(List[int]) is list
    assert objects.resolve_type(Optional[int]) is not None  # Union origin


def test_resolve_type_returns_plain_type_unchanged():
    assert objects.resolve_type(int) is int
    assert objects.resolve_type(str) is str


@pytest.mark.parametrize(
    "value,expected",
    [
        ("TRUE", True),
        ("true", True),
        ("True", True),
        ("FALSE", False),
        ("random", False),
        (None, False),
        ("", False),
    ],
)
def test_check_bool_str(value, expected):
    assert objects.check_bool_str(value) is expected


###############     A U T H     ###############


def test_decrypt_password_roundtrip():
    key = Fernet.generate_key().decode()
    encrypted = Fernet(key.encode()).encrypt(b"my-secret-password").decode()
    assert auth.decrypt_password(encrypted, key) == "my-secret-password"


def test_decrypt_password_wrong_key_raises():
    key = Fernet.generate_key().decode()
    other_key = Fernet.generate_key().decode()
    encrypted = Fernet(key.encode()).encrypt(b"my-secret-password").decode()
    with pytest.raises(Exception):
        auth.decrypt_password(encrypted, other_key)
