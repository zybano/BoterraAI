import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { PlanId } from "./catalog/plans";

/**
 * A small JSON-file document store. It keeps the MVP dependency-free and easy
 * to run anywhere with a writable disk. Every read/write goes through the
 * repository functions below, so swapping in Postgres (e.g. via Prisma or
 * Drizzle) later only touches this file.
 */

export type Autonomy = "advise" | "assist" | "autopilot";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  workspaceId: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  ownerId: string;
  businessName: string;
  industryId: string;
  country: string;
  currency: string;
  teamSize: string;
  monthlyRevenue: string;
  description: string;
  goals: string[];
  activeAgentIds: string[];
  autonomy: Autonomy;
  plan: PlanId;
  billingCycle: "monthly" | "yearly";
  trialEndsAt: string | null;
  creditsUsed: number;
  creditsPeriodStart: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  agentId: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface MissionAssignment {
  agentId: string;
  task: string;
  output: string;
}

export interface MissionAction {
  id: string;
  title: string;
  agentId: string;
  risk: "low" | "medium" | "high";
}

export interface Mission {
  id: string;
  workspaceId: string;
  goal: string;
  status: "running" | "completed" | "failed";
  plan: string;
  assignments: MissionAssignment[];
  summary: string;
  actions: MissionAction[];
  createdAt: string;
  completedAt: string | null;
}

export interface Approval {
  id: string;
  workspaceId: string;
  missionId: string | null;
  agentId: string;
  title: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "auto-approved";
  createdAt: string;
  decidedAt: string | null;
}

export interface Routine {
  id: string;
  workspaceId: string;
  templateId: string;
  agentId: string;
  name: string;
  cadence: "daily" | "weekly" | "monthly";
  prompt: string;
  enabled: boolean;
  lastRunAt: string | null;
  lastOutput: string | null;
}

export interface ActivityEvent {
  id: string;
  workspaceId: string;
  agentId: string | null;
  kind: "system" | "chat" | "mission" | "approval" | "routine" | "billing";
  message: string;
  at: string;
}

interface Data {
  users: User[];
  workspaces: Workspace[];
  conversations: Conversation[];
  missions: Mission[];
  approvals: Approval[];
  routines: Routine[];
  activity: ActivityEvent[];
}

const EMPTY: Data = {
  users: [],
  workspaces: [],
  conversations: [],
  missions: [],
  approvals: [],
  routines: [],
  activity: [],
};

const DATA_FILE = path.join(process.env.BOTERRA_DATA_DIR ?? path.join(process.cwd(), ".data"), "db.json");

// Route handlers, server actions and pages can be bundled separately, so the
// store lives on globalThis to guarantee one shared copy per server process.
const store = ((globalThis as { __boterraStore?: { cache: Data | null; writeQueue: Promise<void> } }).__boterraStore ??= {
  cache: null,
  writeQueue: Promise.resolve(),
});

async function load(): Promise<Data> {
  if (store.cache) return store.cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    store.cache = { ...EMPTY, ...(JSON.parse(raw) as Partial<Data>) };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    store.cache = structuredClone(EMPTY);
  }
  return store.cache;
}

function persist(data: Data): Promise<void> {
  store.writeQueue = store.writeQueue.then(async () => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2));
    await fs.rename(tmp, DATA_FILE);
  });
  return store.writeQueue;
}

/** Run a mutation against the store and persist it atomically. */
async function mutate<T>(fn: (data: Data) => T): Promise<T> {
  const data = await load();
  const result = fn(data);
  await persist(data);
  return result;
}

export const newId = () => randomUUID();
const now = () => new Date().toISOString();

// ---------- Users ----------

export async function findUserByEmail(email: string) {
  const data = await load();
  return data.users.find((u) => u.email === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const data = await load();
  return data.users.find((u) => u.id === id) ?? null;
}

export async function createUser(input: { email: string; name: string; passwordHash: string }) {
  return mutate((data) => {
    const user: User = {
      id: newId(),
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
      workspaceId: null,
      createdAt: now(),
    };
    data.users.push(user);
    return user;
  });
}

// ---------- Workspaces ----------

export async function getWorkspace(id: string) {
  const data = await load();
  return data.workspaces.find((w) => w.id === id) ?? null;
}

export async function createWorkspace(
  ownerId: string,
  input: Omit<Workspace, "id" | "ownerId" | "createdAt" | "creditsUsed" | "creditsPeriodStart">,
) {
  return mutate((data) => {
    const ws: Workspace = {
      ...input,
      id: newId(),
      ownerId,
      creditsUsed: 0,
      creditsPeriodStart: now(),
      createdAt: now(),
    };
    data.workspaces.push(ws);
    const user = data.users.find((u) => u.id === ownerId);
    if (user) user.workspaceId = ws.id;
    return ws;
  });
}

export async function updateWorkspace(id: string, patch: Partial<Workspace>) {
  return mutate((data) => {
    const ws = data.workspaces.find((w) => w.id === id);
    if (!ws) throw new Error("Workspace not found");
    Object.assign(ws, patch);
    return ws;
  });
}

// ---------- Conversations ----------

export async function getConversation(workspaceId: string, agentId: string) {
  const data = await load();
  return data.conversations.find((c) => c.workspaceId === workspaceId && c.agentId === agentId) ?? null;
}

export async function listConversations(workspaceId: string) {
  const data = await load();
  return data.conversations
    .filter((c) => c.workspaceId === workspaceId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function appendMessages(workspaceId: string, agentId: string, messages: ChatMessage[]) {
  return mutate((data) => {
    let convo = data.conversations.find((c) => c.workspaceId === workspaceId && c.agentId === agentId);
    if (!convo) {
      convo = { id: newId(), workspaceId, agentId, messages: [], updatedAt: now() };
      data.conversations.push(convo);
    }
    convo.messages.push(...messages);
    convo.updatedAt = now();
    return convo;
  });
}

export async function clearConversation(workspaceId: string, agentId: string) {
  return mutate((data) => {
    data.conversations = data.conversations.filter((c) => !(c.workspaceId === workspaceId && c.agentId === agentId));
  });
}

// ---------- Missions ----------

export async function listMissions(workspaceId: string) {
  const data = await load();
  return data.missions
    .filter((m) => m.workspaceId === workspaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMission(workspaceId: string, id: string) {
  const data = await load();
  return data.missions.find((m) => m.id === id && m.workspaceId === workspaceId) ?? null;
}

export async function saveMission(mission: Mission) {
  return mutate((data) => {
    const idx = data.missions.findIndex((m) => m.id === mission.id);
    if (idx === -1) data.missions.push(mission);
    else data.missions[idx] = mission;
    return mission;
  });
}

// ---------- Approvals ----------

export async function listApprovals(workspaceId: string) {
  const data = await load();
  return data.approvals
    .filter((a) => a.workspaceId === workspaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createApprovals(items: Omit<Approval, "id" | "createdAt" | "decidedAt">[]) {
  return mutate((data) => {
    const created = items.map((item) => ({
      ...item,
      id: newId(),
      createdAt: now(),
      decidedAt: item.status === "pending" ? null : now(),
    }));
    data.approvals.push(...created);
    return created;
  });
}

export async function decideApproval(workspaceId: string, id: string, status: "approved" | "rejected") {
  return mutate((data) => {
    const approval = data.approvals.find((a) => a.id === id && a.workspaceId === workspaceId);
    if (!approval || approval.status !== "pending") return null;
    approval.status = status;
    approval.decidedAt = now();
    return approval;
  });
}

// ---------- Routines ----------

export async function listRoutines(workspaceId: string) {
  const data = await load();
  return data.routines.filter((r) => r.workspaceId === workspaceId);
}

export async function replaceRoutines(workspaceId: string, routines: Omit<Routine, "id" | "workspaceId">[]) {
  return mutate((data) => {
    data.routines = data.routines.filter((r) => r.workspaceId !== workspaceId);
    const created = routines.map((r) => ({ ...r, id: newId(), workspaceId }));
    data.routines.push(...created);
    return created;
  });
}

export async function updateRoutine(workspaceId: string, id: string, patch: Partial<Routine>) {
  return mutate((data) => {
    const routine = data.routines.find((r) => r.id === id && r.workspaceId === workspaceId);
    if (!routine) return null;
    Object.assign(routine, patch);
    return routine;
  });
}

// ---------- Activity ----------

export async function logActivity(event: Omit<ActivityEvent, "id" | "at">) {
  return mutate((data) => {
    const entry: ActivityEvent = { ...event, id: newId(), at: now() };
    data.activity.push(entry);
    return entry;
  });
}

export async function listActivity(workspaceId: string, limit = 50) {
  const data = await load();
  return data.activity
    .filter((a) => a.workspaceId === workspaceId)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

/** All enabled routines across workspaces (used by the scheduler endpoint). */
export async function listEnabledRoutines() {
  const data = await load();
  return data.routines.filter((r) => r.enabled);
}
