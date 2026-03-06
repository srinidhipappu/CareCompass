# CareCompass Backend Architecture (Hackathon)

```
                    USER
                     │
                     ▼
               React Frontend
                     │
                     ▼
              Express Backend API
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
   AI Symptom     MongoDB      Auth Service
   Analysis        Database
        │            │
        ▼            ▼
 HuggingFace    Hospitals
 NLP Model      Doctors
                Appointments
```

## Pipeline

1. User enters symptoms in the frontend.
2. Frontend POSTs to `POST /api/ai/analyze` on the Express backend.
3. Backend calls the AI Symptom Analysis service (stub or real LLM) which predicts a medical specialization and urgency.
4. Backend queries MongoDB for hospitals and doctors matching the predicted specialization.
5. Backend returns recommended hospitals and doctors to the frontend; user may then book an appointment via `/api/appointments`.

This layout is intentionally simple for a demo: the AI can be swapped for an external LLM (HuggingFace, OpenAI) and the Auth Service can be expanded later.
