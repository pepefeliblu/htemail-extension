# AI Project Structure & Guidelines Template

This document defines the required files, conventions, and structures to ensure consistent long-term collaboration with AI agents during the development, maintenance, and evolution of this project.

---

# 1. Core Documentation

## 1.1 README.md
**Purpose:** Provide a clear overview of the project.  
**Must include:**
- Project summary
- Main features
- Tech stack
- Folder structure
- How to run the project
- How to run tests
- Deployment steps
- Required environment variables

---

## 1.2 ARCHITECTURE.md
**Purpose:** Enable AI and developers to understand how the system is built.  
**Must include:**
- High-level architecture
- Module boundaries
- Design decisions
- Data flow diagrams
- Integration points (APIs, DBs, queues, external services)
- Event or state flow explanations

---

## 1.3 CONTRIBUTING.md
**Purpose:** Standardize how development is performed.  
**Must include:**
- Coding style rules
- Naming conventions
- Branching strategy (GitFlow, trunk-based, etc.)
- Commit message rules (e.g., Conventional Commits)
- How to add new modules
- Testing standards

---

## 1.4 PROJECT_GOALS.md or VISION.md
**Purpose:** Keep long-term direction consistent.  
**Must include:**
- 3–6 month roadmap
- Long-term vision
- Core purpose of the project
- Boundaries: out-of-scope items

---

# 2. AI-Specific Documentation

## 2.1 AI_GUIDELINES.md
**Purpose:** Instruct AI agents how to work with the project.  
**Must include:**
- What the AI is allowed to modify
- What the AI must NOT modify
- Preferred architectural patterns (DI, hexagonal, MVC, etc.)
- Security rules (auth handling, secret management)
- Rules for refactoring
- Rules for adding or modifying dependencies

---

## 2.2 ai-agents/PROMPT_CONTEXT/ Folder
**Purpose:** Provide stable, evergreen information for AI to reference.  
**Structure:**
