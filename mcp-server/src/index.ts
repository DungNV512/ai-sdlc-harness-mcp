#!/usr/bin/env node
/**
 * ai-sdlc-harness-mcp
 *
 * MCP server for the AI-SDLC harness POC (Stockbook project).
 *
 * Phase 1: Confluence (create_confluence_page, built to replace the hosted
 * Rovo MCP route that returns a persistent 404) + full Jira parity (12
 * tools, ported 1:1 from stockbookapp's bin/*.sh scripts -- see jira.ts for
 * the mapping of each tool to the script it mirrors).
 *
 * Phase 3 (GitHub half only -- GitLab tools deferred, same egress-block
 * reasoning documented in the plan): 3 GitHub tools, a read+create surface
 * only (create_github_pull_request, create_github_issue,
 * get_github_workflow_run_status) -- see github.ts.
 *
 * Phase 5: run_claude_code_command, a trigger tool that spawns a real
 * `claude` CLI process against a target repo checkout -- see claude-code.ts
 * for the verified (not guessed) flag mapping and execution-environment
 * notes.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createConfluencePage, loadConfigFromEnv } from "./confluence.js";
import {
  createGitHubIssue,
  createGitHubPullRequest,
  getGitHubWorkflowRunStatus,
  loadGitHubConfigFromEnv,
  requestGitHubPrReviewers,
} from "./github.js";
import { runClaudeCodeCommand } from "./claude-code.js";
import { loadTeamsConfigFromEnv, sendTeamsMessage } from "./teams.js";
import {
  addJiraComment,
  createJiraIssue,
  getJiraIssue,
  getJiraTransitions,
  linkJiraIssues,
  listJiraBoards,
  listJiraIssueTypes,
  listJiraSprints,
  loadJiraConfigFromEnv,
  searchJiraIssues,
  transitionJiraIssue,
  updateJiraComment,
  updateJiraIssue,
} from "./jira.js";

// ---------------------------------------------------------------------------
// Input schemas (zod, for runtime validation of tool arguments)
// ---------------------------------------------------------------------------

const CreateConfluencePageInputSchema = z.object({
  spaceId: z
    .string()
    .describe("Numeric Confluence space ID, or a space key (e.g. 'DAS') to resolve automatically."),
  title: z.string().describe("Title of the new page."),
  bodyHtml: z
    .string()
    .describe(
      "Page body in Confluence 'storage format' HTML (not Markdown, not the visual editor's format)."
    ),
  parentId: z.string().optional().describe("Optional numeric ID of the parent page."),
  status: z
    .enum(["current", "draft"])
    .optional()
    .describe("Page status. Defaults to 'current' (published)."),
});

const CreateJiraIssueInputSchema = z.object({
  projectKey: z.string().describe("Jira project key, e.g. 'SN'."),
  issueType: z.string().optional().describe("Issue type name. Defaults to 'Task'."),
  summary: z.string().describe("Issue summary/title."),
  description: z.string().optional().describe("Plain-text description (converted to ADF)."),
  assigneeId: z.string().optional().describe("Atlassian account ID of the assignee."),
  priorityId: z.string().optional().describe("Numeric priority ID."),
  labels: z.array(z.string()).optional().describe("Labels to attach."),
});

const UpdateJiraIssueInputSchema = z.object({
  issueKey: z.string().describe("Issue key, e.g. 'SN-91'."),
  body: z
    .record(z.string(), z.unknown())
    .describe(
      "Full Jira 'edit issue' payload (e.g. {\"fields\": {...}} or {\"update\": {...}}), passed through as-is."
    ),
});

const GetJiraIssueInputSchema = z.object({
  issueKey: z.string().describe("Issue key, e.g. 'SN-91'."),
  fields: z.string().optional().describe("Comma-separated field list. Defaults to '*all'."),
  expand: z.string().optional().describe("Optional expand parameter."),
});

const SearchJiraIssuesInputSchema = z.object({
  jql: z.string().describe("JQL query."),
  maxResults: z.number().optional().describe("Defaults to 50."),
  fields: z
    .array(z.string())
    .optional()
    .describe("Defaults to summary,status,assignee,issuetype,priority."),
  nextPageToken: z.string().optional().describe("Pagination token from a previous search."),
});

const AddJiraCommentInputSchema = z.object({
  issueKey: z.string().describe("Issue key, e.g. 'SN-91'."),
  text: z.string().describe("Comment text (single paragraph, converted to ADF)."),
});

const UpdateJiraCommentInputSchema = z.object({
  issueKey: z.string().describe("Issue key, e.g. 'SN-91'."),
  commentId: z.string().describe("Comment ID to update."),
  text: z
    .string()
    .describe("New comment text. Each newline becomes a separate ADF paragraph."),
});

const TransitionJiraIssueInputSchema = z.object({
  issueKey: z.string().describe("Issue key, e.g. 'SN-91'."),
  transitionId: z.string().optional().describe("Transition ID (from get_jira_transitions)."),
  transitionName: z.string().optional().describe("Transition name, alternative to transitionId."),
  resolution: z.string().optional().describe("Resolution name to set, if applicable."),
});

const GetJiraTransitionsInputSchema = z.object({
  issueKey: z.string().describe("Issue key, e.g. 'SN-91'."),
});

const LinkJiraIssuesInputSchema = z.object({
  outwardKey: z.string().describe("The issue that 'links to' the other."),
  inwardKey: z.string().describe("The issue that 'is linked from' the other."),
  linkType: z.string().optional().describe("Link type name. Defaults to 'Relates'."),
});

const ListJiraBoardsInputSchema = z.object({
  projectKey: z.string().optional().describe("Filter boards by project key."),
  boardType: z.string().optional().describe("Filter boards by type (e.g. 'scrum', 'kanban')."),
});

const ListJiraSprintsInputSchema = z.object({
  boardId: z.string().describe("Board ID (from list_jira_boards)."),
  state: z.string().optional().describe("Filter by sprint state (e.g. 'active', 'future', 'closed')."),
});

const ListJiraIssueTypesInputSchema = z.object({
  projectKey: z.string().describe("Jira project key, e.g. 'SN'."),
});

const CreateGitHubPullRequestInputSchema = z.object({
  owner: z.string().describe("Repository owner (user or org), e.g. 'DungNV512'."),
  repo: z.string().describe("Repository name, e.g. 'ai-sdlc-harness-mcp'."),
  title: z.string().describe("Pull request title."),
  head: z.string().describe("Branch to merge from (or 'owner:branch' for a cross-repo/fork PR)."),
  base: z.string().describe("Branch to merge into, e.g. 'main'."),
  body: z.string().optional().describe("Pull request description (Markdown)."),
  draft: z.boolean().optional().describe("Open as a draft PR. Defaults to false."),
});

const RequestGitHubPrReviewersInputSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  pullNumber: z.number().int().positive(),
  reviewers: z.array(z.string()).optional(),
  teamReviewers: z.array(z.string()).optional(),
});

const SendTeamsMessageInputSchema = z.object({
  title: z.string().describe("Card headline, e.g. 'Skill awaiting approval'."),
  text: z.string().describe("Body text. Markdown-lite; keep it short and put detail behind an action link."),
  severity: z
    .enum(["info", "success", "warning", "danger"])
    .optional()
    .describe("Colors the headline. Defaults to 'info'."),
  facts: z
    .array(z.object({ name: z.string(), value: z.string() }))
    .optional()
    .describe("Key/value rows rendered as a FactSet, e.g. PR number, Jira key, reviewer."),
  actions: z
    .array(z.object({ title: z.string(), url: z.string() }))
    .optional()
    .describe("Buttons that open a URL, e.g. the PR and the Jira ticket."),
});

const CreateGitHubIssueInputSchema = z.object({
  owner: z.string().describe("Repository owner (user or org), e.g. 'DungNV512'."),
  repo: z.string().describe("Repository name, e.g. 'ai-sdlc-harness-mcp'."),
  title: z.string().describe("Issue title."),
  body: z.string().optional().describe("Issue body (Markdown)."),
  labels: z.array(z.string()).optional().describe("Labels to attach."),
  assignees: z.array(z.string()).optional().describe("GitHub usernames to assign."),
});

const GetGitHubWorkflowRunStatusInputSchema = z.object({
  owner: z.string().describe("Repository owner (user or org), e.g. 'DungNV512'."),
  repo: z.string().describe("Repository name, e.g. 'ai-sdlc-harness-mcp'."),
  runId: z.string().describe("Workflow run ID."),
});

const RunClaudeCodeCommandInputSchema = z.object({
  cwd: z.string().describe("Absolute path to the target repo checkout Claude Code should run in."),
  prompt: z.string().describe("The prompt or slash command to run, e.g. '/status' or '/ship-feature FR-013'."),
  outputFormat: z.enum(["text", "json"]).optional().describe("Defaults to 'json' (parseable). 'text' returns raw output."),
  allowedTools: z.array(z.string()).optional().describe("Tools to allow without prompting, e.g. ['Bash(git diff:*)', 'Edit']."),
  permissionMode: z
    .string()
    .optional()
    .describe("One of: default, acceptEdits, plan, auto, dontAsk, bypassPermissions, manual. Required in practice for a non-interactive run to avoid hanging on a permission prompt."),
  bare: z
    .boolean()
    .optional()
    .describe("Skip hooks/skills/commands/subagents/plugins/MCP servers/auto-memory/CLAUDE.md. Defaults to false -- the AI-SDLC harness needs these loaded."),
  continueSession: z.boolean().optional().describe("Maps to --continue: resume the most recent session in this cwd."),
  resumeSessionId: z.string().optional().describe("Maps to --resume <id>: resume a specific session."),
});

// ---------------------------------------------------------------------------
// Tool registry: name -> { description, inputSchema (JSON Schema for
// tools/list), parse (zod parser for tools/call), handler }
// ---------------------------------------------------------------------------

interface ToolDef {
  description: string;
  jsonSchema: Record<string, unknown>;
  parse: (args: unknown) => unknown;
  handler: (args: any) => Promise<unknown>;
}

const tools: Record<string, ToolDef> = {
  create_confluence_page: {
    description:
      "Create a new Confluence Cloud page via the REST API v2 (storage-format body). " +
      "Built as a working alternative to the hosted Rovo MCP createConfluencePage tool, " +
      "which returns a persistent 404. Requires CONFLUENCE_SITE, ATLASSIAN_EMAIL and " +
      "ATLASSIAN_API_TOKEN to be set in the environment.",
    jsonSchema: {
      type: "object",
      properties: {
        spaceId: { type: "string", description: "Numeric Confluence space ID, or a space key (e.g. 'DAS') to resolve automatically." },
        title: { type: "string", description: "Title of the new page." },
        bodyHtml: { type: "string", description: "Page body in Confluence 'storage format' HTML (not Markdown, not the visual editor's format)." },
        parentId: { type: "string", description: "Optional numeric ID of the parent page." },
        status: { type: "string", enum: ["current", "draft"], description: "Page status. Defaults to 'current' (published)." },
      },
      required: ["spaceId", "title", "bodyHtml"],
    },
    parse: (a) => CreateConfluencePageInputSchema.parse(a),
    handler: async (input) => {
      const cfg = loadConfigFromEnv();
      return createConfluencePage(cfg, input);
    },
  },

  create_jira_issue: {
    description: "Create a new Jira Cloud issue. Mirrors bin/create-jira-issue.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        projectKey: { type: "string", description: "Jira project key, e.g. 'SN'." },
        issueType: { type: "string", description: "Issue type name. Defaults to 'Task'." },
        summary: { type: "string", description: "Issue summary/title." },
        description: { type: "string", description: "Plain-text description (converted to ADF)." },
        assigneeId: { type: "string", description: "Atlassian account ID of the assignee." },
        priorityId: { type: "string", description: "Numeric priority ID." },
        labels: { type: "array", items: { type: "string" }, description: "Labels to attach." },
      },
      required: ["projectKey", "summary"],
    },
    parse: (a) => CreateJiraIssueInputSchema.parse(a),
    handler: async (input) => createJiraIssue(loadJiraConfigFromEnv(), input),
  },

  update_jira_issue: {
    description:
      "Update an existing Jira issue (PUT /rest/api/3/issue/{key}). Passthrough by design, " +
      "mirroring bin/update-jira-issue.sh: pass the full Jira edit-issue payload " +
      '(e.g. {"fields": {"summary": "new title"}}).',
    jsonSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "Issue key, e.g. 'SN-91'." },
        body: { type: "object", description: "Full Jira edit-issue payload, passed through as-is." },
      },
      required: ["issueKey", "body"],
    },
    parse: (a) => UpdateJiraIssueInputSchema.parse(a),
    handler: async (input) => {
      await updateJiraIssue(loadJiraConfigFromEnv(), input.issueKey, input.body);
      return { updated: input.issueKey };
    },
  },

  get_jira_issue: {
    description: "Fetch a Jira issue by key. Mirrors bin/fetch-jira-issue.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "Issue key, e.g. 'SN-91'." },
        fields: { type: "string", description: "Comma-separated field list. Defaults to '*all'." },
        expand: { type: "string", description: "Optional expand parameter." },
      },
      required: ["issueKey"],
    },
    parse: (a) => GetJiraIssueInputSchema.parse(a),
    handler: async (input) =>
      getJiraIssue(loadJiraConfigFromEnv(), input.issueKey, input.fields, input.expand),
  },

  search_jira_issues: {
    description: "Search Jira issues by JQL. Mirrors bin/search-jira-issues.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        jql: { type: "string", description: "JQL query." },
        maxResults: { type: "number", description: "Defaults to 50." },
        fields: { type: "array", items: { type: "string" }, description: "Defaults to summary,status,assignee,issuetype,priority." },
        nextPageToken: { type: "string", description: "Pagination token from a previous search." },
      },
      required: ["jql"],
    },
    parse: (a) => SearchJiraIssuesInputSchema.parse(a),
    handler: async (input) => searchJiraIssues(loadJiraConfigFromEnv(), input),
  },

  add_jira_comment: {
    description: "Add a comment to a Jira issue. Mirrors bin/add-jira-comment.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "Issue key, e.g. 'SN-91'." },
        text: { type: "string", description: "Comment text (single paragraph, converted to ADF)." },
      },
      required: ["issueKey", "text"],
    },
    parse: (a) => AddJiraCommentInputSchema.parse(a),
    handler: async (input) => addJiraComment(loadJiraConfigFromEnv(), input.issueKey, input.text),
  },

  update_jira_comment: {
    description: "Update an existing Jira comment. Mirrors bin/update-jira-comment.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "Issue key, e.g. 'SN-91'." },
        commentId: { type: "string", description: "Comment ID to update." },
        text: { type: "string", description: "New comment text. Each newline becomes a separate ADF paragraph." },
      },
      required: ["issueKey", "commentId", "text"],
    },
    parse: (a) => UpdateJiraCommentInputSchema.parse(a),
    handler: async (input) =>
      updateJiraComment(loadJiraConfigFromEnv(), input.issueKey, input.commentId, input.text),
  },

  transition_jira_issue: {
    description: "Transition a Jira issue's status. Mirrors bin/transition-jira-issue.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "Issue key, e.g. 'SN-91'." },
        transitionId: { type: "string", description: "Transition ID (from get_jira_transitions)." },
        transitionName: { type: "string", description: "Transition name, alternative to transitionId." },
        resolution: { type: "string", description: "Resolution name to set, if applicable." },
      },
      required: ["issueKey"],
    },
    parse: (a) => TransitionJiraIssueInputSchema.parse(a),
    handler: async (input) => {
      await transitionJiraIssue(loadJiraConfigFromEnv(), input.issueKey, input);
      return { transitioned: input.issueKey };
    },
  },

  get_jira_transitions: {
    description: "List available transitions for a Jira issue. Mirrors bin/get-jira-transitions.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        issueKey: { type: "string", description: "Issue key, e.g. 'SN-91'." },
      },
      required: ["issueKey"],
    },
    parse: (a) => GetJiraTransitionsInputSchema.parse(a),
    handler: async (input) => getJiraTransitions(loadJiraConfigFromEnv(), input.issueKey),
  },

  link_jira_issues: {
    description: "Link two Jira issues. Mirrors bin/link-jira-issues.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        outwardKey: { type: "string", description: "The issue that 'links to' the other." },
        inwardKey: { type: "string", description: "The issue that 'is linked from' the other." },
        linkType: { type: "string", description: "Link type name. Defaults to 'Relates'." },
      },
      required: ["outwardKey", "inwardKey"],
    },
    parse: (a) => LinkJiraIssuesInputSchema.parse(a),
    handler: async (input) => {
      await linkJiraIssues(loadJiraConfigFromEnv(), input.outwardKey, input.inwardKey, input.linkType);
      return { linked: [input.outwardKey, input.inwardKey] };
    },
  },

  list_jira_boards: {
    description: "List Jira Agile boards. Mirrors bin/list-jira-boards.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        projectKey: { type: "string", description: "Filter boards by project key." },
        boardType: { type: "string", description: "Filter boards by type (e.g. 'scrum', 'kanban')." },
      },
    },
    parse: (a) => ListJiraBoardsInputSchema.parse(a),
    handler: async (input) => listJiraBoards(loadJiraConfigFromEnv(), input.projectKey, input.boardType),
  },

  list_jira_sprints: {
    description: "List sprints on a Jira Agile board. Mirrors bin/list-jira-sprints.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        boardId: { type: "string", description: "Board ID (from list_jira_boards)." },
        state: { type: "string", description: "Filter by sprint state (e.g. 'active', 'future', 'closed')." },
      },
      required: ["boardId"],
    },
    parse: (a) => ListJiraSprintsInputSchema.parse(a),
    handler: async (input) => listJiraSprints(loadJiraConfigFromEnv(), input.boardId, input.state),
  },

  list_jira_issue_types: {
    description: "List issue types available for a Jira project. Mirrors bin/list-jira-issue-types.sh.",
    jsonSchema: {
      type: "object",
      properties: {
        projectKey: { type: "string", description: "Jira project key, e.g. 'SN'." },
      },
      required: ["projectKey"],
    },
    parse: (a) => ListJiraIssueTypesInputSchema.parse(a),
    handler: async (input) => listJiraIssueTypes(loadJiraConfigFromEnv(), input.projectKey),
  },

  create_github_pull_request: {
    description:
      "Create a GitHub pull request (POST /repos/{owner}/{repo}/pulls). Requires GITHUB_TOKEN " +
      "(a PAT with repo scope) to be set in the environment.",
    jsonSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner (user or org), e.g. 'DungNV512'." },
        repo: { type: "string", description: "Repository name, e.g. 'ai-sdlc-harness-mcp'." },
        title: { type: "string", description: "Pull request title." },
        head: { type: "string", description: "Branch to merge from (or 'owner:branch' for a cross-repo/fork PR)." },
        base: { type: "string", description: "Branch to merge into, e.g. 'main'." },
        body: { type: "string", description: "Pull request description (Markdown)." },
        draft: { type: "boolean", description: "Open as a draft PR. Defaults to false." },
      },
      required: ["owner", "repo", "title", "head", "base"],
    },
    parse: (a) => CreateGitHubPullRequestInputSchema.parse(a),
    handler: async (input) => createGitHubPullRequest(loadGitHubConfigFromEnv(), input),
  },

  create_github_issue: {
    description: "Create a GitHub issue (POST /repos/{owner}/{repo}/issues). Requires GITHUB_TOKEN.",
    jsonSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner (user or org), e.g. 'DungNV512'." },
        repo: { type: "string", description: "Repository name, e.g. 'ai-sdlc-harness-mcp'." },
        title: { type: "string", description: "Issue title." },
        body: { type: "string", description: "Issue body (Markdown)." },
        labels: { type: "array", items: { type: "string" }, description: "Labels to attach." },
        assignees: { type: "array", items: { type: "string" }, description: "GitHub usernames to assign." },
      },
      required: ["owner", "repo", "title"],
    },
    parse: (a) => CreateGitHubIssueInputSchema.parse(a),
    handler: async (input) => createGitHubIssue(loadGitHubConfigFromEnv(), input),
  },

  get_github_workflow_run_status: {
    description:
      "Get a GitHub Actions workflow run's status (GET /repos/{owner}/{repo}/actions/runs/{run_id}). " +
      "Returns { status, conclusion, html_url }. Requires GITHUB_TOKEN.",
    jsonSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner (user or org), e.g. 'DungNV512'." },
        repo: { type: "string", description: "Repository name, e.g. 'ai-sdlc-harness-mcp'." },
        runId: { type: "string", description: "Workflow run ID." },
      },
      required: ["owner", "repo", "runId"],
    },
    parse: (a) => GetGitHubWorkflowRunStatusInputSchema.parse(a),
    handler: async (input) =>
      getGitHubWorkflowRunStatus(loadGitHubConfigFromEnv(), input.owner, input.repo, input.runId),
  },

  run_claude_code_command: {
    description:
      "Trigger a headless Claude Code run (`claude -p ...`) against a target repo checkout, from " +
      "outside the editor (e.g. from a Teams message or a CI job). Requires a `claude` CLI on PATH " +
      "and a writable checkout at `cwd` -- this only makes sense configured on a machine that has " +
      "both, not inside a container with no persistent checkout. Does NOT default to --bare, since " +
      "that would skip hooks/skills/commands/subagents/plugins/MCP servers -- exactly what a " +
      "triggered AI-SDLC harness command needs loaded. Never throws on a non-zero exit code; the " +
      "result's exitCode/stdout/stderr let the caller distinguish 'Claude Code ran and reported a " +
      "failure' from 'the process itself never completed'.",
    jsonSchema: {
      type: "object",
      properties: {
        cwd: { type: "string", description: "Absolute path to the target repo checkout Claude Code should run in." },
        prompt: { type: "string", description: "The prompt or slash command to run, e.g. '/status' or '/ship-feature FR-013'." },
        outputFormat: { type: "string", enum: ["text", "json"], description: "Defaults to 'json' (parseable). 'text' returns raw output." },
        allowedTools: { type: "array", items: { type: "string" }, description: "Tools to allow without prompting, e.g. ['Bash(git diff:*)', 'Edit']." },
        permissionMode: { type: "string", description: "One of: default, acceptEdits, plan, auto, dontAsk, bypassPermissions, manual." },
        bare: { type: "boolean", description: "Skip hooks/skills/commands/subagents/plugins/MCP servers/auto-memory/CLAUDE.md. Defaults to false." },
        continueSession: { type: "boolean", description: "Maps to --continue: resume the most recent session in this cwd." },
        resumeSessionId: { type: "string", description: "Maps to --resume <id>: resume a specific session." },
      },
      required: ["cwd", "prompt"],
    },
    parse: (a) => RunClaudeCodeCommandInputSchema.parse(a),
    handler: async (input) => runClaudeCodeCommand(input),
  },

  request_github_pr_reviewers: {
    description:
      "Request review on a GitHub pull request (POST .../pulls/{n}/requested_reviewers). Requires " +
      "GITHUB_TOKEN. Still a create-only surface: this creates a review request; it does not " +
      "approve, merge or close. GitHub rejects naming the PR's own author with a 422, which is " +
      "surfaced as an error rather than swallowed -- a Teams notification must never claim a " +
      "reviewer was assigned when they were not.",
    jsonSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner, e.g. 'DungNV512'." },
        repo: { type: "string", description: "Repository name, e.g. 'ai-sdlc-harness-mcp'." },
        pullNumber: { type: "number", description: "Pull request number." },
        reviewers: { type: "array", items: { type: "string" }, description: "GitHub usernames to request review from." },
        teamReviewers: { type: "array", items: { type: "string" }, description: "Org team slugs to request review from." },
      },
      required: ["owner", "repo", "pullNumber"],
    },
    parse: (a) => RequestGitHubPrReviewersInputSchema.parse(a),
    handler: async (input) => requestGitHubPrReviewers(loadGitHubConfigFromEnv(), input),
  },

  send_teams_message: {
    description:
      "Post an Adaptive Card notification to a Microsoft Teams channel or chat via a Workflows " +
      "(Power Automate) webhook. Requires TEAMS_WEBHOOK_URL. Note this targets the CURRENT Teams " +
      "mechanism -- Microsoft retired the classic Office 365 Connector incoming webhook; the URL " +
      "comes from Teams: More options -> Workflows -> a webhook-alert template -> Save. The URL is " +
      "itself the credential (it carries a `sig` parameter), so it lives in an env var, is never " +
      "committed, and is redacted before it can appear in any error returned by this tool. " +
      "Enforces the documented 28 KB message cap up front rather than letting Teams fail opaquely.",
    jsonSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Card headline, e.g. 'Skill awaiting approval'." },
        text: { type: "string", description: "Body text. Keep short; put detail behind an action link." },
        severity: { type: "string", enum: ["info", "success", "warning", "danger"], description: "Colors the headline. Defaults to 'info'." },
        facts: {
          type: "array",
          description: "Key/value rows rendered as a FactSet, e.g. PR number, Jira key, reviewer.",
          items: {
            type: "object",
            properties: { name: { type: "string" }, value: { type: "string" } },
            required: ["name", "value"],
          },
        },
        actions: {
          type: "array",
          description: "Buttons that open a URL, e.g. the PR and the Jira ticket.",
          items: {
            type: "object",
            properties: { title: { type: "string" }, url: { type: "string" } },
            required: ["title", "url"],
          },
        },
      },
      required: ["title", "text"],
    },
    parse: (a) => SendTeamsMessageInputSchema.parse(a),
    handler: async (input) => sendTeamsMessage(loadTeamsConfigFromEnv(), input),
  },
};

// ---------------------------------------------------------------------------
// Server wiring
// ---------------------------------------------------------------------------

const server = new Server(
  { name: "ai-sdlc-harness-mcp", version: "0.4.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(tools).map(([name, def]) => ({
    name,
    description: def.description,
    inputSchema: def.jsonSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const def = tools[request.params.name];
  if (!def) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    const input = def.parse(request.params.arguments);
    const result = await def.handler(input);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`ai-sdlc-harness-mcp: server running on stdio (${Object.keys(tools).length} tools)`);
}

main().catch((err) => {
  console.error("Fatal error running server:", err);
  process.exit(1);
});
