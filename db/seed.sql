-- Idempotent seed data for the projects table.
-- Safe to re-run: existing rows are updated in place using the slug as the conflict key.

INSERT INTO projects (slug, title, project_type, year, description, tags, github_url, display_order, is_featured)
VALUES
  (
    'blotz-task-app',
    'Blotz Task App',
    'FULL-STACK · 2025',
    2025,
    'A task management app pairing a .NET API and SQL Server backend with a React Native mobile experience, featuring AI-powered task suggestions.',
    ARRAY['C# / .NET', 'React Native', 'SQL Server', 'AI features'],
    'https://github.com/sol-wizard/Blotz-Task-App',
    1,
    TRUE
  ),
  (
    'renopilot',
    'RenoPilot',
    'FULL-STACK · 2025',
    2025,
    'A renovation project management platform that helps homeowners track tasks, budgets, and contractors in one place.',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    'https://github.com/sol-wizard/RenoPilot',
    2,
    FALSE
  ),
  (
    'global-youth-sdgs-summit',
    'Global Youth SDGs Summit',
    'WEB · 2025',
    2025,
    'Official website for the Global Youth SDGs Summit, an international conference connecting young leaders committed to the UN Sustainable Development Goals.',
    ARRAY['React', 'TypeScript', 'Tailwind CSS'],
    'https://github.com/sol-wizard/global-youth-sdgs-summit',
    3,
    FALSE
  ),
  (
    'ai-health-management',
    'AI Health Management',
    'AI · 2024',
    2024,
    'An AI-assisted health management system that analyses patient data and surfaces personalised wellness recommendations.',
    ARRAY['Python', 'FastAPI', 'OpenAI', 'PostgreSQL'],
    'https://github.com/sol-wizard/ai-health-management',
    4,
    FALSE
  )
ON CONFLICT (slug) DO UPDATE
  SET
    title         = EXCLUDED.title,
    project_type  = EXCLUDED.project_type,
    year          = EXCLUDED.year,
    description   = EXCLUDED.description,
    tags          = EXCLUDED.tags,
    github_url    = EXCLUDED.github_url,
    display_order = EXCLUDED.display_order,
    is_featured   = EXCLUDED.is_featured;
