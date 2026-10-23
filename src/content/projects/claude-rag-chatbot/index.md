---
title: Claude RAG Chatbot
summary: A Streamlit chatbot on the Claude API that routes each question to the
  right knowledge base and answers grounded in it.
task: Retrieval-augmented question answering
data: Knowledge base files on Harvard, Cornell, and Duke
model: Claude Haiku as router, Claude for generation
stack:
  - Python
  - Streamlit
  - Anthropic API
status: shipped
featured: false
github: https://github.com/WayneS0628/claude-rag-chatbot
date: 2026-10-20
draft: false
---
A small RAG (retrieval-augmented generation) chatbot built during my Break Through Tech AI fellowship. The original course exercise was written for OpenAI; I ported it to Anthropic because I wanted to actually learn the Claude API.

Ask it about Harvard, Cornell, or Duke and it will:

1. **Retrieve.** A fast Haiku call acts as a router and picks which knowledge base file is relevant.
2. **Augment.** That file gets dropped into the system prompt.
3. **Generate.** Claude streams back an answer grounded in the document.

Ask it about anything else and it behaves like a normal chatbot. It doesn't pretend to know things about your school.

## The part that fought back

Streamlit reruns the whole script on every interaction, so chat history has to live in session state. Meanwhile, the Anthropic API requires the conversation to start with a user message, and my friendly greeting was breaking the very first question. The fix: strip the greeting before each API call, and roll back any unanswered turns if a call fails.

## What's next

Right now it sends the whole document every turn. Once the files get big, the router gets replaced with chunking, embeddings, and top-k similarity search. Retrieval changes; steps 2 and 3 stay exactly the same.
