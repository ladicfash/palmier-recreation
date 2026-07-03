import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, clips, captions, sceneDetections, audioTracks, colorGrades, type Project, type Clip, type Caption, type SceneDetection, type AudioTrack, type ColorGrade } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Project queries
export async function createProject(userId: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values({
    userId,
    name,
    description,
  });

  // Fetch the created project
  const created = await db.select().from(projects).where(
    and(eq(projects.userId, userId), eq(projects.name, name))
  ).orderBy(projects.id).limit(1);

  return created.length > 0 ? created[0] : null;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProjectById(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  ).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateProject(projectId: number, userId: number, updates: Partial<Project>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(projects).set(updates).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  );
}

export async function deleteProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(projects).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  );
}

// Clip queries
export async function createClip(
  projectId: number,
  name: string,
  startTime: number,
  endTime: number,
  type: "video" | "audio" | "text",
  opacity?: number,
  speed?: number,
  textContent?: string,
  textColor?: string,
  textSize?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clips).values({
    projectId,
    name,
    startTime,
    endTime,
    type,
    opacity: opacity ?? 1,
    speed: speed ?? 1,
    textContent: textContent ?? null,
    textColor: textColor ?? null,
    textSize: textSize ?? null,
  });

  // Return the inserted clip
  const created = await db.select().from(clips).where(
    and(eq(clips.projectId, projectId), eq(clips.name, name), eq(clips.startTime, startTime))
  ).orderBy(clips.id).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getProjectClips(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(clips).where(eq(clips.projectId, projectId));
}

export async function updateClip(clipId: number, updates: Partial<Clip>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(clips).set(updates).where(eq(clips.id, clipId));
}

export async function deleteClip(clipId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(clips).where(eq(clips.id, clipId));
}

// Caption queries
export async function createCaption(projectId: number, startTime: number, endTime: number, text: string, language: string = "en") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(captions).values({
    projectId,
    startTime,
    endTime,
    text,
    language,
  });
}

export async function getProjectCaptions(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(captions).where(eq(captions.projectId, projectId));
}

// Full project load (project + clips + captions + scenes)
export async function getFullProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const projectRows = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  ).limit(1);

  if (projectRows.length === 0) return null;
  const project = projectRows[0]!;

  const [projectClips, projectCaptions, projectScenes] = await Promise.all([
    db.select().from(clips).where(eq(clips.projectId, projectId)),
    db.select().from(captions).where(eq(captions.projectId, projectId)),
    db.select().from(sceneDetections).where(eq(sceneDetections.projectId, projectId)),
  ]);

  return { project, clips: projectClips, captions: projectCaptions, scenes: projectScenes };
}

// Scene detection queries
export async function createSceneDetection(projectId: number, timestamp: number, confidence: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(sceneDetections).values({
    projectId,
    timestamp,
    confidence,
  });
}

export async function getProjectSceneDetections(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(sceneDetections).where(eq(sceneDetections.projectId, projectId));
}


// Audio track queries
export async function createAudioTrack(projectId: number, name: string, audioUrl: string, audioKey: string, duration: number, volume: number = 100, startTime: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(audioTracks).values({
    projectId,
    name,
    audioUrl,
    audioKey,
    duration,
    volume,
    startTime,
  });
}

export async function getProjectAudioTracks(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(audioTracks).where(eq(audioTracks.projectId, projectId));
}

export async function deleteAudioTrack(trackId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(audioTracks).where(eq(audioTracks.id, trackId));
}

// Color grade queries
export async function createColorGrade(projectId: number, clipId: number | null, colorData: Partial<ColorGrade>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(colorGrades).values({
    projectId,
    clipId,
    ...colorData,
  });
}

export async function getProjectColorGrades(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(colorGrades).where(eq(colorGrades.projectId, projectId));
}

export async function updateAudioTrackVolume(trackId: number, volume: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(audioTracks).set({ volume }).where(eq(audioTracks.id, trackId));
}
