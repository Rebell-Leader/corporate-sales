# Corporate Sales: TenderMatcher

## Overview
This project provides a complete solution for analyzing PDF tender notices, extracting relevant requirements, and automatically generating personalized RFQ (Request for Quotation) responses. It consists of a Python-based backend and a Next.js (React) frontend, both designed to be easy to install and operate.

## Features
• Drag-and-drop PDF extraction  
• Automated requirement parsing and summarization  
• Dynamic recommendation engine powered by a Node/Next.js frontend  
• Minimal configuration required  

## Tech Stack
• Python backend: parses PDFs, processes requests, exposes API endpoints  
• Next.js (React) frontend: offers a user interface for uploading PDFs, validating extracted criteria, and sending emails  
• HeroUI: modern React UI components for styling and UI interactions  
• Tailwind CSS: utility-first CSS framework  
• ESLint & Prettier: formatting and linting  
• Typescript: type-safe development  

## Installation & Setup

### 1. Requirements
• Node.js >= 16  
• Python >= 3.10  
• Bash-compatible shell (for startup scripts)  

### 2. Backend Setup
1. Navigate to the repository root.  
2. Create a .env file with required environment variables (if needed).  
3. Run ./start_backend.sh (or bash start_backend.sh) to install dependencies and start the backend.

### 3. Frontend Setup
1. Change directory to ./frontend.  
2. Run npm install to install all Node dependencies.  
3. Run npm run dev (or build & start) to serve the Next.js application.  
4. Open http://localhost:3000 to access the frontend.

## Directory Structure
• backend/ — Python code for parsing requirements and returning recommendations  
• frontend/ — Next.js, TypeScript, and HeroUI code  
• res/ — Example specs for demonstration  
• scripts/ — Startup helper scripts  
• README.md — Project documentation  

## Using the Application
1. Upload a tender PDF in the main interface.  
2. Review and update automatically extracted requirements under “Validate.”  
3. Click “Next” to review suggestions in the “Processing” page.  
4. Finalize & send generated RFQ emails in the “Email” page.

## API Endpoints
1. POST /api/extract — Accepts a PDF file, returns parsed requirements.  
2. POST /api/criteria — Accepts and processes user-updated criteria.  
3. POST /api/emails — Generates & sends emails based on recommendations.

## Tools & Libraries
• @heroui/theme & others: advanced styling, components, custom hooks  
• Tailwind CSS: utility classes  
• Next.js 15 (React 18): Server components, file-based routing  
• TypeScript 5.6: type definitions and improved DX  
• Python: main logic for PDF parsing (configurable in app.py)

## Contributing
1. Fork repository and create your branch.  
2. Commit changes following conventional commits.  
3. Submit pull requests for review.  

## License
Distributed under the BSD 3-Clause License. For details, see [LICENSE](./LICENSE).
