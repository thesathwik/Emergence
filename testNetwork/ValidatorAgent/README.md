# ValidatorAgent - AI-Powered Fact Validation

## 🔍 Overview
ValidatorAgent is an intelligent fact-checking agent that validates claims using multiple data sources and uses AI to make smart collaboration decisions.

## 🧠 AI-Powered Intelligence
- **Self-Assessment**: Uses AI to analyze if it can handle validation requests
- **Smart Collaboration**: Intelligently decides when to seek help from other agents
- **Confidence-Based Decisions**: Makes collaboration choices based on confidence levels

## 🏗️ Architecture
- **90% Intelligence**: AI-powered decision making for collaboration
- **10% Communication**: Platform integration for agent discovery and messaging

An intelligent AI agent that validates facts from multiple sources using 9 different APIs. Built entirely with open source technologies.

## 🚀 Features

- **Multi-source validation**: Checks facts against 9 different authoritative sources
- **Confidence scoring**: Provides confidence levels for each source and overall assessment
- **Source credibility**: Evaluates and weights sources based on their reliability
- **Contradiction detection**: Identifies conflicting information between sources
- **Real-time fact checking**: Fast, concurrent API calls for quick results
- **Open source**: Built entirely with free and open source technologies

## 📚 Data Sources

1. **Wikipedia API (MediaWiki)** - General knowledge and encyclopedic information
2. **Wikidata Query Service** - Structured data and facts
3. **Google Fact Check Tools API** - Fact-checked claims and ratings
4. **NewsAPI.org** - Current news and recent events
5. **Semantic Scholar API** - Academic research papers
6. **World Bank API** - Economic and development data
7. **REST Countries API** - Country information and statistics
8. **CrossRef API** - Academic publications and citations
9. **Archive.org Wayback Machine API** - Historical web content

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.8+** - Core programming language
- **aiohttp** - Asynchronous HTTP client for API calls
- **Pydantic** - Data validation and settings management

### AI/ML
- **Transformers (Hugging Face)** - Pre-trained NLP models
- **spaCy** - Industrial-strength natural language processing
- **scikit-learn** - Machine learning algorithms
- **Sentence-Transformers** - Semantic similarity models

### Data Processing
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **BeautifulSoup4** - Web scraping capabilities

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- API keys for NewsAPI.org and Google Fact Check Tools API

### Installation Options

#### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
python setup.py
```

#### Option 2: Manual Setup
1. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install minimal dependencies (avoids conflicts)**
   ```bash
   pip install -r requirements-minimal.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env_example.txt .env
   # Edit .env with your API keys
   ```

4. **Run the application**
   ```bash
   python -m app.main
   ```

#### Option 3: Quick Run Scripts
```bash
# On macOS/Linux
./run.sh

# On Windows
run.bat
```

### Access the API
- **API Documentation**: http://localhost:8000/docs
- **Web Interface**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/v1/health

## 📖 API Usage

### Check a Fact

```bash
curl -X POST "http://localhost:8000/api/v1/fact-check" \
     -H "Content-Type: application/json" \
     -d '{
       "claim": "The population of Japan is approximately 125 million",
       "fact_type": "statistical"
     }'
```

### Response Example

```json
{
  "claim": "The population of Japan is approximately 125 million",
  "overall_confidence": 0.85,
  "fact_type": "statistical",
  "sources": [
    {
      "source_type": "rest_countries",
      "title": "Country Information - Japan",
      "url": "https://restcountries.com/v3.1/name/Japan",
      "snippet": "Japan is located in Asia. Capital: Tokyo. Population: 125,836,021. Area: 377,975 km²",
      "credibility": "high",
      "confidence_score": 0.9,
      "published_date": null,
      "raw_data": {...}
    }
  ],
  "contradictions": [],
  "summary": "Fact-check results for: 'The population of Japan is approximately 125 million'\n\nOverall confidence: 85.0%\nSources consulted: 8\nHigh confidence sources: 3\nMedium confidence sources: 2\n\nKey findings from high-confidence sources:\n1. Country Information - Japan (Confidence: 90.0%)\n2. World Bank Data - Japan (Confidence: 88.0%)\n3. Wikipedia - Japan (Confidence: 85.0%)",
  "timestamp": "2024-01-15T10:30:00Z",
  "processing_time_ms": 1250
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Required API Keys
NEWSAPI_KEY=your_newsapi_key_here
GOOGLE_FACT_CHECK_API_KEY=your_google_fact_check_key_here

# Database (Optional - defaults to SQLite)
DATABASE_URL=postgresql://username:password@localhost:5432/factchecker
REDIS_URL=redis://localhost:6379

# Application Settings
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
CACHE_TTL_SECONDS=3600
```

### API Keys Setup

1. **NewsAPI.org**
   - Visit: https://newsapi.org/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Google Fact Check Tools API**
   - Visit: https://developers.google.com/fact-check/tools/api
   - Enable the API in Google Cloud Console
   - Create credentials and get your API key

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Fact Engine   │
│   (React/Vue)   │◄──►│   (FastAPI)      │◄──►│   (Python)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Cache Layer    │    │   Data Sources  │
                       │   (Redis)        │    │   (9 APIs)      │
                       └──────────────────┘    └─────────────────┘
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_fact_checker.py
```

## 📊 Fact Types Supported

- **Statistical** - Percentages, data, surveys, numerical facts
- **Historical** - Historical events, dates, historical information
- **Scientific** - Research, studies, scientific claims
- **Current Event** - Recent news, current events
- **Quote** - Quotes, statements, attributed claims
- **Calculation** - Mathematical calculations
- **Geographical** - Countries, cities, locations
- **Other** - General factual claims

## 🔍 How It Works

1. **Input Processing**: Analyzes the claim and extracts key information
2. **Source Querying**: Concurrently queries all 9 data sources
3. **Result Processing**: Filters and ranks results by confidence
4. **Contradiction Detection**: Identifies conflicting information
5. **Confidence Calculation**: Computes overall confidence score
6. **Summary Generation**: Creates human-readable summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All the open source APIs and services that make this project possible
- The FastAPI and Python communities for excellent tools and documentation
- Contributors and users who help improve this project

## 📞 Support

- Create an issue for bug reports or feature requests
- Check the documentation at `/docs` when the server is running
- Review the API health status at `/api/v1/health`
