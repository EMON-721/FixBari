"""
SSLCOMMERZ Payment Gateway Client

This module provides a client for integrating with the SSLCOMMERZ payment gateway,
Bangladesh's largest and most trusted payment gateway.

Supports:
- Card payments (Visa, Mastercard, Amex)
- Mobile banking (bKash, Nagad, Rocket, etc.)
- Internet banking
- Mobile wallets
"""

import hashlib
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class SSLCommerzEnvironment(Enum):
    """SSLCOMMERZ environment types"""

    SANDBOX = "sandbox"
    LIVE = "live"


@dataclass
class SSLCommerzConfig:
    """Configuration for SSLCOMMERZ client"""

    store_id: str
    store_password: str
    environment: SSLCommerzEnvironment = SSLCommerzEnvironment.SANDBOX

    @property
    def base_url(self) -> str:
        """Get base URL based on environment"""
        if self.environment == SSLCommerzEnvironment.SANDBOX:
            return "https://sandbox.sslcommerz.com"
        return "https://securepay.sslcommerz.com"

    @property
    def session_url(self) -> str:
        """URL for creating payment session"""
        return f"{self.base_url}/gwprocess/v4/api.php"

    @property
    def validation_url(self) -> str:
        """URL for validating transactions"""
        return f"{self.base_url}/validator/api/validationserverAPI.php"

    @property
    def transaction_query_url(self) -> str:
        """URL for querying transaction status"""
        return f"{self.base_url}/validator/api/merchantTransIDvalidationAPI.php"


class SSLCommerzError(Exception):
    """Custom exception for SSLCOMMERZ errors"""

    def __init__(self, message: str, code: Optional[str] = None, response: Optional[Dict] = None):
        super().__init__(message)
        self.code = code
        self.response = response


class SSLCommerzClient:
    """
    SSLCOMMERZ Payment Gateway Client

    Usage:
        client = get_sslcommerz_client()
        response = client.create_session(
            tran_id="UNIQUE-TRAN-ID",
            amount=1000.00,
            currency="BDT",
            ...
        )
        gateway_url = response.get("GatewayPageURL")
    """

    def __init__(self, config: SSLCommerzConfig):
        self.config = config
        self.timeout = 30  # seconds

    def create_session(
        self,
        tran_id: str,
        amount: float,
        currency: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        customer_address: str,
        customer_city: str,
        customer_postcode: str,
        customer_country: str,
        product_name: str,
        product_category: str,
        success_url: str,
        fail_url: str,
        cancel_url: str,
        ipn_url: str,
        shipping_method: str = "NO",
        product_profile: str = "general",
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Initialize a payment session with SSLCOMMERZ

        Args:
            tran_id: Unique transaction ID (max 30 chars)
            amount: Transaction amount
            currency: Currency code (BDT, USD, etc.)
            customer_name: Customer's full name
            customer_email: Customer's email address
            customer_phone: Customer's phone number
            customer_address: Customer's address
            customer_city: Customer's city
            customer_postcode: Customer's postal code
            customer_country: Customer's country
            product_name: Name of product/service
            product_category: Category of product/service
            success_url: URL to redirect on success
            fail_url: URL to redirect on failure
            cancel_url: URL to redirect on cancellation
            ipn_url: Instant Payment Notification URL
            shipping_method: Shipping method (NO, YES, COURIER)
            product_profile: Product profile (general, physical-goods, etc.)
            **kwargs: Additional parameters

        Returns:
            Dict containing status, GatewayPageURL, sessionkey, etc.

        Raises:
            SSLCommerzError: If session creation fails
        """
        payload = {
            "store_id": self.config.store_id,
            "store_passwd": self.config.store_password,
            "total_amount": amount,
            "currency": currency,
            "tran_id": tran_id,
            "success_url": success_url,
            "fail_url": fail_url,
            "cancel_url": cancel_url,
            "ipn_url": ipn_url,
            "cus_name": customer_name,
            "cus_email": customer_email,
            "cus_phone": customer_phone,
            "cus_add1": customer_address,
            "cus_city": customer_city,
            "cus_postcode": customer_postcode,
            "cus_country": customer_country,
            "shipping_method": shipping_method,
            "product_name": product_name,
            "product_category": product_category,
            "product_profile": product_profile,
        }

        # Add any additional parameters
        payload.update(kwargs)

        logger.info(f"Creating SSLCOMMERZ session for tran_id: {tran_id}")

        try:
            response = requests.post(
                self.config.session_url,
                data=payload,
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "SUCCESS":
                error_msg = data.get("failedreason", "Session creation failed")
                logger.error(f"SSLCOMMERZ session creation failed: {error_msg}")
                raise SSLCommerzError(error_msg, response=data)

            logger.info(f"SSLCOMMERZ session created successfully for tran_id: {tran_id}")
            return data

        except requests.RequestException as e:
            logger.error(f"SSLCOMMERZ request error: {str(e)}")
            raise SSLCommerzError(f"Request failed: {str(e)}")

    def validate_transaction(self, val_id: str) -> Dict[str, Any]:
        """
        Validate a transaction using the validation ID from IPN

        Args:
            val_id: Validation ID received from SSLCOMMERZ IPN

        Returns:
            Dict containing validation response with status, amount, etc.

        Raises:
            SSLCommerzError: If validation fails
        """
        params = {
            "val_id": val_id,
            "store_id": self.config.store_id,
            "store_passwd": self.config.store_password,
            "format": "json",
        }

        logger.info(f"Validating SSLCOMMERZ transaction with val_id: {val_id}")

        try:
            response = requests.get(
                self.config.validation_url,
                params=params,
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()

            logger.info(f"SSLCOMMERZ validation response status: {data.get('status')}")
            return data

        except requests.RequestException as e:
            logger.error(f"SSLCOMMERZ validation error: {str(e)}")
            raise SSLCommerzError(f"Validation request failed: {str(e)}")

    def query_transaction(self, tran_id: str) -> Dict[str, Any]:
        """
        Query transaction status by transaction ID

        Args:
            tran_id: Transaction ID to query

        Returns:
            Dict containing transaction status and details

        Raises:
            SSLCommerzError: If query fails
        """
        params = {
            "tran_id": tran_id,
            "store_id": self.config.store_id,
            "store_passwd": self.config.store_password,
            "format": "json",
        }

        logger.info(f"Querying SSLCOMMERZ transaction: {tran_id}")

        try:
            response = requests.get(
                self.config.transaction_query_url,
                params=params,
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()

            logger.info(f"SSLCOMMERZ query response for {tran_id}: {data.get('status')}")
            return data

        except requests.RequestException as e:
            logger.error(f"SSLCOMMERZ query error: {str(e)}")
            raise SSLCommerzError(f"Query request failed: {str(e)}")

    def verify_ipn_hash(self, ipn_data: Dict[str, Any]) -> bool:
        """
        Verify the hash from IPN callback to ensure authenticity

        Args:
            ipn_data: Dictionary containing IPN callback data

        Returns:
            True if hash verification passes, False otherwise
        """
        verify_key = ipn_data.get("verify_key", "")
        verify_sign = ipn_data.get("verify_sign", "")

        if not verify_key or not verify_sign:
            logger.warning("IPN data missing verify_key or verify_sign")
            return False

        # Build verification string from keys
        keys = verify_key.split(",")
        data_to_hash = ""
        for key in keys:
            if key in ipn_data:
                data_to_hash += f"{key}={ipn_data[key]}&"

        data_to_hash = data_to_hash.rstrip("&")

        # Generate MD5 hash
        generated_hash = hashlib.md5(data_to_hash.encode()).hexdigest()

        is_valid = generated_hash == verify_sign
        if not is_valid:
            logger.warning(f"IPN hash verification failed for tran_id: {ipn_data.get('tran_id')}")

        return is_valid

    def verify_amount(self, expected_amount: float, received_amount: float, tolerance: float = 0.01) -> bool:
        """
        Verify that the received amount matches the expected amount

        Args:
            expected_amount: The amount that was expected
            received_amount: The amount received from SSLCOMMERZ
            tolerance: Allowed difference (default 0.01 for floating point precision)

        Returns:
            True if amounts match within tolerance, False otherwise
        """
        return abs(float(expected_amount) - float(received_amount)) <= tolerance


def get_sslcommerz_client() -> SSLCommerzClient:
    """
    Factory function to get configured SSLCOMMERZ client

    Reads configuration from Django settings:
        - SSLCOMMERZ_STORE_ID
        - SSLCOMMERZ_STORE_PASSWORD
        - SSLCOMMERZ_ENVIRONMENT (sandbox or live)

    Returns:
        Configured SSLCommerzClient instance
    """
    store_id = getattr(settings, "SSLCOMMERZ_STORE_ID", "")
    store_password = getattr(settings, "SSLCOMMERZ_STORE_PASSWORD", "")
    environment_str = getattr(settings, "SSLCOMMERZ_ENVIRONMENT", "sandbox")

    if not store_id or not store_password:
        raise SSLCommerzError("SSLCOMMERZ credentials not configured")

    try:
        environment = SSLCommerzEnvironment(environment_str)
    except ValueError:
        environment = SSLCommerzEnvironment.SANDBOX

    config = SSLCommerzConfig(
        store_id=store_id,
        store_password=store_password,
        environment=environment,
    )

    return SSLCommerzClient(config)
