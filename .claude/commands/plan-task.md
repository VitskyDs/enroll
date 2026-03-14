You are helping plan and create a new task in the Enroll project backlog.

First, read the backlog://workflow/task-creation resource to understand task creation best practices.

Then follow this process:

1. **Understand the request**: The user's task description is: $ARGUMENTS
   - If no description was provided, ask the user what task they'd like to create.

2. **Review existing tasks**: Use `mcp__backlog__task_list` with status "To Do" and "In Progress" to check for existing related work before creating anything new.

3. **Assess scope**: Determine whether this is a single atomic task or needs to be split into subtasks. Err on the side of a single task unless the work clearly spans multiple independent areas.

4. **Ask clarifying questions** if the requirements are ambiguous before creating the task.

5. **Create the task** using `mcp__backlog__task_create` with:
   - A clear, outcome-focused title in sentence case (no Title Case)
   - A description explaining the WHY and user value
   - Specific, testable acceptance criteria
   - Appropriate priority (default: medium)
   - References to relevant source files if applicable

6. **Report** the created task ID, title, and acceptance criteria to the user.

Follow the Enroll project conventions:
- Sentence case for all headings and titles
- No emojis
- Keep descriptions concise and direct
