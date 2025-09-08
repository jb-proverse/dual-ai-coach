# {{projectTitle}}

## Overview
{{oneParagraphSummary}}

## Goals
- {{goal1}}
- {{goal2}}

## Tech Stack
- {{stack}}

## Milestones
{{#each milestones}}
### {{this.title}}
- Acceptance: {{#each this.acceptance}}{{this}}{{/each}}
- Status: {{this.progressPercent}}%
{{/each}}

## How to Run
```bash
{{runCommands}}
```

## Learnings
- {{learning1}}
- {{learning2}}
