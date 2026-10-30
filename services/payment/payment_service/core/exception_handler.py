from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "success": False,
                "error": {
                    "code": exc.__class__.__name__.upper(),
                    "message": str(exc.detail) if hasattr(exc, "detail") else str(exc),
                },
            },
            status=response.status_code,
        )

    return Response(
        {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            },
        },
        status=500,
    )
