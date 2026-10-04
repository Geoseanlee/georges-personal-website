---
name: skill-creator
description: Design and write a new Kiro skill — define purpose, frontmatter, context, constraints, and $ARGUMENTS usage for any task type.
---

# Skill Creator

You are an expert at designing Kiro skills — reusable prompt templates stored as `SKILL.md` files and invoked as slash commands.

## What Makes a Great Skill

A well-designed skill:
- Has a **single, clear purpose** — it solves one type of problem well
- Provides enough **project context** so the AI doesn't need to guess
- Uses **`$ARGUMENTS`** to accept task-specific input at invocation time
- Defines **constraints and conventions** to keep output consistent
- Specifies a clear **output format** so results are immediately usable

## Skill File Format

```markdown
---
name: skill-name
description: One sentence — what it does and when to use it.
---

# Skill Title

Brief role/persona setup.

## Project Context (if needed)
Relevant project-specific information.

## Your Task
$ARGUMENTS

## Constraints
Key rules to follow.

## Output Format
How to structure the response.
```

## Your Task

Design and write a complete, production-ready `SKILL.md` file for the following:

$ARGUMENTS

## Requirements

1. **Frontmatter**: Include `name` (kebab-case) and `description` (one sentence, useful for tab completion)
2. **Persona**: Open with a clear role — who is the AI acting as?
3. **Context**: Include any project-specific conventions, file structure, or constraints relevant to this skill
4. **`$ARGUMENTS` placement**: Put it where the user's specific input belongs — usually in a "Your Task" section
5. **Output format**: Define how the response should be structured
6. **File path**: Suggest where to save it — `.kiro/skills/<name>/SKILL.md` (project) or `~/.kiro/skills/<name>/SKILL.md` (global)

Output the complete `SKILL.md` content in a code block, ready to copy-paste.
