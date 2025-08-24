class AgentCore:
    def __init__(self, config):
        """
        Initialize your agent here.
        The config contains all settings from config.json
        """
        self.config = config
        self.platform_client = None  # Will be set by main.py
        
        # TODO: Add your initialization code here
        # Example: self.email_client = EmailClient(config['email'])
        # Example: self.ai_model = OpenAI(config['openai_key'])
        
        print("🔧 Agent initialized - add your setup code in __init__")
    
    def declare_capabilities(self):
        """
        DEVELOPERS: Override this method to declare what your agent can do.
        Return a list of capabilities your agent provides.
        
        Available capabilities:
        - "email-processing"     - Handle emails, parse content, send responses
        - "data-processing"      - Process CSV, JSON, databases, analytics  
        - "customer-support"     - Handle customer inquiries, ticket management
        - "content-generation"   - Create articles, posts, documentation
        - "web-scraping"         - Extract data from websites
        - "api-integration"      - Connect to external APIs, data sync
        - "file-processing"      - Handle file uploads, conversions, parsing
        - "scheduling"           - Manage calendars, appointments, reminders
        - "database"             - Database operations, queries, migrations
        - "monitoring"           - System monitoring, alerts, health checks
        - "social-media"         - Post to social platforms, engagement
        - "image-processing"     - Image analysis, editing, optimization
        - "nlp"                  - Natural language processing, sentiment analysis
        - "ml-prediction"        - Machine learning models, predictions
        - "workflow-automation"  - Business process automation
        
        EXAMPLES:
        # Email processing agent
        return ["email-processing", "customer-support", "nlp"]
        
        # Data analysis agent
        return ["data-processing", "database", "ml-prediction"]
        
        # Content creation agent
        return ["content-generation", "nlp", "social-media"]
        
        # File management agent
        return ["file-processing", "data-processing", "api-integration"]
        """
        # TODO: Replace with your agent's actual capabilities
        return ["general-assistance"]
    
    def declare_methods(self):
        """
        DEVELOPERS: Override this to declare what methods other agents can call.
        Return a dictionary of method_name -> description.
        
        EXAMPLES:
        
        # Email processing agent methods
        return {
            "process_email": "Process incoming email and extract key information",
            "send_email": "Send email with given subject and body",
            "classify_email": "Classify email as support, sales, or billing",
            "extract_contact_info": "Extract contact information from email content"
        }
        
        # Data processing agent methods
        return {
            "analyze_csv": "Analyze CSV file and return insights",
            "generate_report": "Generate data analysis report",
            "clean_data": "Clean and normalize data",
            "run_prediction": "Run ML prediction on provided data"
        }
        
        # Customer support agent methods
        return {
            "handle_inquiry": "Process customer support inquiry",
            "escalate_ticket": "Escalate ticket to human support",
            "get_order_status": "Check status of customer order",
            "generate_response": "Generate response to customer query"
        }
        
        # Content generation agent methods
        return {
            "create_article": "Generate article on given topic",
            "create_social_post": "Create social media post",
            "proofread_content": "Proofread and improve content",
            "generate_summary": "Create summary of long content"
        }
        """
        # TODO: Replace with your agent's actual methods
        return {
            "help": "Provides general assistance",
            "status": "Returns current agent status"
        }
    
    def find_agents(self, capability=None, exclude_self=True):
        """
        Helper method to find other agents by capability.
        
        Args:
            capability (str): Required capability (e.g., "email-processing")
            exclude_self (bool): Don't include this agent in results
            
        Returns:
            list: Available agents matching criteria
            
        USAGE EXAMPLES:
        
        # Find all available agents
        all_agents = self.find_agents()
        print(f"Found {len(all_agents)} agents total")
        
        # Find agents that can process emails
        email_agents = self.find_agents("email-processing")
        for agent in email_agents:
            print(f"Email agent: {agent['instance_name']} - {agent['instance_id']}")
        
        # Find data processing agents
        data_agents = self.find_agents("data-processing")
        if data_agents:
            print(f"Found {len(data_agents)} data processing agents")
        else:
            print("No data processing agents available")
            
        # Find customer support agents
        support_agents = self.find_agents("customer-support")
        for agent in support_agents:
            print(f"Support agent {agent['instance_name']} has capabilities: {agent.get('capabilities', [])}")
        """
        if not self.platform_client:
            print("❌ Platform client not available")
            return []
            
        return self.platform_client.find_agents(capability, exclude_self)
    
    def call_agent(self, agent_id, method, data=None, timeout=30):
        """
        Helper method to call another agent's method.
        
        Args:
            agent_id (str): Target agent instance ID
            method (str): Method name to call
            data (dict): Data to send to the agent
            timeout (int): Timeout in seconds
            
        Returns:
            dict: Response from the target agent
            
        USAGE EXAMPLES:
        
        # Basic agent call
        response = self.call_agent("agent-123", "status")
        if response and not response.get("error"):
            print(f"Agent status: {response}")
        
        # Call email processing agent
        email_agents = self.find_agents("email-processing")
        if email_agents:
            agent_id = email_agents[0]["instance_id"]
            response = self.call_agent(agent_id, "process_email", {
                "subject": "Customer inquiry",
                "body": "How do I return an item?",
                "sender": "customer@example.com"
            })
            if response and not response.get("error"):
                print(f"Email processed: {response.get('result')}")
        
        # Call data processing agent with timeout
        data_agents = self.find_agents("data-processing")
        if data_agents:
            agent_id = data_agents[0]["instance_id"]
            response = self.call_agent(agent_id, "analyze_csv", {
                "file_path": "/path/to/data.csv",
                "analysis_type": "summary"
            }, timeout=60)  # Longer timeout for data processing
            
            if response and not response.get("error"):
                print(f"Analysis complete: {response.get('insights')}")
        
        # Error handling example
        response = self.call_agent("invalid-agent", "test_method")
        if response and response.get("error"):
            print(f"Call failed: {response['error']}")
        """
        if not self.platform_client:
            print("❌ Platform client not available")
            return None
            
        return self.platform_client.call_agent(agent_id, method, data, timeout)
    
    def handle_agent_call(self, method, data):
        """
        DEVELOPERS: Override this to handle calls from other agents.
        
        Args:
            method (str): Method name being called
            data (dict): Data sent by calling agent
            
        Returns:
            dict: Response to send back to calling agent
        """
        # TODO: Add your inter-agent method handling here
        
        if method == "help":
            return {"message": "This is a basic agent, override handle_agent_call for custom methods"}
        elif method == "status":
            return {"status": "running", "capabilities": self.declare_capabilities()}
        else:
            return {"error": f"Unknown method: {method}"}
        
    def run_cycle(self):
        """
        This method runs every 30 seconds.
        Add your main agent logic here.
        """
        # TODO: Replace this with your agent logic
        print("⚡ Agent cycle running - add your logic in run_cycle()")
        
        # ============================================
        # COMPREHENSIVE COLLABORATION EXAMPLES
        # ============================================
        
        # Example 1: Email Processing Workflow
        # ------------------------------------
        # new_emails = self.check_inbox()  # Your email checking logic
        # for email in new_emails:
        #     # Find specialized agents to help process the email
        #     if "billing" in email.subject.lower() or "payment" in email.body.lower():
        #         billing_agents = self.find_agents("billing")
        #         if billing_agents:
        #             response = self.call_agent(
        #                 billing_agents[0]["instance_id"],
        #                 "handle_billing_query",
        #                 {
        #                     "email_subject": email.subject,
        #                     "email_body": email.body,
        #                     "customer_email": email.sender
        #                 },
        #                 timeout=60
        #             )
        #             if response and not response.get("error"):
        #                 self.send_response(email, response["reply"])
        #             else:
        #                 print(f"❌ Billing agent call failed: {response.get('error')}")
        #                 self.escalate_to_human(email)
        #     
        #     elif "support" in email.subject.lower():
        #         support_agents = self.find_agents("customer-support")
        #         if support_agents:
        #             # Try multiple support agents for load balancing
        #             for agent in support_agents[:3]:  # Try up to 3 agents
        #                 response = self.call_agent(
        #                     agent["instance_id"],
        #                     "handle_inquiry",
        #                     {"inquiry": email.body, "priority": "normal"}
        #                 )
        #                 if response and not response.get("error"):
        #                     self.send_response(email, response["response"])
        #                     break
        #             else:
        #                 print("❌ All support agents failed")
        #                 self.handle_fallback(email)
        
        # Example 2: Data Processing Pipeline
        # -----------------------------------
        # data_files = self.check_for_new_data()  # Your file monitoring logic
        # for file_path in data_files:
        #     # Step 1: Find data cleaning agents
        #     cleaning_agents = self.find_agents("data-processing")
        #     if cleaning_agents:
        #         clean_response = self.call_agent(
        #             cleaning_agents[0]["instance_id"],
        #             "clean_data",
        #             {"file_path": file_path, "format": "csv"},
        #             timeout=120  # Data processing can take time
        #         )
        #         
        #         if clean_response and not clean_response.get("error"):
        #             cleaned_file = clean_response["cleaned_file_path"]
        #             
        #             # Step 2: Find analysis agents
        #             analysis_agents = self.find_agents("ml-prediction")
        #             if analysis_agents:
        #                 analysis_response = self.call_agent(
        #                     analysis_agents[0]["instance_id"],
        #                     "run_analysis",
        #                     {"data_file": cleaned_file, "model_type": "classification"}
        #                 )
        #                 
        #                 if analysis_response and not analysis_response.get("error"):
        #                     # Step 3: Generate report
        #                     report_agents = self.find_agents("content-generation")
        #                     if report_agents:
        #                         report_response = self.call_agent(
        #                             report_agents[0]["instance_id"],
        #                             "generate_report",
        #                             {
        #                                 "analysis_results": analysis_response["results"],
        #                                 "report_type": "executive_summary"
        #                             }
        #                         )
        #                         if report_response and not report_response.get("error"):
        #                             self.save_report(report_response["report"])
        
        # Example 3: Multi-Agent Coordination
        # -----------------------------------
        # # Get status from all agents in the system
        # all_agents = self.find_agents()  # Find all agents
        # agent_statuses = {}
        # 
        # for agent in all_agents:
        #     status_response = self.call_agent(
        #         agent["instance_id"], 
        #         "status",
        #         timeout=5  # Quick status check
        #     )
        #     agent_statuses[agent["instance_name"]] = status_response
        # 
        # # Check for overloaded agents and redistribute work
        # overloaded_agents = [
        #     name for name, status in agent_statuses.items() 
        #     if status and status.get("queue_size", 0) > 10
        # ]
        # 
        # if overloaded_agents:
        #     print(f"⚠️ Overloaded agents detected: {overloaded_agents}")
        #     # Implement load balancing logic here
        
        # Example 4: Error Handling and Fallbacks
        # ----------------------------------------
        # task = self.get_next_task()  # Your task queue logic
        # if task:
        #     required_capability = task.get("requires_capability")
        #     
        #     # Try to find agents with required capability
        #     capable_agents = self.find_agents(required_capability)
        #     
        #     if not capable_agents:
        #         print(f"❌ No agents found with capability: {required_capability}")
        #         # Fallback to general-purpose agents
        #         fallback_agents = self.find_agents("general-assistance")
        #         if fallback_agents:
        #             response = self.call_agent(
        #                 fallback_agents[0]["instance_id"],
        #                 "handle_generic_task",
        #                 {"task_data": task}
        #             )
        #             self.handle_task_result(task, response)
        #         else:
        #             print("❌ No fallback agents available")
        #             self.queue_for_later(task)
        #     else:
        #         # Try agents in order until one succeeds
        #         for agent in capable_agents:
        #             response = self.call_agent(
        #                 agent["instance_id"],
        #                 task["method"],
        #                 task["data"]
        #             )
        #             
        #             if response and not response.get("error"):
        #                 self.handle_task_result(task, response)
        #                 break
        #             else:
        #                 print(f"⚠️ Agent {agent['instance_name']} failed: {response.get('error')}")
        #         else:
        #             print("❌ All capable agents failed")
        #             self.escalate_task(task)
        
        # Example 5: Agent Health Monitoring
        # ----------------------------------
        # if self.should_check_agent_health():  # Your health check timing logic
        #     all_agents = self.find_agents()
        #     
        #     for agent in all_agents:
        #         health_response = self.call_agent(
        #             agent["instance_id"],
        #             "health_check",
        #             timeout=10
        #         )
        #         
        #         if not health_response or health_response.get("error"):
        #             print(f"🚨 Agent {agent['instance_name']} appears unhealthy")
        #             self.report_unhealthy_agent(agent["instance_id"])
        #         elif health_response.get("status") != "healthy":
        #             print(f"⚠️ Agent {agent['instance_name']} status: {health_response.get('status')}")
        
        # Example return metadata (optional):
        # return {
        #     "cycle_completed": True,
        #     "tasks_processed": len(processed_tasks),
        #     "agents_contacted": len(contacted_agents),
        #     "errors": error_count
        # }