# Elder Companion AI - Backend

FastAPI backend for Elder Companion AI elderly care platform.

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (local or Railway)

### Local Development

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
- Copy `.env.example` to `.env`
- Update with your API keys and database URL

4. **Run database migrations:**
```bash
alembic upgrade head
```

5. **Start development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or run directly:
```bash
python -m app.main
```

6. **Access API documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── core/                # Configuration and security
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── api/v1/              # API route handlers
│   ├── services/            # Business logic
│   ├── database/            # Database session
│   └── utils/               # Utilities
├── alembic/                 # Database migrations
├── tests/                   # Test suite
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (gitignored)
└── railway.json             # Railway deployment config
```

## Database Migrations

### Create new migration:
```bash
alembic revision --autogenerate -m "description"
```

### Apply migrations:
```bash
alembic upgrade head
```

### Rollback:
```bash
alembic downgrade -1
```

## Testing

Run tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register caregiver
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Patients
- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/{id}` - Get patient
- `PUT /api/v1/patients/{id}` - Update patient
- `DELETE /api/v1/patients/{id}` - Delete patient

### Conversations
- `POST /api/v1/conversations/patient` - Submit patient message
- `GET /api/v1/conversations/{patient_id}` - Get conversations
- `POST /api/v1/conversations/search` - Semantic search (Chroma)

### Mobile
- `POST /api/v1/mobile/heartbeat` - Background heartbeat
- `POST /api/v1/mobile/emergency` - Emergency button

(More endpoints documented in `/docs`)

## Deployment to Railway

1. **Create Railway project:**
- Go to https://railway.app/
- Create new project
- Add PostgreSQL database

2. **Connect repository:**
- Link your GitHub repo
- Railway will auto-detect `railway.json`

3. **Set environment variables:**
- Add all variables from `.env.example`
- Railway provides `DATABASE_URL` automatically

4. **Deploy:**
- Push to main branch
- Railway will build and deploy automatically

## Environment Variables

See `.env.example` for all required environment variables.

### Required API Keys:
- `CLAUDE_API_KEY` - Anthropic API key
- `LETTA_API_KEY` - Letta Cloud API key
- Chroma (local or hosted)
- Twilio (SMS/calls)
- Firebase (push notifications)

## AI Services

### Claude (Anthropic)
- Real-time conversation understanding
- Response generation
- Daily summary generation

### Letta (Cloud)
- Long-term memory per patient
- Pattern recognition
- Actionable insights

### Chroma (Vector Database) - REQUIRED
- Semantic search through conversations
- Find similar situations
- Evidence for Claude's context

## Performance Targets

- Voice response: < 5 seconds
- Emergency button: < 3 seconds
- Heartbeat: < 1 second
- Push notifications: < 10 seconds

## Development

### Code style:
```bash
# Format code
black app/
isort app/

# Lint
flake8 app/
```

### Git workflow:
1. Create feature branch
2. Make changes
3. Run tests
4. Commit with descriptive message
5. Push and create PR

## Troubleshooting

### Database connection error:
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Run migrations: `alembic upgrade head`

### Import errors:
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### Port already in use:
```bash
# Find process on port 8000
lsof -ti:8000

# Kill process
kill -9 <PID>
```

## Documentation

See `/documents` folder in project root for:
- System architecture
- API testing with Postman
- Deployment guide
- Mobile-backend communication

## Support

For issues or questions, check:
- API docs: `/docs`
- Project documentation: `/documents`
- Context specification: `context.md`
