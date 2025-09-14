#!/usr/bin/env python3
"""
Real-Time IdeaAgent - Standalone Agent with Intelligent Collaboration

This agent runs as a standalone service that users interact with directly.
It intelligently decides when to collaborate with other agents on the platform:

USER EXPERIENCE:
- User asks for creative ideas → Works independently
- User asks for business strategy → "Wait, let me validate this with an expert..."
- User asks for technical implementation → "Let me find a technical specialist..."

INTELLIGENT COLLABORATION:
- Discovers available agents on platform
- Decides what type of help is needed
- Reaches out to appropriate specialists
- Synthesizes collaborative results

Usage: python realtime_idea_agent.py
Then interact normally - the agent decides when to collaborate!
"""

import time
import requests
import threading
import os
import json
import asyncio
from dotenv import load_dotenv
from typing import Optional, Dict, List
import re

# Load environment variables
load_dotenv()


class RealtimeIdeaAgent:
    """
    Standalone IdeaAgent that intelligently collaborates with other platform agents
    """

    def __init__(self, platform_url: str = None, ollama_url: str = None):
        self.platform_url = platform_url or os.getenv("EMERGENCE_PLATFORM_URL", "https://emergence-production.up.railway.app")
        self.ollama_url = ollama_url or os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.agent_name = "RealtimeIdeaAgent"
        self.api_key: Optional[str] = None
        self.instance_id: Optional[int] = None

        # AI Model configuration
        self.model = os.getenv("OLLAMA_MODEL", "phi3:mini")

        # Platform communication
        self.running = False
        self.health_thread: Optional[threading.Thread] = None
        self.message_thread: Optional[threading.Thread] = None
        self.processed_messages = set()

        # Configuration
        self.health_interval = 30
        self.message_check_interval = 3

        # Available agents cache (updated dynamically)
        self.available_agents = {}
        self.agent_discovery_interval = 60  # Refresh every minute

        # Statistics
        self.user_requests_handled = 0
        self.collaboration_requests_made = 0
        self.independent_responses = 0

        # Collaboration intelligence
        self.collaboration_patterns = {
            "validation_needed": [
                "financial", "investment", "money", "profit", "trading", "stock",
                "business strategy", "market analysis", "go-to-market",
                "medical", "health", "treatment", "drug", "safety", "legal"
            ],
            "technical_help": [
                "architecture", "system design", "algorithm", "implementation",
                "software", "engineering", "database", "API", "performance"
            ],
            "creative_independent": [
                "logo", "design", "creative", "art", "aesthetic", "color",
                "entertainment", "fun", "personal", "subjective", "style"
            ],
            "image_generation": [
                "visual", "image", "picture", "diagram", "chart", "mockup",
                "wireframe", "prototype", "visualization", "infographic"
            ]
        }

        print(f"🚀 {self.agent_name} initializing...")
        print("🧠 Intelligence: Will decide when to collaborate with other agents")
        print("💬 Communication: Real-time platform integration")

    def start_agent_service(self):
        """Start the agent as a standalone service"""
        print("🔗 Connecting to Emergence Platform...")

        if not self.register_with_platform():
            print("❌ Failed to register with platform")
            return False

        self.running = True

        # Start background services
        self.health_thread = threading.Thread(target=self._health_monitoring_loop, daemon=True)
        self.health_thread.start()

        self.message_thread = threading.Thread(target=self._message_processing_loop, daemon=True)
        self.message_thread.start()

        # Start agent discovery
        self.discovery_thread = threading.Thread(target=self._agent_discovery_loop, daemon=True)
        self.discovery_thread.start()

        print("✅ Agent service started!")
        print("🤖 Ready to help users with intelligent collaboration")
        return True

    def register_with_platform(self) -> bool:
        """Register with the Emergence platform"""
        try:
            response = requests.get(f"{self.platform_url}/api/agents", timeout=10)
            if response.status_code != 200:
                print(f"❌ Failed to get agents: {response.status_code}")
                return False

            agents = response.json().get('agents', [])
            if not agents:
                print("❌ No agents available for registration")
                return False

            registration_data = {
                "agent_id": agents[0]['id'],
                "instance_name": f"{self.agent_name}-{int(time.time())}",
                "status": "running"
            }

            response = requests.post(
                f"{self.platform_url}/api/webhook/register",
                json=registration_data,
                timeout=10
            )

            if response.status_code in [200, 201]:
                result = response.json()
                self.instance_id = result['instance']['id']
                self.api_key = result['security']['api_key']
                print(f"✅ Registered as instance {self.instance_id}")
                return True
            else:
                print(f"❌ Registration failed: {response.text}")
                return False

        except Exception as e:
            print(f"❌ Registration error: {e}")
            return False

    def generate_ideas_with_intelligent_collaboration(self, user_request: str) -> Dict:
        """
        Main function: Generate ideas and intelligently decide on collaboration
        """
        print(f"\n💭 User Request: {user_request}")
        print("🧠 Analyzing if I should work independently or collaborate...")

        start_time = time.time()

        try:
            # Step 1: AI-powered collaboration analysis
            collaboration_decision = self.analyze_collaboration_need(user_request)

            print(f"🤖 AI Decision: {collaboration_decision['action']}")
            print(f"💭 Reasoning: {collaboration_decision['reasoning']}")

            # Step 2: Generate initial ideas
            print("💡 Generating ideas...")
            initial_ideas = self.generate_initial_ideas(user_request)

            # Step 3: Decide on collaboration based on analysis
            if collaboration_decision['collaborate']:
                print(f"🤝 Seeking help from {collaboration_decision['help_type']} specialist...")

                # Find appropriate agent
                target_agent = self.find_suitable_agent(collaboration_decision['help_type'])

                if target_agent:
                    print(f"🎯 Found {target_agent['type']} agent: {target_agent['name']}")

                    # Collaborate with the agent
                    collaboration_result = self.collaborate_with_agent(
                        target_agent,
                        user_request,
                        initial_ideas,
                        collaboration_decision['help_type']
                    )

                    if collaboration_result:
                        print("✅ Collaboration successful!")
                        return self.synthesize_collaborative_result(
                            user_request, initial_ideas, collaboration_result,
                            collaboration_decision, time.time() - start_time
                        )
                    else:
                        print("⚠️ Collaboration failed, proceeding independently")
                else:
                    print(f"⚠️ No {collaboration_decision['help_type']} agent available, proceeding independently")

            # Working independently
            print("🎯 Working independently")
            self.independent_responses += 1

            return self.create_independent_result(
                user_request, initial_ideas, collaboration_decision,
                time.time() - start_time
            )

        except Exception as e:
            print(f"❌ Error in idea generation: {e}")
            return {
                "error": f"Idea generation failed: {str(e)}",
                "user_request": user_request,
                "timestamp": time.time()
            }

    def analyze_collaboration_need(self, user_request: str) -> Dict:
        """
        AI-powered analysis of whether collaboration is needed
        """
        try:
            print("🤖 Attempting AI-powered analysis...")

            # Create AI prompt for collaboration analysis
            analysis_prompt = f"""I am an AI IdeaAgent analyzing whether I need help from other agents.

USER REQUEST: "{user_request}"

I need to decide if I should:
1. Work INDEPENDENTLY (for creative, subjective, or simple tasks)
2. Seek VALIDATION (for business, financial, or factual claims)
3. Get TECHNICAL help (for complex implementations or architecture)
4. Request IMAGE GENERATION (for visual concepts or diagrams)

ANALYSIS CRITERIA:

WORK INDEPENDENTLY if:
- Creative tasks (logo design, art, entertainment ideas)
- Personal preferences or subjective choices
- Simple brainstorming or general advice

SEEK VALIDATION if:
- Business strategies, market analysis, financial advice
- Claims that need fact-checking or expert verification
- Medical, legal, or safety-related suggestions

GET TECHNICAL HELP if:
- System architecture, software implementation
- Complex technical solutions or algorithms
- Performance optimization or technical feasibility

REQUEST IMAGE GENERATION if:
- Visual concepts, diagrams, or mockups needed
- User specifically asks for visual representation

Based on the request "{user_request}":

DECISION: [INDEPENDENT/VALIDATION/TECHNICAL/IMAGE]
CONFIDENCE: [1-10]
REASONING: [Why this decision makes sense]
PRIORITY: [How urgent is collaboration - LOW/MEDIUM/HIGH]"""

            ai_response = self.call_ollama(analysis_prompt)
            print(f"🤖 AI Response: {ai_response[:200]}...")

            # Parse AI decision
            decision = self.parse_collaboration_decision(ai_response, user_request)

            return decision

        except Exception as e:
            print(f"⚠️ AI analysis failed: {e}")
            # Fallback decision making
            return self.fallback_collaboration_analysis(user_request)

    def parse_collaboration_decision(self, ai_response: str, user_request: str) -> Dict:
        """Parse AI response into structured collaboration decision"""
        try:
            decision_match = re.search(r'DECISION:\s*(\w+)', ai_response)
            confidence_match = re.search(r'CONFIDENCE:\s*(\d+)', ai_response)
            reasoning_match = re.search(r'REASONING:\s*(.*?)(?:\n|$)', ai_response, re.DOTALL)

            decision_type = decision_match.group(1) if decision_match else "INDEPENDENT"
            confidence = int(confidence_match.group(1)) if confidence_match else 5
            reasoning = reasoning_match.group(1).strip() if reasoning_match else "AI analysis completed"

            # Map decision to collaboration parameters
            if decision_type == "INDEPENDENT":
                return {
                    "collaborate": False,
                    "action": "WORK INDEPENDENTLY",
                    "help_type": None,
                    "reasoning": reasoning,
                    "confidence": confidence
                }
            elif decision_type == "VALIDATION":
                return {
                    "collaborate": True,
                    "action": "SEEK VALIDATION",
                    "help_type": "validator",
                    "reasoning": reasoning,
                    "confidence": confidence
                }
            elif decision_type == "TECHNICAL":
                return {
                    "collaborate": True,
                    "action": "GET TECHNICAL HELP",
                    "help_type": "technical",
                    "reasoning": reasoning,
                    "confidence": confidence
                }
            elif decision_type == "IMAGE":
                return {
                    "collaborate": True,
                    "action": "REQUEST IMAGE GENERATION",
                    "help_type": "image_generator",
                    "reasoning": reasoning,
                    "confidence": confidence
                }
            else:
                return self.fallback_collaboration_analysis(user_request)

        except Exception as e:
            return self.fallback_collaboration_analysis(user_request)

    def fallback_collaboration_analysis(self, user_request: str) -> Dict:
        """Fallback collaboration analysis using keyword matching"""
        request_lower = user_request.lower()

        print(f"🔍 Fallback analysis for: '{request_lower}'")

        # Check for validation needs - add more patterns
        validation_keywords = [
            "financial", "investment", "money", "profit", "trading", "stock",
            "business strategy", "market analysis", "go-to-market", "fintech",
            "startup", "business", "strategy", "market",
            "medical", "health", "treatment", "drug", "safety", "legal"
        ]

        validation_matches = [keyword for keyword in validation_keywords if keyword in request_lower]
        if validation_matches:
            print(f"✅ Found validation keywords: {validation_matches}")
            return {
                "collaborate": True,
                "action": "SEEK VALIDATION",
                "help_type": "validator",
                "reasoning": f"Request contains business/financial content that needs validation (matched: {', '.join(validation_matches)})",
                "confidence": 7
            }

        # Check for technical help needs
        elif any(keyword in request_lower for keyword in self.collaboration_patterns["technical_help"]):
            return {
                "collaborate": True,
                "action": "GET TECHNICAL HELP",
                "help_type": "technical",
                "reasoning": "Request involves technical implementation that could benefit from specialist input",
                "confidence": 6
            }

        # Check for image generation needs
        elif any(keyword in request_lower for keyword in self.collaboration_patterns["image_generation"]):
            return {
                "collaborate": True,
                "action": "REQUEST IMAGE GENERATION",
                "help_type": "image_generator",
                "reasoning": "Request involves visual concepts that would benefit from image generation",
                "confidence": 8
            }

        # Default to independent work
        else:
            return {
                "collaborate": False,
                "action": "WORK INDEPENDENTLY",
                "help_type": None,
                "reasoning": "Request appears to be creative/subjective and can be handled independently",
                "confidence": 6
            }

    def generate_initial_ideas(self, user_request: str, num_ideas: int = 5) -> List[Dict]:
        """Generate initial ideas before collaboration"""
        try:
            prompt = f"""Generate {num_ideas} creative, actionable ideas for this request:

REQUEST: {user_request}

For each idea, provide:
- TITLE: Clear, specific name
- DESCRIPTION: Detailed explanation with practical steps
- CATEGORY: Type of solution (business/technical/creative/etc.)
- FEASIBILITY: Implementation difficulty (1-10)

Focus on innovative, practical solutions that address the user's needs directly.

Generate {num_ideas} ideas:"""

            response = self.call_ollama(prompt)
            return self.parse_ideas_from_response(response)

        except Exception as e:
            print(f"❌ Error generating initial ideas: {e}")
            return [{
                "title": "Error in idea generation",
                "description": f"Failed to generate ideas: {str(e)}",
                "category": "error",
                "feasibility": 1
            }]

    def find_suitable_agent(self, help_type: str) -> Optional[Dict]:
        """Find a suitable agent on the platform for the needed help type"""
        try:
            # Map help types to agent name patterns
            agent_patterns = {
                "validator": ["validator", "fact", "check", "verify"],
                "technical": ["technical", "tech", "engineer", "architect", "developer"],
                "image_generator": ["image", "visual", "generate", "picture", "diagram"]
            }

            patterns = agent_patterns.get(help_type, [])

            # Search through available agents
            for agent_info in self.available_agents.values():
                agent_name = agent_info.get('instance_name', '').lower()

                # Check if agent name matches the help type
                if any(pattern in agent_name for pattern in patterns):
                    return {
                        "id": agent_info.get('id'),
                        "name": agent_info.get('instance_name'),
                        "type": help_type,
                        "status": agent_info.get('status')
                    }

            print(f"⚠️ No {help_type} agent found in available agents: {list(self.available_agents.keys())}")
            return None

        except Exception as e:
            print(f"❌ Error finding suitable agent: {e}")
            return None

    def collaborate_with_agent(self, target_agent: Dict, user_request: str, initial_ideas: List[Dict], help_type: str) -> Optional[Dict]:
        """Collaborate with another agent in real-time"""
        try:
            print(f"📤 Sending collaboration request to {target_agent['name']}")

            # Create collaboration request based on help type
            if help_type == "validator":
                request_id = f'collab_{int(time.time())}_{self.instance_id}'
                request_data = {
                    'ideas': initial_ideas,
                    'problem': user_request,
                    'request_id': request_id
                }
                request_content = f"validate_ideas:{json.dumps(request_data)}"
            elif help_type == "technical":
                request_id = f'tech_{int(time.time())}_{self.instance_id}'
                request_data = {
                    'ideas': initial_ideas,
                    'requirements': user_request,
                    'request_id': request_id
                }
                request_content = f"technical_review:{json.dumps(request_data)}"
            elif help_type == "image_generator":
                request_id = f'img_{int(time.time())}_{self.instance_id}'
                request_data = {
                    'ideas': initial_ideas,
                    'description': user_request,
                    'request_id': request_id
                }
                request_content = f"generate_images:{json.dumps(request_data)}"
            else:
                request_id = f'help_{int(time.time())}_{self.instance_id}'
                request_data = {
                    'ideas': initial_ideas,
                    'request': user_request,
                    'help_type': help_type,
                    'request_id': request_id
                }
                request_content = f"help_request:{json.dumps(request_data)}"

            # Send message to target agent
            message_data = {
                "to_instance_id": target_agent['id'],
                "message_type": "request",
                "content": request_content,
                "priority": 3,
                "metadata": {
                    "sender": self.agent_name,
                    "sender_instance_id": self.instance_id,
                    "collaboration_type": help_type,
                    "user_request": user_request[:100]
                }
            }

            print(f"📤 Sending to instance {target_agent['id']} from instance {self.instance_id}")

            response = requests.post(
                f"{self.platform_url}/api/agents/message",
                headers={"X-API-Key": self.api_key},
                json=message_data,
                timeout=10
            )

            if response.status_code in [200, 201]:
                print(f"✅ Collaboration request sent successfully")

                # Wait for response with timeout
                collaboration_result = self.wait_for_collaboration_response(
                    message_data['content'].split(':')[0],  # Extract request type
                    timeout=45
                )

                self.collaboration_requests_made += 1
                return collaboration_result
            else:
                print(f"❌ Failed to send collaboration request: {response.status_code}")
                return None

        except Exception as e:
            print(f"❌ Collaboration error: {e}")
            return None

    def wait_for_collaboration_response(self, request_type: str, timeout: int = 45) -> Optional[Dict]:
        """Wait for response from collaborating agent"""
        print(f"⏳ Waiting for {request_type} response (timeout: {timeout}s)...")

        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                # Check for new messages
                response = requests.get(
                    f"{self.platform_url}/api/agents/{self.instance_id}/messages",
                    headers={"X-API-Key": self.api_key},
                    timeout=5
                )

                if response.status_code == 200:
                    messages = response.json().get('messages', [])

                    for message in messages:
                        if message.get('id') not in self.processed_messages:
                            content = message.get('content', '')

                            # Check for response types
                            response_types = [
                                'validation_response:',
                                'technical_response:',
                                'image_response:',
                                'help_response:',
                                'validation_error:',
                                'technical_error:',
                                'image_error:',
                                'help_error:'
                            ]

                            for response_type in response_types:
                                if content.startswith(response_type):
                                    self.processed_messages.add(message.get('id'))

                                    try:
                                        response_data = json.loads(content[len(response_type):])
                                        from_agent = message.get('from') or message.get('from_instance_id')
                                        print(f"📨 Received {response_type[:-1]} response from agent {from_agent}")
                                        return response_data
                                    except json.JSONDecodeError as e:
                                        print(f"⚠️ Invalid response format from collaborating agent: {e}")
                                        print(f"Raw content: {content[:200]}...")
                                        return None

                time.sleep(2)  # Check every 2 seconds

            except Exception as e:
                print(f"⚠️ Error waiting for response: {e}")
                time.sleep(2)

        print(f"⏰ Collaboration response timeout after {timeout}s")
        return None

    def synthesize_collaborative_result(self, user_request: str, initial_ideas: List[Dict],
                                       collaboration_result: Dict, collaboration_decision: Dict,
                                       total_time: float) -> Dict:
        """Synthesize results from collaboration into final response"""
        try:
            print("🔄 Synthesizing collaborative results...")

            # Extract collaboration data
            help_type = collaboration_decision.get('help_type')

            if help_type == "validator":
                validation_result = collaboration_result.get('validation_result', {})
                confidence = validation_result.get('overall_confidence', 0.5)
                recommendation = validation_result.get('recommendation', 'UNKNOWN')

                synthesis = f"After validation with a fact-checking specialist:\n"
                synthesis += f"• Validation Confidence: {confidence:.1%}\n"
                synthesis += f"• Recommendation: {recommendation}\n"
                synthesis += f"• {validation_result.get('ai_synthesis', 'Ideas have been professionally validated')}"

            elif help_type == "technical":
                technical_result = collaboration_result.get('technical_analysis', {})
                feasibility = technical_result.get('feasibility_score', 0.5)

                synthesis = f"After technical review with a specialist:\n"
                synthesis += f"• Technical Feasibility: {feasibility:.1%}\n"
                synthesis += f"• {technical_result.get('summary', 'Ideas have been technically reviewed')}"

            elif help_type == "image_generator":
                image_result = collaboration_result.get('generated_images', [])

                synthesis = f"Collaborated with image generation specialist:\n"
                synthesis += f"• Generated {len(image_result)} visual concepts\n"
                synthesis += f"• Visual aids created to support the ideas"

            else:
                synthesis = f"Collaborated with {help_type} specialist to enhance the ideas"

            return {
                "user_request": user_request,
                "ideas": initial_ideas,
                "collaboration_type": help_type,
                "collaboration_result": collaboration_result,
                "synthesis": synthesis,
                "ai_decision": collaboration_decision,
                "total_time": total_time,
                "status": "collaborative_success",
                "timestamp": time.time()
            }

        except Exception as e:
            print(f"❌ Error synthesizing collaborative result: {e}")
            return self.create_independent_result(user_request, initial_ideas, collaboration_decision, total_time)

    def create_independent_result(self, user_request: str, initial_ideas: List[Dict],
                                 collaboration_decision: Dict, total_time: float) -> Dict:
        """Create result for independent work"""
        return {
            "user_request": user_request,
            "ideas": initial_ideas,
            "collaboration_type": "independent",
            "ai_decision": collaboration_decision,
            "synthesis": f"Completed independently based on AI analysis. {collaboration_decision.get('reasoning', '')}",
            "total_time": total_time,
            "status": "independent_success",
            "timestamp": time.time()
        }

    def parse_ideas_from_response(self, response: str) -> List[Dict]:
        """Parse ideas from AI response"""
        ideas = []

        # Split response into potential ideas
        sections = response.split('\n\n')

        for section in sections:
            if len(section.strip()) < 30:
                continue

            lines = section.strip().split('\n')
            title = ""
            description = section.strip()
            category = "general"
            feasibility = 5

            # Extract title
            for line in lines:
                if any(keyword in line.lower() for keyword in ['title:', 'idea:', '**', 'solution:']):
                    title = re.sub(r'^[\d\.\-\*\s]*', '', line).strip()
                    title = re.sub(r'[\*\:\-]', '', title).strip()
                    break

            if not title:
                first_line = lines[0].strip()
                title = re.sub(r'^[\d\.\-\*\s]*', '', first_line)[:50]

            # Extract other fields if present
            category_match = re.search(r'category:?\s*([a-zA-Z\-]+)', section, re.IGNORECASE)
            if category_match:
                category = category_match.group(1).lower()

            feasibility_match = re.search(r'feasibility:?\s*(\d+)', section, re.IGNORECASE)
            if feasibility_match:
                feasibility = int(feasibility_match.group(1))

            if title:
                ideas.append({
                    "title": title,
                    "description": description,
                    "category": category,
                    "feasibility": feasibility
                })

        return ideas[:8]  # Limit to 8 ideas

    def call_ollama(self, prompt: str) -> str:
        """Call Ollama API for AI generation"""
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 500  # Limit response length
                    }
                },
                timeout=60  # Increase timeout
            )

            if response.status_code == 200:
                return response.json().get('response', 'No response generated')
            else:
                return f"Error: Ollama API returned {response.status_code}"

        except Exception as e:
            return f"Error calling Ollama: {str(e)}"

    def _agent_discovery_loop(self):
        """Continuously discover available agents on the platform"""
        while self.running:
            try:
                response = requests.get(f"{self.platform_url}/api/instances", timeout=5)
                if response.status_code == 200:
                    instances = response.json().get('instances', [])

                    # Update available agents
                    new_agents = {}
                    for instance in instances:
                        if instance.get('status') == 'running' and instance.get('id') != self.instance_id:
                            new_agents[instance.get('id')] = instance

                    # Check for new agents
                    for agent_id, agent_info in new_agents.items():
                        if agent_id not in self.available_agents:
                            print(f"🤖 Discovered new agent: {agent_info.get('instance_name')}")

                    self.available_agents = new_agents

            except Exception as e:
                pass  # Silent failure for discovery

            time.sleep(self.agent_discovery_interval)

    def _health_monitoring_loop(self):
        """Send periodic health pings"""
        while self.running:
            try:
                requests.post(
                    f"{self.platform_url}/api/webhook/ping",
                    headers={"X-API-Key": self.api_key},
                    json={"status": "running"},
                    timeout=5
                )
            except:
                pass  # Silent failure for health pings

            time.sleep(self.health_interval)

    def _message_processing_loop(self):
        """Process incoming messages from other agents or platform"""
        while self.running:
            try:
                response = requests.get(
                    f"{self.platform_url}/api/agents/{self.instance_id}/messages",
                    headers={"X-API-Key": self.api_key},
                    timeout=5
                )

                if response.status_code == 200:
                    messages = response.json().get('messages', [])
                    for message in messages:
                        message_id = message.get('id')
                        if message_id not in self.processed_messages:
                            self.handle_incoming_message(message)
                            self.processed_messages.add(message_id)

            except:
                pass  # Silent failure for message processing

            time.sleep(self.message_check_interval)

    def handle_incoming_message(self, message: Dict):
        """Handle incoming messages from other agents"""
        try:
            content = message.get('content', '')

            # Handle requests from other agents
            if content.startswith('generate_ideas:'):
                request_data = json.loads(content[15:])
                problem = request_data.get('problem', 'No problem specified')

                print(f"📨 Received idea generation request from agent {message.get('from_instance_id')}")

                # Generate ideas for the requesting agent
                result = self.generate_ideas_with_intelligent_collaboration(problem)

                # Send response
                self.send_response_to_agent(message.get('from_instance_id'), request_data.get('request_id'), result)

        except Exception as e:
            print(f"❌ Error handling incoming message: {e}")

    def send_response_to_agent(self, requester_id: int, request_id: str, result: Dict):
        """Send response back to requesting agent"""
        try:
            response_data = {
                "request_id": request_id,
                "ideas": result.get("ideas", []),
                "collaboration_type": result.get("collaboration_type", "independent"),
                "synthesis": result.get("synthesis", ""),
                "status": result.get("status", "success")
            }

            message_data = {
                "to_instance_id": requester_id,
                "message_type": "response",
                "content": f"idea_response:{json.dumps(response_data)}",
                "priority": 3,
                "metadata": {"sender": self.agent_name}
            }

            requests.post(
                f"{self.platform_url}/api/agents/message",
                headers={"X-API-Key": self.api_key},
                json=message_data,
                timeout=10
            )

        except Exception as e:
            print(f"❌ Error sending response: {e}")

    def get_stats(self) -> Dict:
        """Get agent statistics"""
        total_requests = self.user_requests_handled + self.collaboration_requests_made + self.independent_responses
        collaboration_rate = (self.collaboration_requests_made / total_requests * 100) if total_requests > 0 else 0

        return {
            "user_requests_handled": self.user_requests_handled,
            "collaboration_requests_made": self.collaboration_requests_made,
            "independent_responses": self.independent_responses,
            "collaboration_rate": f"{collaboration_rate:.1f}%",
            "available_agents": len(self.available_agents),
            "agent_names": [agent.get('instance_name') for agent in self.available_agents.values()]
        }

    def stop(self):
        """Stop the agent service"""
        print("🛑 Stopping Realtime IdeaAgent...")
        self.running = False


def main():
    """Main function - User interface for the standalone agent"""
    print("🚀 REALTIME IDEAAGENT - Intelligent Collaboration")
    print("=" * 55)
    print("🧠 This agent intelligently decides when to collaborate!")
    print("💬 Just ask for ideas - I'll handle the rest")
    print("=" * 55)

    agent = RealtimeIdeaAgent()

    try:
        # Start the agent service
        if not agent.start_agent_service():
            print("❌ Failed to start agent service")
            return

        print(f"\n💡 Ready to help! Available agents: {len(agent.available_agents)}")
        print("Commands:")
        print("  • Just type your idea request naturally")
        print("  • 'stats' - View collaboration statistics")
        print("  • 'agents' - List available agents for collaboration")
        print("  • 'quit' - Exit")

        while True:
            try:
                user_input = input(f"\n💭 What ideas do you need? > ").strip()

                if user_input.lower() in ['quit', 'exit']:
                    break
                elif user_input.lower() == 'stats':
                    stats = agent.get_stats()
                    print(f"\n📊 AGENT STATISTICS:")
                    for key, value in stats.items():
                        print(f"   {key}: {value}")
                elif user_input.lower() == 'agents':
                    print(f"\n🤖 AVAILABLE AGENTS FOR COLLABORATION:")
                    if agent.available_agents:
                        for agent_info in agent.available_agents.values():
                            print(f"   • {agent_info.get('instance_name')} (ID: {agent_info.get('id')})")
                    else:
                        print("   No other agents currently available")
                elif user_input:
                    # Main idea generation with intelligent collaboration
                    result = agent.generate_ideas_with_intelligent_collaboration(user_input)

                    if 'error' not in result:
                        print(f"\n✨ RESULT:")
                        print(f"   Status: {result.get('status', 'unknown')}")
                        print(f"   Collaboration: {result.get('collaboration_type', 'none')}")
                        print(f"   Time: {result.get('total_time', 0):.1f}s")

                        if result.get('synthesis'):
                            print(f"\n💡 SYNTHESIS:")
                            print(f"   {result.get('synthesis')}")

                        ideas = result.get('ideas', [])
                        if ideas:
                            print(f"\n💭 IDEAS ({len(ideas)}):")
                            for i, idea in enumerate(ideas, 1):
                                print(f"   {i}. {idea.get('title', 'Untitled')}")
                                print(f"      {idea.get('description', '')[:150]}...")
                                print(f"      Category: {idea.get('category', 'general')}")
                    else:
                        print(f"❌ {result.get('error')}")
                else:
                    print("❌ Please enter a request or command")

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Error: {e}")

    finally:
        agent.stop()
        print("👋 Realtime IdeaAgent stopped")


if __name__ == "__main__":
    main()