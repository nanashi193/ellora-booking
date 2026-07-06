# Ellora AI Workflows

This document outlines the workflows for coordinating between AI coding agents (Antigravity/Codex), Git, and Hermes.

**Core Principle:** Codex/Antigravity are used to write code. Git is the single source of truth. Hermes is used to read diffs, conduct reviews, summarize changes, update documentation, and extract lessons learned.

## Workflow after Codex/Antigravity Completes a Task
1. Agent completes code changes and provides a summary.
2. Developer commits changes to Git.
3. Hermes is invoked to review the diff and output a summary.

## Workflow after Each Feature Commit
1. Trigger Hermes to analyze the latest commit.
2. Hermes extracts technical and product changes.
3. Hermes identifies if documentation updates are needed.

## Workflow for Reviewing UI Bugs
1. Provide the bug description and relevant code context to the agent.
2. Agent identifies the issue, paying special attention to mobile responsiveness and sticky element overlaps.
3. Apply fix and verify in mobile view.

## Workflow for Updating Documentation
1. Hermes analyzes the recent feature commits.
2. Hermes proposes documentation updates based on the changes.
3. Developer or Agent applies the documentation updates to the relevant `docs/` or `README.md` files.
