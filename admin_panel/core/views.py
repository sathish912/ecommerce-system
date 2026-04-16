from django.shortcuts import render

from django.http import JsonResponse
from .models import Order


def get_user_orders(request, user_id):
    orders = Order.objects.filter(user_id=user_id).order_by("-timestamp")

    data = []
    for o in orders:
        data.append({
            "id": o.id,
            "total": o.total,
            "status": o.order_status,
            "payment": o.payment_status,
            "date": o.timestamp,
        })

    return JsonResponse(data, safe=False)# Create your views here.
