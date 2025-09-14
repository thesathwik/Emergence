"""
Complete Customer Support + Billing Agent Collaboration Example
==============================================================

This example demonstrates a real-world scenario where a customer support agent
receives billing-related inquiries and collaborates with specialized billing agents
to provide accurate, context-aware responses.

Scenario: Customer emails asking about a payment issue, refund request, or billing inquiry.
The support agent identifies it as billing-related and delegates to billing specialists.
"""

import json
import re
from datetime import datetime, timedelta
from agent_core import AgentCore


class CustomerSupportAgent(AgentCore):
    """
    Customer Support Agent that handles general inquiries and routes 
    billing-related questions to specialized billing agents.
    """
    
    def __init__(self, config):
        super().__init__(config)
        
        # Initialize support-specific tools
        self.ticket_system = TicketSystem()
        self.email_templates = EmailTemplates()
        self.escalation_rules = EscalationRules()
        
        print("🎧 Customer Support Agent initialized")
    
    def declare_capabilities(self):
        """Declare what this support agent can do"""
        return [
            "customer-support", 
            "email-processing", 
            "ticket-management",
            "inquiry-routing"
        ]
    
    def declare_methods(self):
        """Methods other agents can call"""
        return {
            "handle_inquiry": "Process general customer inquiry",
            "create_ticket": "Create support ticket for complex issues",
            "escalate_issue": "Escalate issue to human support",
            "get_customer_history": "Retrieve customer interaction history",
            "send_followup": "Send follow-up email to customer"
        }
    
    def handle_agent_call(self, method, data):
        """Handle calls from other agents"""
        if method == "handle_inquiry":
            return self.process_customer_inquiry(data)
        elif method == "create_ticket":
            return self.create_support_ticket(data)
        elif method == "escalate_issue":
            return self.escalate_to_human(data)
        elif method == "get_customer_history":
            return self.get_customer_interaction_history(data)
        elif method == "send_followup":
            return self.send_followup_email(data)
        else:
            return {"error": f"Unknown method: {method}"}
    
    def run_cycle(self):
        """Main support agent cycle - process new inquiries"""
        print("🎧 Processing customer inquiries...")
        
        # Get new customer emails/tickets
        new_inquiries = self.get_new_inquiries()
        
        for inquiry in new_inquiries:
            try:
                result = self.process_customer_inquiry({
                    "inquiry_id": inquiry["id"],
                    "customer_email": inquiry["customer_email"],
                    "subject": inquiry["subject"],
                    "message": inquiry["message"],
                    "priority": inquiry.get("priority", "normal"),
                    "customer_id": inquiry.get("customer_id")
                })
                
                print(f"✅ Processed inquiry {inquiry['id']}: {result.get('status', 'completed')}")
                
            except Exception as e:
                print(f"❌ Failed to process inquiry {inquiry['id']}: {e}")
                self.escalate_to_human({
                    "inquiry_id": inquiry["id"], 
                    "reason": f"Processing error: {str(e)}"
                })
        
        return {"inquiries_processed": len(new_inquiries)}
    
    def process_customer_inquiry(self, inquiry_data):
        """
        Main inquiry processing logic with billing agent collaboration
        
        Args:
            inquiry_data: Dict containing inquiry details
            
        Returns:
            Dict with processing results
        """
        inquiry_id = inquiry_data["inquiry_id"]
        customer_email = inquiry_data["customer_email"]
        subject = inquiry_data["subject"]
        message = inquiry_data["message"]
        priority = inquiry_data.get("priority", "normal")
        
        print(f"📧 Processing inquiry {inquiry_id} from {customer_email}")
        print(f"📝 Subject: {subject}")
        
        # Step 1: Classify the inquiry type
        inquiry_type = self.classify_inquiry(subject, message)
        print(f"🏷️ Classified as: {inquiry_type}")
        
        # Step 2: Route based on inquiry type
        if inquiry_type in ["billing", "payment", "refund", "invoice", "subscription"]:
            return self.handle_billing_inquiry(inquiry_data, inquiry_type)
        elif inquiry_type in ["technical", "bug", "feature"]:
            return self.handle_technical_inquiry(inquiry_data)
        elif inquiry_type in ["account", "profile", "settings"]:
            return self.handle_account_inquiry(inquiry_data)
        else:
            return self.handle_general_inquiry(inquiry_data)
    
    def handle_billing_inquiry(self, inquiry_data, inquiry_type):
        """
        Handle billing-related inquiries by collaborating with billing agents
        """
        inquiry_id = inquiry_data["inquiry_id"]
        customer_email = inquiry_data["customer_email"]
        message = inquiry_data["message"]
        
        print(f"💰 Routing billing inquiry {inquiry_id} to billing specialists...")
        
        # Step 1: Find available billing agents
        billing_agents = self.find_agents("billing")
        if not billing_agents:
            print("❌ No billing agents available - handling manually")
            return self.handle_billing_manually(inquiry_data)
        
        print(f"✅ Found {len(billing_agents)} billing agents")
        
        # Step 2: Extract customer information for billing context
        customer_context = self.extract_customer_context(inquiry_data)
        
        # Step 3: Prepare billing-specific data
        billing_request = {
            "inquiry_id": inquiry_id,
            "customer_email": customer_email,
            "inquiry_type": inquiry_type,
            "message": message,
            "customer_context": customer_context,
            "priority": inquiry_data.get("priority", "normal"),
            "requested_by": "customer_support_agent"
        }
        
        # Step 4: Try billing agents in order of preference
        for i, agent in enumerate(billing_agents[:3]):  # Try up to 3 agents
            agent_id = agent["instance_id"]
            agent_name = agent["instance_name"]
            
            print(f"📞 Calling billing agent {agent_name} (attempt {i + 1}/3)")
            
            # Call appropriate method based on inquiry type
            if inquiry_type == "refund":
                response = self.call_agent(
                    agent_id, 
                    "process_refund_request", 
                    billing_request,
                    timeout=120  # Refunds may take time to process
                )
            elif inquiry_type == "payment":
                response = self.call_agent(
                    agent_id,
                    "handle_payment_issue",
                    billing_request,
                    timeout=90
                )
            elif inquiry_type == "invoice":
                response = self.call_agent(
                    agent_id,
                    "handle_invoice_inquiry",
                    billing_request,
                    timeout=60
                )
            elif inquiry_type == "subscription":
                response = self.call_agent(
                    agent_id,
                    "handle_subscription_inquiry", 
                    billing_request,
                    timeout=60
                )
            else:
                response = self.call_agent(
                    agent_id,
                    "handle_general_billing",
                    billing_request,
                    timeout=90
                )
            
            # Step 5: Process billing agent response
            if response and not response.get("error"):
                print(f"✅ Billing agent {agent_name} successfully handled inquiry")
                
                # Extract billing response details
                billing_result = response.get("result", {})
                customer_response = response.get("customer_response", "")
                actions_taken = response.get("actions_taken", [])
                requires_followup = response.get("requires_followup", False)
                
                # Step 6: Send response to customer
                self.send_customer_response(inquiry_data, {
                    "response_text": customer_response,
                    "billing_result": billing_result,
                    "agent_name": agent_name,
                    "inquiry_type": inquiry_type
                })
                
                # Step 7: Create ticket if follow-up needed
                if requires_followup:
                    ticket_id = self.create_support_ticket({
                        "inquiry_id": inquiry_id,
                        "customer_email": customer_email,
                        "issue_type": f"billing_{inquiry_type}_followup",
                        "description": f"Follow-up required for {inquiry_type} inquiry",
                        "billing_context": billing_result,
                        "actions_taken": actions_taken
                    })
                    print(f"🎫 Created follow-up ticket: {ticket_id}")
                
                # Step 8: Log successful collaboration
                self.log_agent_collaboration({
                    "inquiry_id": inquiry_id,
                    "support_agent": self.config["instance_name"],
                    "billing_agent": agent_name,
                    "inquiry_type": inquiry_type,
                    "result": "success",
                    "actions_taken": actions_taken
                })
                
                return {
                    "status": "completed",
                    "handled_by": "billing_agent",
                    "agent_name": agent_name,
                    "billing_result": billing_result,
                    "customer_notified": True,
                    "requires_followup": requires_followup
                }
            
            else:
                error_msg = response.get("error", "Unknown error") if response else "No response"
                print(f"❌ Billing agent {agent_name} failed: {error_msg}")
                
                # Try next agent or handle manually if all fail
                if i == len(billing_agents[:3]) - 1:  # Last attempt
                    print("❌ All billing agents failed - handling manually")
                    return self.handle_billing_manually(inquiry_data, {
                        "attempted_agents": [agent["instance_name"] for agent in billing_agents[:3]],
                        "last_error": error_msg
                    })
    
    def handle_billing_manually(self, inquiry_data, failure_context=None):
        """Fallback when billing agents are unavailable or fail"""
        inquiry_id = inquiry_data["inquiry_id"]
        
        print(f"🔧 Handling billing inquiry {inquiry_id} manually")
        
        # Create high-priority ticket for human review
        ticket_data = {
            "inquiry_id": inquiry_id,
            "customer_email": inquiry_data["customer_email"],
            "issue_type": "billing_agent_unavailable",
            "priority": "high",
            "description": "Billing inquiry requires manual handling - agents unavailable",
            "original_inquiry": inquiry_data,
            "failure_context": failure_context
        }
        
        ticket_id = self.create_support_ticket(ticket_data)
        
        # Send holding response to customer
        self.send_customer_response(inquiry_data, {
            "response_text": self.email_templates.get_billing_hold_response(),
            "ticket_id": ticket_id,
            "estimated_response_time": "24 hours"
        })
        
        return {
            "status": "manual_handling",
            "ticket_id": ticket_id,
            "customer_notified": True,
            "requires_human_review": True
        }
    
    def extract_customer_context(self, inquiry_data):
        """Extract relevant customer context for billing agents"""
        customer_email = inquiry_data["customer_email"]
        customer_id = inquiry_data.get("customer_id")
        
        # Get customer history and account info
        context = {
            "email": customer_email,
            "customer_id": customer_id,
            "recent_interactions": self.get_recent_customer_interactions(customer_email),
            "account_status": self.get_account_status(customer_email),
            "payment_history": self.get_payment_history_summary(customer_email)
        }
        
        return context
    
    def classify_inquiry(self, subject, message):
        """Classify inquiry type using keywords and patterns"""
        text = (subject + " " + message).lower()
        
        # Billing-related keywords
        billing_keywords = {
            "billing": ["bill", "billing", "charge", "charged"],
            "payment": ["payment", "pay", "card", "declined", "failed"],
            "refund": ["refund", "return", "money back", "reimburse"],
            "invoice": ["invoice", "receipt", "statement"],
            "subscription": ["subscription", "plan", "upgrade", "downgrade", "cancel"]
        }
        
        # Technical keywords
        technical_keywords = ["bug", "error", "broken", "not working", "issue", "problem"]
        
        # Account keywords  
        account_keywords = ["account", "profile", "settings", "password", "login"]
        
        # Check for billing types first (most specific)
        for billing_type, keywords in billing_keywords.items():
            if any(keyword in text for keyword in keywords):
                return billing_type
        
        # Check for technical issues
        if any(keyword in text for keyword in technical_keywords):
            return "technical"
        
        # Check for account issues
        if any(keyword in text for keyword in account_keywords):
            return "account"
        
        return "general"
    
    def send_customer_response(self, inquiry_data, response_data):
        """Send response email to customer"""
        # Implementation would integrate with email system
        print(f"📧 Sending response to {inquiry_data['customer_email']}")
        print(f"Response: {response_data['response_text'][:100]}...")
        return True
    
    def create_support_ticket(self, ticket_data):
        """Create a support ticket in the system"""
        # Implementation would integrate with ticketing system
        ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d')}-{ticket_data['inquiry_id']}"
        print(f"🎫 Created ticket: {ticket_id}")
        return ticket_id
    
    def log_agent_collaboration(self, collaboration_data):
        """Log successful agent collaboration for analytics"""
        # Implementation would log to monitoring system
        print(f"📊 Logged collaboration: {collaboration_data['support_agent']} -> {collaboration_data['billing_agent']}")
    
    # Mock methods for demonstration
    def get_new_inquiries(self):
        """Mock method - would integrate with email/ticket system"""
        return [
            {
                "id": "INQ-001",
                "customer_email": "customer@example.com",
                "subject": "Issue with my recent payment",
                "message": "Hi, I was charged twice for my subscription last month. Can you help me get a refund?",
                "priority": "normal",
                "customer_id": "CUST-12345"
            }
        ]
    
    def get_recent_customer_interactions(self, email):
        return []
    
    def get_account_status(self, email):
        return "active"
    
    def get_payment_history_summary(self, email):
        return {"last_payment": "2024-01-15", "status": "current"}


class BillingAgent(AgentCore):
    """
    Specialized Billing Agent that handles payment, refund, and subscription inquiries
    """
    
    def __init__(self, config):
        super().__init__(config)
        
        # Initialize billing-specific systems
        self.payment_gateway = PaymentGateway()
        self.subscription_manager = SubscriptionManager()
        self.refund_processor = RefundProcessor()
        
        print("💰 Billing Agent initialized")
    
    def declare_capabilities(self):
        """Specialized billing capabilities"""
        return [
            "billing",
            "payment-processing", 
            "refund-management",
            "subscription-management",
            "invoice-handling"
        ]
    
    def declare_methods(self):
        """Methods for handling specific billing operations"""
        return {
            "process_refund_request": "Process customer refund requests",
            "handle_payment_issue": "Resolve payment problems and failures", 
            "handle_invoice_inquiry": "Answer questions about invoices and charges",
            "handle_subscription_inquiry": "Manage subscription changes and cancellations",
            "handle_general_billing": "Handle general billing questions",
            "get_customer_billing_info": "Retrieve customer billing details",
            "process_payment_update": "Update customer payment methods"
        }
    
    def handle_agent_call(self, method, data):
        """Handle calls from customer support agents"""
        print(f"💰 Billing agent received call: {method}")
        
        if method == "process_refund_request":
            return self.process_refund_request(data)
        elif method == "handle_payment_issue":
            return self.handle_payment_issue(data)
        elif method == "handle_invoice_inquiry":
            return self.handle_invoice_inquiry(data)
        elif method == "handle_subscription_inquiry":
            return self.handle_subscription_inquiry(data)
        elif method == "handle_general_billing":
            return self.handle_general_billing(data)
        else:
            return {"error": f"Unknown billing method: {method}"}
    
    def process_refund_request(self, request_data):
        """
        Process a customer refund request
        
        Args:
            request_data: Dict with inquiry details and customer context
            
        Returns:
            Dict with refund processing results and customer response
        """
        print(f"🔄 Processing refund request for {request_data['customer_email']}")
        
        customer_email = request_data["customer_email"]
        message = request_data["message"]
        customer_context = request_data.get("customer_context", {})
        
        try:
            # Step 1: Analyze refund request
            refund_analysis = self.analyze_refund_eligibility(customer_email, message, customer_context)
            
            if not refund_analysis["eligible"]:
                # Not eligible for refund
                response_text = f"""
Hi there!

I've reviewed your refund request and unfortunately, based on our records and policy, 
this transaction doesn't qualify for a refund because: {refund_analysis['reason']}.

However, I'd be happy to help you with alternative solutions:
{refund_analysis.get('alternatives', 'Please contact our support team for assistance.')}

Best regards,
Billing Support Team
                """.strip()
                
                return {
                    "result": {
                        "refund_approved": False,
                        "reason": refund_analysis["reason"],
                        "alternatives_offered": True
                    },
                    "customer_response": response_text,
                    "actions_taken": ["eligibility_check", "policy_review"],
                    "requires_followup": False
                }
            
            # Step 2: Process eligible refund
            refund_result = self.process_eligible_refund(customer_email, refund_analysis)
            
            if refund_result["success"]:
                response_text = f"""
Hi there!

Good news! I've processed your refund request.

Refund Details:
• Amount: ${refund_result['amount']:.2f}
• Transaction ID: {refund_result['transaction_id']}
• Processing Time: {refund_result['processing_time']}
• Method: Refund to original payment method

You should see the refund reflected in your account within {refund_result['processing_time']}. 
If you have any questions or don't see the refund after this time, please don't hesitate to reach out.

Thank you for your patience!

Best regards,
Billing Support Team
                """.strip()
                
                return {
                    "result": {
                        "refund_approved": True,
                        "amount": refund_result["amount"],
                        "transaction_id": refund_result["transaction_id"],
                        "processing_time": refund_result["processing_time"]
                    },
                    "customer_response": response_text,
                    "actions_taken": ["refund_processed", "customer_notified"],
                    "requires_followup": True  # Follow up to ensure refund received
                }
            
            else:
                # Refund processing failed
                response_text = """
Hi there!

I've reviewed your refund request and while it qualifies for a refund, I encountered 
a technical issue processing it immediately. 

I've escalated this to our billing team for manual processing, and you should receive 
your refund within 3-5 business days. I'll send you a confirmation email once it's processed.

Thank you for your patience!

Best regards,
Billing Support Team
                """.strip()
                
                return {
                    "result": {
                        "refund_approved": True,
                        "processing_status": "manual_required",
                        "error": refund_result.get("error")
                    },
                    "customer_response": response_text,
                    "actions_taken": ["manual_escalation"],
                    "requires_followup": True
                }
                
        except Exception as e:
            print(f"❌ Error processing refund: {e}")
            return {
                "error": f"Refund processing error: {str(e)}",
                "requires_human_review": True
            }
    
    def handle_payment_issue(self, request_data):
        """Handle payment-related issues and failures"""
        print(f"💳 Handling payment issue for {request_data['customer_email']}")
        
        # Analyze payment issue and provide resolution
        customer_email = request_data["customer_email"]
        message = request_data["message"]
        
        # Check for common payment issues
        issue_analysis = self.analyze_payment_issue(customer_email, message)
        
        if issue_analysis["issue_type"] == "declined_card":
            response_text = """
Hi there!

I see you're having trouble with a declined payment. This is usually due to:

1. Insufficient funds in your account
2. Your bank flagging the transaction for security
3. Expired or incorrect card information

To resolve this:
• Check with your bank about the transaction
• Verify your card information is up to date
• Try using a different payment method

I can help you update your payment information if needed. Would you like me to send you a secure link to update your payment details?

Best regards,
Billing Support Team
            """.strip()
        
        elif issue_analysis["issue_type"] == "double_charge":
            # Process refund for duplicate charge
            refund_result = self.process_duplicate_charge_refund(customer_email)
            response_text = f"""
Hi there!

I found the duplicate charge on your account. I've processed a refund for ${refund_result['amount']:.2f}.

Refund Details:
• Amount: ${refund_result['amount']:.2f}  
• Transaction ID: {refund_result['transaction_id']}
• Processing Time: 3-5 business days

The refund will appear on your original payment method. Thank you for bringing this to our attention!

Best regards,
Billing Support Team
            """.strip()
        
        else:
            response_text = """
Hi there!

I've reviewed your payment issue and I'm looking into it. Based on your account, I see there may be a technical issue that requires manual review.

I've escalated this to our billing specialists who will investigate and contact you within 24 hours with a resolution.

Thank you for your patience!

Best regards,
Billing Support Team
            """.strip()
        
        return {
            "result": {
                "issue_type": issue_analysis["issue_type"],
                "resolution_provided": True
            },
            "customer_response": response_text,
            "actions_taken": ["issue_analysis", "resolution_provided"],
            "requires_followup": issue_analysis["issue_type"] == "complex"
        }
    
    # Mock methods for demonstration
    def analyze_refund_eligibility(self, customer_email, message, context):
        """Analyze if customer is eligible for refund"""
        # Mock implementation - would check actual policies and transaction history
        return {
            "eligible": True,
            "reason": "Within 30-day refund window",
            "transaction_amount": 29.99,
            "transaction_date": "2024-01-15"
        }
    
    def process_eligible_refund(self, customer_email, analysis):
        """Process an approved refund"""
        return {
            "success": True,
            "amount": analysis["transaction_amount"],
            "transaction_id": "REF-" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "processing_time": "3-5 business days"
        }
    
    def analyze_payment_issue(self, customer_email, message):
        """Analyze the type of payment issue"""
        if "declined" in message.lower() or "failed" in message.lower():
            return {"issue_type": "declined_card"}
        elif "twice" in message.lower() or "double" in message.lower():
            return {"issue_type": "double_charge"}
        else:
            return {"issue_type": "complex"}
    
    def process_duplicate_charge_refund(self, customer_email):
        """Process refund for duplicate charges"""
        return {
            "amount": 29.99,
            "transaction_id": "DUP-REF-" + datetime.now().strftime("%Y%m%d%H%M%S")
        }


# Mock classes for demonstration
class TicketSystem:
    def create_ticket(self, data):
        return f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

class EmailTemplates:
    def get_billing_hold_response(self):
        return "Thank you for contacting us. We're reviewing your billing inquiry and will respond within 24 hours."

class EscalationRules:
    def should_escalate(self, inquiry_type, customer_context):
        return False

class PaymentGateway:
    def process_refund(self, amount, transaction_id):
        return {"success": True, "refund_id": "REF-123"}

class SubscriptionManager:
    def get_subscription(self, customer_email):
        return {"plan": "premium", "status": "active"}

class RefundProcessor:
    def process_refund(self, customer_email, amount):
        return {"success": True, "processing_time": "3-5 days"}


if __name__ == "__main__":
    # Example usage and testing
    
    # Initialize agents with configuration
    support_config = {
        "agent_id": "customer_support",
        "instance_name": "support-agent-1", 
        "platform_url": "https://emergence-production.up.railway.app",
        "collaboration": {"max_retries": 3}
    }
    
    billing_config = {
        "agent_id": "billing_specialist",
        "instance_name": "billing-agent-1",
        "platform_url": "https://emergence-production.up.railway.app", 
        "collaboration": {"max_retries": 3}
    }
    
    # Create agent instances
    support_agent = CustomerSupportAgent(support_config)
    billing_agent = BillingAgent(billing_config)
    
    print("🚀 Starting customer support + billing collaboration example...")
    print("=" * 60)
    
    # Test the collaboration workflow
    support_agent.run_cycle()