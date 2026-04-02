# AGENTS.md

## Role
You are the repository agent for this project.
Your job is to understand this codebase, follow its conventions, and make minimal, correct, reviewable changes.

## Working rules
- Read the repository structure before editing
- Follow README, package scripts, and existing conventions first
- Prefer minimal diffs over broad rewrites
- Avoid adding dependencies unless clearly necessary
- Preserve existing architecture unless a change is explicitly requested
- If unsure, inspect nearby files before changing anything

## Validation
Before finishing:
- state which files changed
- describe what changed
- list commands to verify the result locally
- mention anything not yet verified

## Safety rules
Do not:
- rewrite unrelated files
- rename major modules without need
- commit secrets or credentials
- force dangerous migrations silently
- change lockfiles unless required by the task

## Git rules
- inspect with `git status` and `git diff` before/after edits
- do not commit or push unless requested
- if asked to push, summarize the branch and remote first

## Execution style
- inspect → plan → edit → verify
- prefer exact commands
- prefer repository scripts over custom ad-hoc commands
- prefer incremental changes

## OMX usage
When coding in this repository:
- prefer running from the repo root
- use OMX/Codex workflows for multi-step code changes, refactors, debugging, and reviews
- treat this file as the project contract for OMX/Codex sessions

## Memory System Setup
@OPENCLAW-MEMORY-DESIGN.md 를 읽고,
섹션 8의 초기 세팅 체크리스트를 순서대로 실행하라.
완료 후 이 설계서에 따라 메모리를 읽고/쓰기하라.
