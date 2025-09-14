#!/usr/bin/env python3
"""
Standalone ValidatorAgent - Real-Time Validation Service

This is a simplified standalone validator that doesn't depend on the complex app structure.
It provides intelligent validation services to other agents through the Emergence platform.

Usage: python standalone_validator_agent.py
"""

import time
import requests
import threading
import os
import json
import re
from dotenv import load_dotenv
from typing import Optional, Dict, List

# Load environment variables
load_dotenv()


class StandaloneValidatorAgent:
    """
    Standalone ValidatorAgent that provides real-time validation services
    """

    def __init__(self, platform_url: str = None):
        self.platform_url = platform_url or os.getenv("EMERGENCE_PLATFORM_URL", "https://emergence-production.up.railway.app")
        self.agent_name = "StandaloneValidatorAgent"
        self.api_key: Optional[str] = None
        self.instance_id: Optional[int] = None

        # Platform communication
        self.running = False
        self.health_thread: Optional[threading.Thread] = None
        self.message_thread: Optional[threading.Thread] = None
        self.processed_messages = set()

        # Configuration
        self.health_interval = 30
        self.message_check_interval = 2

        # Service statistics
        self.validation_requests_handled = 0
        self.collaboration_responses_sent = 0
        self.total_validations_performed = 0
        self.start_time = time.time()

        print(f"🔍 {self.agent_name} initializing...")
        print("🎯 Service: Real-time validation for other agents")
        print("🧠 Intelligence: Contextual validation strategies")

    def start_validator_service(self):
        """Start the validator as a standalone service"""
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

        print("✅ Validator service started!")
        print("🔍 Ready to provide validation services to other agents")
        print("📡 Listening for validation requests...")
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

    def handle_validation_request(self, message: Dict):
        """Handle validation requests from other agents"""
        try:
            content = message.get('content', '')
            from_agent = message.get('from_instance_id')

            print(f"📨 Validation request from agent {from_agent}")

            if content.startswith('validate_ideas:'):
                self.handle_idea_validation_request(message)
            elif content.startswith('fact_check:'):
                self.handle_fact_check_request(message)
            elif content.startswith('help_request:'):
                self.handle_general_help_request(message)
            else:
                print(f"⚠️ Unknown request type: {content[:50]}...")

        except Exception as e:
            print(f"❌ Error handling validation request: {e}")

    def handle_idea_validation_request(self, message: Dict):
        """Handle idea validation requests from IdeaAgent"""
        try:
            content = message.get('content', '')

            # Try different ways to get the sender ID
            from_agent_raw = (
                message.get('from_instance_id') or  # Original expectation
                message.get('from') or              # Platform actual field
                message.get('metadata', {}).get('sender_instance_id')  # Metadata fallback
            )

            # Extract instance_id if from_agent is a dictionary
            if isinstance(from_agent_raw, dict):
                from_agent = from_agent_raw.get('instance_id')
                print(f"📨 Validation request from agent {from_agent_raw}")
                print(f"🔍 Extracted instance_id: {from_agent}")
            else:
                from_agent = from_agent_raw
                print(f"📨 Validation request from agent {from_agent}")

            if not from_agent:
                print("⚠️ No requester ID found in message")
                print(f"Message keys: {list(message.keys())}")
                print(f"From field: {message.get('from')}")
                print(f"From field type: {type(message.get('from'))}")
                print(f"Metadata: {message.get('metadata', {})}")
                return

            request_data = json.loads(content[15:])  # Remove 'validate_ideas:' prefix

            ideas = request_data.get('ideas', [])
            problem = request_data.get('problem', '')
            request_id = request_data.get('request_id', '')

            print(f"🔍 Validating {len(ideas)} ideas for problem: {problem[:80]}...")

            # Perform intelligent validation
            validation_result = self.validate_ideas_intelligently(ideas, problem)

            # Send response back - use the extracted from_agent
            self.send_validation_response(
                from_agent,  # Use the properly extracted ID
                request_id,
                validation_result,
                "validation_response"
            )

            self.validation_requests_handled += 1

        except Exception as e:
            print(f"❌ Error handling idea validation: {e}")
            self.send_error_response(
                message.get('from_instance_id'),
                request_data.get('request_id', ''),
                f"Validation error: {str(e)}",
                "validation_error"
            )

    def handle_fact_check_request(self, message: Dict):
        """Handle specific fact-checking requests"""
        try:
            content = message.get('content', '')
            from_agent_raw = message.get('from') or message.get('from_instance_id')

            # Extract instance_id if from_agent is a dictionary
            if isinstance(from_agent_raw, dict):
                from_agent = from_agent_raw.get('instance_id')
            else:
                from_agent = from_agent_raw

            if not from_agent:
                print("⚠️ No requester ID found for fact-check request")
                return

            request_data = json.loads(content[11:])  # Remove 'fact_check:' prefix

            claim = request_data.get('claim', '')
            fact_type = request_data.get('fact_type', 'general')
            request_id = request_data.get('request_id', '')

            print(f"📋 Fact-checking claim: {claim[:80]}...")

            # Perform simplified fact-checking
            fact_result = self.simple_fact_check(claim, fact_type)

            # Send response back
            self.send_validation_response(
                from_agent,
                request_id,
                {"fact_check_result": fact_result},
                "fact_check_response"
            )

            self.total_validations_performed += 1

        except Exception as e:
            print(f"❌ Error handling fact check: {e}")
            self.send_error_response(
                message.get('from_instance_id'),
                request_data.get('request_id', ''),
                f"Fact check error: {str(e)}",
                "fact_check_error"
            )

    def handle_general_help_request(self, message: Dict):
        """Handle general help requests"""
        try:
            content = message.get('content', '')
            from_agent_raw = message.get('from') or message.get('from_instance_id')

            # Extract instance_id if from_agent is a dictionary
            if isinstance(from_agent_raw, dict):
                from_agent = from_agent_raw.get('instance_id')
            else:
                from_agent = from_agent_raw

            if not from_agent:
                print("⚠️ No requester ID found for help request")
                return

            request_data = json.loads(content[13:])  # Remove 'help_request:' prefix

            help_type = request_data.get('help_type', 'general')
            request = request_data.get('request', '')
            request_id = request_data.get('request_id', '')

            print(f"🤝 General help request: {help_type} - {request[:60]}...")

            # Provide general validation help
            help_result = self.provide_general_validation_help(request, help_type)

            # Send response back
            self.send_validation_response(
                from_agent,
                request_id,
                help_result,
                "help_response"
            )

        except Exception as e:
            print(f"❌ Error handling help request: {e}")
            self.send_error_response(
                message.get('from_instance_id'),
                request_data.get('request_id', ''),
                f"Help request error: {str(e)}",
                "help_error"
            )

    def validate_ideas_intelligently(self, ideas: List[Dict], problem: str) -> Dict:
        """Perform intelligent validation of ideas based on context"""
        start_time = time.time()

        try:
            print("🧠 Analyzing validation requirements...")

            # Analyze the problem context for validation strategy
            validation_strategy = self.determine_validation_strategy(problem, ideas)

            print(f"🎯 Using {validation_strategy['approach']} validation strategy")

            # Perform validation based on strategy
            validation_results = []

            for idea in ideas:
                idea_result = self.validate_single_idea(idea, validation_strategy)
                validation_results.append(idea_result)

            # Synthesize overall results
            overall_result = self.synthesize_validation_results(validation_results, validation_strategy)

            validation_time = time.time() - start_time

            result = {
                "validation_result": overall_result,
                "individual_results": validation_results,
                "validation_strategy": validation_strategy,
                "validation_time": validation_time,
                "validator_agent": self.agent_name,
                "ideas_validated": len(ideas),
                "timestamp": time.time()
            }

            print(f"✅ Validation complete: {overall_result.get('overall_confidence', 0):.1%} confidence")
            return result

        except Exception as e:
            print(f"❌ Error in intelligent validation: {e}")
            return {
                "error": f"Validation failed: {str(e)}",
                "validation_time": time.time() - start_time
            }

    def determine_validation_strategy(self, problem: str, ideas: List[Dict]) -> Dict:
        """Determine the appropriate validation strategy based on context"""
        problem_lower = problem.lower()

        # Determine risk level
        high_risk_indicators = [
            "investment", "financial", "money", "profit", "trading", "guaranteed",
            "medical", "health", "treatment", "drug", "safety", "legal", "law"
        ]

        medium_risk_indicators = [
            "business", "strategy", "market", "startup", "technical", "system",
            "implementation", "algorithm", "performance"
        ]

        high_risk_count = sum(1 for indicator in high_risk_indicators if indicator in problem_lower)
        medium_risk_count = sum(1 for indicator in medium_risk_indicators if indicator in problem_lower)

        if high_risk_count > 0:
            risk_level = "HIGH_RISK"
            approach = "thorough"
        elif medium_risk_count > 0:
            risk_level = "MEDIUM_RISK"
            approach = "standard"
        else:
            risk_level = "LOW_RISK"
            approach = "quick"

        # Count factual claims in ideas
        total_factual_claims = 0
        for idea in ideas:
            claims = self.count_factual_claims(idea.get('description', ''))
            total_factual_claims += claims

        # Adjust strategy based on factual claims
        if total_factual_claims > 3:
            if approach == "quick":
                approach = "standard"
            elif approach == "standard":
                approach = "thorough"

        return {
            "risk_level": risk_level,
            "approach": approach,
            "factual_claims_detected": total_factual_claims,
            "confidence_threshold": 0.8 if approach == "thorough" else 0.6 if approach == "standard" else 0.4
        }

    def validate_single_idea(self, idea: Dict, validation_strategy: Dict) -> Dict:
        """Validate a single idea based on the strategy"""
        try:
            title = idea.get('title', 'Untitled')
            description = idea.get('description', '')
            approach = validation_strategy['approach']

            if approach == "thorough":
                return self.thorough_validation(idea)
            elif approach == "standard":
                return self.standard_validation(idea)
            else:  # quick
                return self.quick_validation(idea)

        except Exception as e:
            return {
                "idea_title": idea.get('title', 'Untitled'),
                "validation_result": "error",
                "confidence": 0.3,
                "error": str(e)
            }

    def thorough_validation(self, idea: Dict) -> Dict:
        """Perform thorough validation with detailed analysis"""
        try:
            title = idea.get('title', '')
            description = idea.get('description', '')

            # Extract and analyze claims
            claims = self.extract_validatable_claims(description)
            factual_claims = self.count_factual_claims(description)

            # Assess risk factors
            risk_score = self.assess_risk_factors(description)
            plausibility = self.assess_plausibility(idea)

            # Calculate confidence based on multiple factors
            base_confidence = plausibility

            # Adjust for factual claims (lower confidence if many unverified claims)
            if factual_claims > 2:
                base_confidence *= 0.7
            elif factual_claims > 0:
                base_confidence *= 0.8

            # Adjust for risk factors
            if risk_score > 0.7:
                base_confidence *= 0.6
            elif risk_score > 0.4:
                base_confidence *= 0.8

            confidence = max(0.1, min(0.95, base_confidence))

            return {
                "idea_title": title,
                "validation_result": "thorough_completed",
                "confidence": confidence,
                "claims_detected": len(claims),
                "factual_claims_count": factual_claims,
                "risk_score": risk_score,
                "plausibility_score": plausibility,
                "recommendation": "VALIDATED" if confidence >= 0.6 else "REQUIRES_REVIEW",
                "analysis": f"Thorough analysis completed. Detected {factual_claims} factual claims, risk score {risk_score:.2f}"
            }

        except Exception as e:
            return {
                "idea_title": idea.get('title', 'Untitled'),
                "validation_result": "thorough_error",
                "confidence": 0.3,
                "error": str(e)
            }

    def standard_validation(self, idea: Dict) -> Dict:
        """Perform standard validation"""
        try:
            title = idea.get('title', '')
            description = idea.get('description', '')

            plausibility = self.assess_plausibility(idea)
            factual_claims = self.count_factual_claims(description)

            # Adjust confidence based on factual claims
            confidence = plausibility
            if factual_claims > 1:
                confidence *= 0.8

            return {
                "idea_title": title,
                "validation_result": "standard_completed",
                "confidence": confidence,
                "factual_claims_count": factual_claims,
                "plausibility_score": plausibility,
                "recommendation": "VALIDATED" if confidence >= 0.5 else "REQUIRES_REVIEW",
                "analysis": f"Standard validation completed. {factual_claims} factual claims detected."
            }

        except Exception as e:
            return {
                "idea_title": idea.get('title', 'Untitled'),
                "validation_result": "standard_error",
                "confidence": 0.3,
                "error": str(e)
            }

    def quick_validation(self, idea: Dict) -> Dict:
        """Perform quick validation check"""
        try:
            plausibility = self.assess_plausibility(idea)

            return {
                "idea_title": idea.get('title', ''),
                "validation_result": "quick_completed",
                "confidence": plausibility,
                "plausibility_score": plausibility,
                "recommendation": "VALIDATED" if plausibility >= 0.4 else "REQUIRES_REVIEW",
                "analysis": "Quick plausibility assessment completed."
            }

        except Exception as e:
            return {
                "idea_title": idea.get('title', 'Untitled'),
                "validation_result": "quick_error",
                "confidence": 0.4,
                "error": str(e)
            }

    def simple_fact_check(self, claim: str, fact_type: str) -> Dict:
        """Perform simplified fact-checking without external APIs"""
        try:
            # Simplified fact-checking using pattern analysis
            factual_indicators = self.count_factual_claims(claim)
            risk_score = self.assess_risk_factors(claim)

            # Calculate confidence based on claim characteristics
            base_confidence = 0.6

            # Strong claims get lower confidence without verification
            strong_claim_patterns = ['guaranteed', 'always', 'never', '100%', 'impossible', 'certain']
            if any(pattern in claim.lower() for pattern in strong_claim_patterns):
                base_confidence *= 0.5

            # Numerical claims need verification
            if re.search(r'\d+%|\$\d+|\d+\s*(million|billion|thousand)', claim):
                base_confidence *= 0.6

            # High risk topics get lower confidence
            if risk_score > 0.5:
                base_confidence *= 0.7

            confidence = max(0.1, min(0.9, base_confidence))

            return {
                "claim": claim,
                "fact_type": fact_type,
                "overall_confidence": confidence,
                "sources_consulted": ["pattern_analysis", "risk_assessment"],
                "summary": f"Simplified fact-check completed with {confidence:.1%} confidence. Risk score: {risk_score:.2f}",
                "factual_indicators": factual_indicators,
                "validation_method": "simplified_analysis"
            }

        except Exception as e:
            return {
                "claim": claim,
                "fact_type": fact_type,
                "overall_confidence": 0.3,
                "error": str(e),
                "summary": f"Fact-check error: {str(e)}"
            }

    def extract_validatable_claims(self, text: str) -> List[str]:
        """Extract specific claims that can be fact-checked"""
        claim_patterns = [
            r'[^.!?]*\d+%[^.!?]*[.!?]',  # Sentences with percentages
            r'[^.!?]*\$\d+[^.!?]*[.!?]',  # Sentences with dollar amounts
            r'[^.!?]*(research shows|studies indicate|proven|guaranteed)[^.!?]*[.!?]',  # Strong claims
        ]

        claims = []
        for pattern in claim_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            claims.extend([match.strip() for match in matches if len(match.strip()) > 20])

        # If no specific claims, extract key sentences
        if not claims:
            sentences = re.split(r'[.!?]+', text)
            claims = [s.strip() for s in sentences if 30 < len(s.strip()) < 200][:3]

        return claims[:5]  # Limit to 5 claims

    def count_factual_claims(self, text: str) -> int:
        """Count factual claims in text"""
        factual_patterns = [
            r'\d+%', r'\$\d+', r'\d+ (million|billion|thousand)',
            r'(research shows|studies indicate|proven|guaranteed|statistics show)'
        ]

        count = 0
        for pattern in factual_patterns:
            count += len(re.findall(pattern, text, re.IGNORECASE))

        return count

    def assess_risk_factors(self, text: str) -> float:
        """Assess risk factors in the text"""
        high_risk_patterns = [
            'guaranteed', 'risk-free', '100% safe', 'never fail', 'always profitable',
            'medical', 'cure', 'treatment', 'investment advice', 'financial guarantee'
        ]

        medium_risk_patterns = [
            'business strategy', 'market analysis', 'profit', 'revenue', 'technical solution'
        ]

        text_lower = text.lower()

        high_risk_count = sum(1 for pattern in high_risk_patterns if pattern in text_lower)
        medium_risk_count = sum(1 for pattern in medium_risk_patterns if pattern in text_lower)

        # Calculate risk score (0.0 to 1.0)
        risk_score = min(1.0, (high_risk_count * 0.3 + medium_risk_count * 0.1))

        return risk_score

    def assess_plausibility(self, idea: Dict) -> float:
        """Assess general plausibility of an idea"""
        try:
            title = idea.get('title', '')
            description = idea.get('description', '')
            feasibility = idea.get('feasibility', 5)

            # Basic plausibility factors
            base_score = 0.6

            # Adjust based on feasibility rating
            if feasibility >= 7:
                base_score += 0.2
            elif feasibility <= 3:
                base_score -= 0.3

            # Adjust based on description quality
            if len(description) > 100:
                base_score += 0.1

            # Look for unrealistic claims
            unrealistic_indicators = ['guaranteed', 'impossible', '100%', 'never fail', 'always work']
            if any(indicator in description.lower() for indicator in unrealistic_indicators):
                base_score -= 0.4

            # Check for reasonable language
            reasonable_indicators = ['might', 'could', 'potentially', 'may', 'likely']
            if any(indicator in description.lower() for indicator in reasonable_indicators):
                base_score += 0.1

            return max(0.1, min(0.95, base_score))

        except Exception:
            return 0.5

    def synthesize_validation_results(self, validation_results: List[Dict], validation_strategy: Dict) -> Dict:
        """Synthesize individual validation results into overall assessment"""
        try:
            if not validation_results:
                return {
                    "overall_confidence": 0.5,
                    "recommendation": "NO_IDEAS_TO_VALIDATE",
                    "summary": "No ideas provided for validation"
                }

            # Calculate overall confidence
            confidences = [result.get('confidence', 0.5) for result in validation_results]
            overall_confidence = sum(confidences) / len(confidences)

            # Count recommendations
            validated_count = len([r for r in validation_results if r.get('recommendation') == 'VALIDATED'])
            review_count = len([r for r in validation_results if r.get('recommendation') == 'REQUIRES_REVIEW'])

            # Determine overall recommendation
            if validated_count >= len(validation_results) * 0.7:
                recommendation = "HIGH_CONFIDENCE_VALIDATED"
            elif validated_count >= len(validation_results) * 0.4:
                recommendation = "MODERATE_CONFIDENCE_VALIDATED"
            else:
                recommendation = "LOW_CONFIDENCE_REQUIRES_REVIEW"

            # Generate summary
            strategy_used = validation_strategy.get('approach', 'standard')
            claims_detected = validation_strategy.get('factual_claims_detected', 0)

            summary = f"Completed {strategy_used} validation of {len(validation_results)} ideas. "
            summary += f"Overall confidence: {overall_confidence:.1%}. "
            summary += f"Detected {claims_detected} factual claims. "
            summary += f"{validated_count} ideas validated, {review_count} require review."

            return {
                "overall_confidence": overall_confidence,
                "recommendation": recommendation,
                "validated_ideas": validated_count,
                "ideas_requiring_review": review_count,
                "validation_approach": strategy_used,
                "factual_claims_detected": claims_detected,
                "summary": summary,
                "ai_synthesis": summary,
                "confidence_distribution": {
                    "high_confidence": len([c for c in confidences if c >= 0.7]),
                    "moderate_confidence": len([c for c in confidences if 0.4 <= c < 0.7]),
                    "low_confidence": len([c for c in confidences if c < 0.4])
                }
            }

        except Exception as e:
            return {
                "overall_confidence": 0.5,
                "recommendation": "SYNTHESIS_ERROR",
                "error": str(e),
                "summary": f"Error synthesizing results: {str(e)}"
            }

    def provide_general_validation_help(self, request: str, help_type: str) -> Dict:
        """Provide general validation assistance"""
        try:
            confidence = 0.6
            analysis = f"General {help_type} assistance provided for request"

            # Analyze the request
            factual_claims = self.count_factual_claims(request)
            risk_score = self.assess_risk_factors(request)

            if factual_claims > 2:
                confidence *= 0.8
                analysis += f". Detected {factual_claims} factual claims requiring verification"

            if risk_score > 0.5:
                confidence *= 0.7
                analysis += f". High risk content detected (score: {risk_score:.2f})"

            return {
                "help_type": help_type,
                "confidence": confidence,
                "analysis": analysis,
                "factual_claims_detected": factual_claims,
                "risk_score": risk_score,
                "recommendation": "ASSISTANCE_PROVIDED",
                "timestamp": time.time()
            }

        except Exception as e:
            return {
                "help_type": help_type,
                "error": str(e),
                "recommendation": "HELP_ERROR"
            }

    def send_validation_response(self, requester_id: int, request_id: str, result: Dict, response_type: str):
        """Send validation response back to requesting agent"""
        try:
            # Clean the result data to ensure JSON serialization
            clean_result = {}
            for key, value in result.items():
                if isinstance(value, (str, int, float, bool, list, dict)) or value is None:
                    clean_result[key] = value
                else:
                    clean_result[key] = str(value)  # Convert non-serializable objects to string

            response_data = {
                "request_id": request_id,
                **clean_result,
                "validator_agent": self.agent_name,
                "response_timestamp": time.time()
            }

            # Ensure the JSON can be serialized
            try:
                json.dumps(response_data)  # Test serialization
            except TypeError as e:
                print(f"⚠️ JSON serialization error: {e}")
                # Fallback to essential data only
                response_data = {
                    "request_id": request_id,
                    "validation_result": {
                        "overall_confidence": clean_result.get("validation_result", {}).get("overall_confidence", 0.5),
                        "recommendation": clean_result.get("validation_result", {}).get("recommendation", "UNKNOWN"),
                        "summary": clean_result.get("validation_result", {}).get("summary", "Validation completed")
                    },
                    "validator_agent": self.agent_name,
                    "response_timestamp": time.time()
                }

            # Create content string carefully
            try:
                content_str = f"{response_type}:{json.dumps(response_data)}"
            except Exception as json_error:
                print(f"⚠️ JSON serialization failed: {json_error}")
                # Ultra-simple fallback
                content_str = f"{response_type}:{{\"request_id\":\"{request_id}\",\"confidence\":0.5,\"summary\":\"Validation completed\"}}"

            message_data = {
                "to_instance_id": requester_id,
                "message_type": "response",
                "content": content_str,
                "priority": 3,
                "metadata": {
                    "sender": self.agent_name,
                    "response_type": response_type
                }
            }

            # Final validation that message_data is complete
            required_fields = ["to_instance_id", "message_type", "content"]
            missing_fields = [field for field in required_fields if field not in message_data or not message_data[field]]
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return

            response = requests.post(
                f"{self.platform_url}/api/agents/message",
                headers={"X-API-Key": self.api_key},
                json=message_data,
                timeout=10
            )

            if response.status_code in [200, 201]:
                print(f"✅ Sent {response_type} to agent {requester_id}")
                self.collaboration_responses_sent += 1
            else:
                print(f"❌ Failed to send response: {response.status_code}")
                print(f"Response text: {response.text[:200]}...")
                print(f"Request data size: {len(json.dumps(message_data))} bytes")

        except Exception as e:
            print(f"❌ Error sending validation response: {e}")
            import traceback
            traceback.print_exc()

    def send_error_response(self, requester_id: int, request_id: str, error_message: str, error_type: str):
        """Send error response back to requesting agent"""
        try:
            error_data = {
                "request_id": request_id,
                "error": error_message,
                "validator_agent": self.agent_name,
                "error_timestamp": time.time()
            }

            message_data = {
                "to_instance_id": requester_id,
                "message_type": "response",
                "content": f"{error_type}:{json.dumps(error_data)}",
                "priority": 3,
                "metadata": {
                    "sender": self.agent_name,
                    "response_type": error_type
                }
            }

            requests.post(
                f"{self.platform_url}/api/agents/message",
                headers={"X-API-Key": self.api_key},
                json=message_data,
                timeout=10
            )

            print(f"✅ Sent {error_type} to agent {requester_id}")

        except Exception as e:
            print(f"❌ Error sending error response: {e}")

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
        """Process incoming validation requests from other agents"""
        print("📡 Message processing loop started")

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
                            self.handle_validation_request(message)
                            self.processed_messages.add(message_id)

            except Exception as e:
                pass  # Silent failure for message processing

            time.sleep(self.message_check_interval)

    def get_stats(self) -> Dict:
        """Get validator service statistics"""
        uptime = time.time() - self.start_time
        return {
            "validation_requests_handled": self.validation_requests_handled,
            "collaboration_responses_sent": self.collaboration_responses_sent,
            "total_validations_performed": self.total_validations_performed,
            "uptime_minutes": uptime / 60,
            "service_status": "running" if self.running else "stopped",
            "capabilities": [
                "idea_validation",
                "simplified_fact_checking",
                "plausibility_assessment",
                "risk_analysis",
                "contextual_validation_strategies"
            ]
        }

    def stop(self):
        """Stop the validator service"""
        print("🛑 Stopping Standalone ValidatorAgent...")
        self.running = False


def main():
    """Main function - Service interface for the standalone validator"""
    print("🔍 STANDALONE VALIDATORAGENT - Validation Service")
    print("=" * 60)
    print("🎯 This agent provides validation services to other agents")
    print("📡 Listening for validation requests from the platform")
    print("🧠 Uses simplified validation (no external API dependencies)")
    print("=" * 60)

    agent = StandaloneValidatorAgent()

    try:
        # Start the validator service
        if not agent.start_validator_service():
            print("❌ Failed to start validator service")
            return

        print(f"\n🔍 Validation service running!")
        print("Commands:")
        print("  • 'stats' - View service statistics")
        print("  • 'test <claim>' - Test validation on a claim")
        print("  • 'quit' - Exit")

        while True:
            try:
                user_input = input(f"\n🔍 Validator> ").strip()

                if user_input.lower() in ['quit', 'exit']:
                    break
                elif user_input.lower() == 'stats':
                    stats = agent.get_stats()
                    print(f"\n📊 VALIDATOR STATISTICS:")
                    for key, value in stats.items():
                        print(f"   {key}: {value}")
                elif user_input.startswith('test '):
                    claim = user_input[5:].strip()
                    if claim:
                        print(f"🧪 Testing validation on: {claim}")

                        test_idea = {
                            "title": "Test Claim",
                            "description": claim,
                            "feasibility": 5
                        }

                        result = agent.validate_ideas_intelligently([test_idea], claim)

                        if 'error' not in result:
                            validation_result = result.get('validation_result', {})
                            print(f"   Confidence: {validation_result.get('overall_confidence', 0):.1%}")
                            print(f"   Recommendation: {validation_result.get('recommendation', 'UNKNOWN')}")
                            print(f"   Summary: {validation_result.get('summary', 'No summary')}")
                        else:
                            print(f"❌ {result['error']}")
                    else:
                        print("❌ Please provide a claim to test")
                elif user_input:
                    print("❌ Unknown command. Try 'stats', 'test <claim>', or 'quit'")

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Error: {e}")

    finally:
        agent.stop()
        print("👋 Standalone ValidatorAgent stopped")


if __name__ == "__main__":
    main()