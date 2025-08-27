# Contributing to Emergence Platform

Thank you for your interest in contributing to Emergence! This document provides guidelines and information for contributors.

## 🚀 Welcome

Emergence is an open-source platform for AI agent collaboration and marketplace. We welcome contributions from developers, designers, researchers, and anyone passionate about advancing AI agent ecosystems.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **Python** (v3.8 or later) for agent development
- **Git** for version control

### Quick Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/Emergence.git
   cd Emergence
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   npm install
   
   # Frontend dependencies
   cd frontend
   npm install
   ```

3. **Set up environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Configure your local settings
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend server
   npm start
   
   # Terminal 2: Frontend server
   cd frontend && npm start
   ```

## 🛠 Development Setup

### Project Structure

```
emergence/
├── server.js              # Main backend server
├── database.js            # Database configuration
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/
├── routes/                 # Express routes
├── uploads/                # Agent file storage
└── railway.json           # Deployment configuration
```

### Environment Variables

Create a `.env` file with:

```env
NODE_ENV=development
PORT=3001
DB_PATH=./database.sqlite
EMAIL_SERVICE_API_KEY=your_key_here
PLATFORM_URL=http://localhost:3001
```

### Database Setup

The platform uses SQLite with automatic table initialization:

```bash
# Database will be created automatically on first run
npm start
```

For production, Railway volumes are used for persistence.

## 🤝 Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Fix issues and improve stability
- ✨ **New features** - Add functionality to the platform
- 📚 **Documentation** - Improve docs and guides
- 🎨 **UI/UX improvements** - Enhance user experience
- 🧪 **Testing** - Add tests and improve coverage
- 🔧 **Performance** - Optimize performance and scalability
- 🤖 **Agent templates** - Create new agent boilerplates
- 🌐 **Integrations** - Add external service integrations

### Development Principles

1. **User-first approach** - Always consider the end-user experience
2. **Security by design** - Follow security best practices
3. **Scalable architecture** - Write code that can grow with the platform
4. **Clean, readable code** - Use consistent coding standards
5. **Comprehensive testing** - Test your changes thoroughly
6. **Documentation** - Document new features and changes

### Coding Standards

#### JavaScript/TypeScript
```javascript
// Use consistent naming
const getUserAgents = async (userId) => {
  // Clear, descriptive function names
  const agents = await database.getAgentsByUser(userId);
  return agents;
};

// Error handling
try {
  const result = await apiCall();
  return { success: true, data: result };
} catch (error) {
  console.error('API call failed:', error);
  return { success: false, error: error.message };
}
```

#### React Components
```jsx
// Functional components with hooks
const AgentCard = ({ agent, onDownload }) => {
  const [loading, setLoading] = useState(false);
  
  const handleDownload = async () => {
    setLoading(true);
    try {
      await onDownload(agent.id);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="agent-card">
      {/* Component JSX */}
    </div>
  );
};
```

#### Python (for agents)
```python
# Follow PEP 8 standards
class DataProcessor:
    def __init__(self, config):
        self.config = config
        
    def process_data(self, data):
        """Process incoming data with error handling."""
        try:
            result = self._analyze_data(data)
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
```

## 🔄 Pull Request Process

### Before Submitting

1. **Check existing issues** - Ensure your contribution isn't already being worked on
2. **Create an issue** - For significant changes, create an issue first to discuss
3. **Fork and branch** - Work on a feature branch from your fork
4. **Test thoroughly** - Ensure your changes work as expected
5. **Update documentation** - Document new features or changes

### PR Guidelines

1. **Clear title and description**
   ```
   feat: add agent collaboration analytics dashboard
   
   - Adds new dashboard for tracking agent interactions
   - Includes real-time metrics and historical data
   - Implements responsive design for mobile devices
   
   Closes #123
   ```

2. **Small, focused changes** - Keep PRs manageable and focused
3. **Include tests** - Add tests for new functionality
4. **Update docs** - Update relevant documentation
5. **Follow commit conventions** - Use conventional commit messages

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(agents): add agent discovery API endpoint
fix(frontend): resolve agent upload validation issue
docs(readme): update installation instructions
```

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear title** - Describe the issue concisely
2. **Environment details** - OS, Node.js version, browser
3. **Steps to reproduce** - Clear reproduction steps
4. **Expected behavior** - What should happen
5. **Actual behavior** - What actually happens
6. **Screenshots/logs** - Visual evidence if applicable

### Feature Requests

For feature requests, include:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought about
4. **Use cases** - Real-world scenarios where this would help

### Issue Templates

Use our issue templates:
- 🐛 Bug Report
- ✨ Feature Request
- 📚 Documentation Issue
- 🤖 Agent Template Request

## 🏗 Development Workflow

### Setting Up Your Environment

1. **Clone and setup**
   ```bash
   git clone https://github.com/your-username/Emergence.git
   cd Emergence
   npm install
   cd frontend && npm install
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Make your changes**
   ```bash
   # Edit files
   git add .
   git commit -m "feat: add amazing new feature"
   ```

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/amazing-new-feature
   # Create PR on GitHub
   ```

### Local Development Tips

- **Hot reload** - Frontend auto-reloads on changes
- **API testing** - Use Postman or curl for API testing
- **Database inspection** - Use SQLite browser for database inspection
- **Logging** - Check console for detailed logs

## 🏛 Architecture Overview

### Backend Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API    │    │   Database      │
│   (React)       │◄───┤   (Node.js)      │◄───┤   (SQLite)      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Agent System   │
                       │   (Platform API) │
                       └──────────────────┘
```

### Key Components

- **Express Server** - RESTful API backend
- **React Frontend** - User interface and agent management
- **SQLite Database** - Data persistence with Railway volumes
- **Agent System** - Inter-agent communication platform
- **Authentication** - JWT-based user authentication
- **File Management** - Agent upload/download system

### API Endpoints

```
GET  /api/health              # Platform health check
GET  /api/agents              # List all agents
POST /api/agents              # Upload new agent
GET  /api/agents/:id          # Get specific agent
POST /api/agents/register     # Register live agent
GET  /api/agents/discover/live # Discover active agents
POST /api/agents/:id/call     # Call agent method
```

## 🧪 Testing Guidelines

### Testing Strategy

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test API endpoints and data flow
3. **End-to-End Tests** - Test complete user workflows
4. **Agent Tests** - Test agent communication and functionality

### Running Tests

```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test

# Run all tests
npm run test:all

# Test coverage
npm run test:coverage
```

### Writing Tests

#### Backend Tests
```javascript
describe('Agent API', () => {
  test('should create new agent', async () => {
    const agentData = { name: 'Test Agent', category: 'Testing' };
    const response = await request(app)
      .post('/api/agents')
      .send(agentData)
      .expect(201);
      
    expect(response.body.agent.name).toBe('Test Agent');
  });
});
```

#### Frontend Tests
```javascript
import { render, screen } from '@testing-library/react';
import AgentCard from '../components/AgentCard';

test('renders agent card with correct data', () => {
  const agent = { name: 'Test Agent', category: 'Testing' };
  render(<AgentCard agent={agent} />);
  
  expect(screen.getByText('Test Agent')).toBeInTheDocument();
});
```

## 📚 Documentation

### Documentation Types

1. **API Documentation** - Endpoint specifications
2. **User Guides** - How-to guides for users
3. **Developer Docs** - Technical implementation details
4. **Agent Guides** - Creating and deploying agents
5. **Deployment Docs** - Hosting and configuration

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date
- Test all documented procedures

### Documentation Tools

- **Markdown** for most documentation
- **JSDoc** for code documentation
- **Storybook** for component documentation
- **OpenAPI** for API specification

## 🌟 Community

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **Discussions** - For questions and community chat
- **Discord** - Real-time community support (coming soon)
- **Email** - Direct contact for sensitive issues

### Contributing to Community

- **Help others** - Answer questions in issues and discussions
- **Share knowledge** - Write blog posts or tutorials
- **Spread the word** - Share Emergence with others
- **Provide feedback** - Share your experience and suggestions

### Recognition

Contributors are recognized through:
- **Contributors list** in README
- **Release notes** mentions
- **Community spotlights** 
- **Maintainer opportunities** for active contributors

## 🎯 Roadmap Participation

We welcome input on our roadmap:

### Current Priorities
- Enhanced agent communication protocols
- Advanced analytics and monitoring
- Multi-language agent support
- Improved developer experience
- Scale and performance optimizations

### How to Influence Roadmap
- Participate in roadmap discussions
- Submit feature requests with use cases
- Contribute to architectural decisions
- Help prioritize community needs

## 🔄 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes, backward compatible

### Release Schedule

- **Major releases** - Every 6 months
- **Minor releases** - Monthly
- **Patch releases** - As needed for critical fixes

### Contributing to Releases

- Feature freeze 1 week before major releases
- Release candidate testing period
- Community feedback incorporation
- Final release with comprehensive changelog

## 📞 Contact

- **Project Lead**: [Your Name]
- **Email**: contribute@emergence-platform.com
- **GitHub**: [@emergence-platform](https://github.com/thesathwik/Emergence)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for contributing to Emergence! Together, we're building the future of AI agent collaboration. 🚀