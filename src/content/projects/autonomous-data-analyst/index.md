---
title: Autonomous Data Analyst Agent
summary: An agent that takes a plain-English business question, writes SQL against a real database, runs Python analysis in a sandbox, makes charts, and writes up what it found.
outcome: "Turns a plain-English question into the query, the analysis, the chart, and the write-up."
verb: anticipate
task: Answer business questions end to end, autonomously
data: NYC taxi trip data in Postgres; BIRD text-to-SQL benchmark for evals (planned)
model: LLM agent with tool use, served through a custom MCP server
metric: Not measured yet
stack: [Python, MCP, Postgres, FastAPI, Docker, Langfuse]
status: planned
featured: false
date: 2026-11-01 # planned start; only the year is shown on the site
---

Ask a question the way you'd ask a teammate: *"Which neighborhoods saw the biggest drop in late-night rides last winter?"* The agent plans how to answer it, writes and runs the SQL, does the analysis in Python, makes the chart, and writes up the findings. No dashboard to click through, no query to write.

This is the next thing I'm building.

## How it will work

- **A custom MCP server** that gives the agent exactly three tools: `run_sql` (read-only), `run_python` (sandboxed), and `make_chart`.
- **An agent loop** that plans, calls tools, and corrects itself when a query fails.
- **Guardrails.** A read-only database role, human approval for anything destructive, and limits on tokens and cost.
- **Tracing** of every step, so every answer can be traced back to the exact queries and code behind it.

## How it will be judged

A demo that works once isn't the goal. The agent gets an eval suite of about 100 questions with known answers, measured on:

- **pass^1 vs pass^4:** does it get the right answer, and does it get it every time?
- **Cost per task** and **latency**
- **Failure categories,** written up in a post-mortem: where it breaks and why.

Real numbers go here when it ships. Until then, the status says what it is: `[next]`.
