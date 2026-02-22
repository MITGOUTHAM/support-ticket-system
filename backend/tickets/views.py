from rest_framework import viewsets, filters
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ticket
from .serializers import TicketSerializer
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Count
from django.db.models.functions import TruncDate
import os
from openai import OpenAI
import json

@api_view(['POST'])
def classify_ticket(request):
    description = request.data.get("description")

    if not description:
        return Response({"error": "Description is required"}, status=400)

    try:
        print("GROQ KEY:", settings.GROQ_API_KEY)
        client = OpenAI(
            api_key=settings.GROQ_API_KEY,
             base_url="https://api.groq.com/openai/v1")

        prompt = f"""
        You are a support ticket classifier.

        Classify the ticket into:
        Category: billing, technical, account, general
        Priority: low, medium, high, critical

        Respond ONLY in JSON format:
        {{
            "category": "...",
            "priority": "..."
        }}

        Description:
        {description}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        content = response.choices[0].message.content.strip()
        parsed = json.loads(content)

        return Response({
            "suggested_category": parsed.get("category"),
            "suggested_priority": parsed.get("priority")
        })

    except Exception as e:
        print("GROQ ERROR:", str(e))
        return Response({
            "suggested_category": None,
            "suggested_priority": None,
            "error": "LLM unavailable"
        })



class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    filterset_fields = ['category', 'priority', 'status']
    search_fields = ['title', 'description']

    @action(detail=False, methods=['get'])
    def stats(self, request):
      queryset = Ticket.objects.all()

      total_tickets = queryset.count()
      open_tickets = queryset.filter(status='open').count()

    # Average tickets per day
      daily_counts = (
        queryset
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
      )

      if daily_counts:
          avg_tickets_per_day = sum(item['count'] for item in daily_counts) / len(daily_counts)
      else:
          avg_tickets_per_day = 0

    # Priority breakdown
      priority_data = queryset.values('priority').annotate(count=Count('id'))
      priority_breakdown = {item['priority']: item['count'] for item in priority_data}

    # Category breakdown
      category_data = queryset.values('category').annotate(count=Count('id'))
      category_breakdown = {item['category']: item['count'] for item in category_data}

      return Response({
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "avg_tickets_per_day": round(avg_tickets_per_day, 2),
        "priority_breakdown": priority_breakdown,
        "category_breakdown": category_breakdown,
    })

