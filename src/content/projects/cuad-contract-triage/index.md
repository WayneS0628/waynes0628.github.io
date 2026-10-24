---
title: CUAD Contract Triage
summary: A pipeline that finds the risky clauses in commercial contracts and ranks which contracts a legal team should open first. Built for Accenture with a 7-person Break Through Tech AI Studio team.
outcome: "Tells a legal team which contracts to open first."
verb: find
task: Multi-label clause detection + risk triage
data: CUAD, 510 commercial contracts, 41 expert-annotated clause types
model: TF-IDF + logistic regression baseline; fine-tuned transformer encoder in progress
metric: 0.683 macro F1, TF-IDF baseline on the official test split (10 priority clause types)
stack: [Python, scikit-learn, Hugging Face Transformers, PyTorch, pandas]
status: training
featured: true
team: 7-person Break Through Tech AI Studio team, for Accenture
github: https://github.com/Break-Through-Tech/Accenture-1T-contract-review-challenge
date: 2026-09-01
---

Legal and procurement teams review tens of thousands of contracts a year, and only a small number of clauses in them carry real risk: liability caps, change-of-control triggers, non-competes. This project builds a pipeline that finds those clauses automatically, flags each one Low, Medium, or High risk, and rolls them up into a contract-level triage score, so a reviewer knows which contracts to open first.

It's a Break Through Tech AI Studio project for Accenture, running September through December 2026, on the public [CUAD dataset](https://github.com/TheAtticusProject/cuad): 510 commercial contracts with 41 expert-annotated clause categories, split at the contract level into the official 408 training and 102 test contracts.

## The pipeline

Contract text → cleaning and chunking → multi-label clause classification → evidence spans → rule-based risk scoring → contract triage score.

The risk layer is deliberately rule-based. CUAD has no risk labels, so the scores have to be explainable and checked against rankings from our Accenture advisor, not learned from data that doesn't exist.

## My part

I own the **data loading and cleaning** workstream, the foundation every model in the repo reads from:

- Wrote the CUAD loader that turns each split into contracts, labeled spans, and a contract-by-category grid, including handling the answer-slot quirks in the official training file.
- Verified the character offsets on all **13,823** annotated spans while keeping the contract text byte-identical, so every label points at exactly the words an expert highlighted.
- Surfaced the imbalance problems early: one category (Price Restrictions) has **zero** positive examples in the test split, and eight have fewer than ten.

I also built the project's **shared evaluation module**, so the keyword baseline, the TF-IDF baseline, and the upcoming transformer are all scored on identical code, plus **per-category threshold tuning** on 5-fold cross-validation grouped by contract (chunks overlap, so splitting by chunk would leak).

The honest result: tuning gained **+0.023** macro F1 in cross-validation but lost **0.017** on the held-out test set. So the simpler untuned baseline stands as the bar the transformer has to beat. Reporting that beat quietly keeping the better-looking number.

## Results so far

Two baselines from the team, scored with the shared module on the official test split (102 contracts, 3,096 chunks), across the 10 priority clause types:

| Model | Macro precision | Macro recall | Macro F1 |
|---|---:|---:|---:|
| Keyword rules (26 hand-written patterns) | 0.499 | 0.661 | 0.545 |
| TF-IDF + logistic regression | 0.709 | 0.694 | 0.683 |

Clauses with fixed wording (Governing Law at 0.868 F1, Renewal Term at 0.824) are easy. Clauses that depend on *who may do what* (Change of Control at 0.442, Exclusivity at 0.511) are where bag-of-words runs out, and that's the gap the transformer is for.

## What's next

- **October:** fine-tune a transformer encoder for chunk-level multi-label classification and handle class imbalance.
- **November:** calibrate the risk-scoring layer and validate it with Spearman correlation against our advisor's hand-ranked clauses.
- **December:** an end-to-end pipeline producing risk-scored clause registers, plus a final report.

This page will update as the model trains.
