import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { transcribeAudio } from "./_core/voiceTranscription";
import { execSync } from "child_process";
import { join } from "path";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  videos: router({
    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string().default("video/mp4"),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `videos/${ctx.user.id}/${input.projectId}/${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await db.updateProject(input.projectId, ctx.user.id, { videoUrl: url, videoKey: key });
        return { url, key };
      }),

    uploadAudio: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string().default("audio/webm"),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `audio/${ctx.user.id}/${input.projectId}/${Date.now()}_${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url, key };
      }),

    uploadAudioTrack: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string().default("audio/mpeg"),
        duration: z.number(),
        volume: z.number().default(100),
        startTime: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `audio-tracks/${ctx.user.id}/${input.projectId}/${Date.now()}_${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        const track = await db.createAudioTrack(
          input.projectId,
          input.fileName,
          url,
          key,
          input.duration,
          input.volume,
          input.startTime
        );
        return { url, key, track };
      }),
  }),

  projects: router({
    create: protectedProcedure
      .input(z.object({ name: z.string(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return db.createProject(ctx.user.id, input.name, input.description);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProjects(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectById(input.projectId, ctx.user.id);
      }),

    getFull: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getFullProject(input.projectId, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().optional(),
        duration: z.number().optional(),
        videoUrl: z.string().optional(),
        videoKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { projectId, ...updates } = input;
        return db.updateProject(projectId, ctx.user.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteProject(input.projectId, ctx.user.id);
      }),
  }),

  captions: router({
    generate: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        audioUrl: z.string(),
        language: z.string().default("en"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Fetch the audio from S3 storage URL (server-accessible)
          const audioResponse = await fetch(input.audioUrl);
          if (!audioResponse.ok) {
            throw new Error(`Failed to fetch audio from storage: ${audioResponse.status}`);
          }
          const audioBuffer = await audioResponse.arrayBuffer();
          const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });

          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: input.language,
          });

          if ('error' in result) throw new Error(result.error);
          if (!result.text) throw new Error("Transcription returned empty text");

          const captions = [];
          if (result.segments && Array.isArray(result.segments)) {
            for (const segment of result.segments) {
              const caption = await db.createCaption(
                input.projectId,
                Math.floor(segment.start * 1000),
                Math.floor(segment.end * 1000),
                segment.text,
                input.language
              );
              captions.push(caption);
            }
          }

          return {
            success: true,
            fullText: result.text,
            captions,
            language: result.language ?? input.language,
          };
        } catch (error) {
          console.error("Caption generation error:", error);
          throw new Error("Failed to generate captions: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectCaptions(input.projectId);
      }),
  }),

  clips: router({
    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        startTime: z.number(),
        endTime: z.number(),
        type: z.string().default("video"),
        opacity: z.number().optional(),
        speed: z.number().optional(),
        textContent: z.string().optional(),
        textColor: z.string().optional(),
        textSize: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createClip(
          input.projectId, input.name, input.startTime, input.endTime,
          input.type as "video" | "audio" | "text",
          input.opacity, input.speed, input.textContent, input.textColor, input.textSize
        );
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectClips(input.projectId);
      }),

    delete: protectedProcedure
      .input(z.object({ clipId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteClip(input.clipId);
      }),
  }),

  audioTracks: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectAudioTracks(input.projectId);
      }),

    delete: protectedProcedure
      .input(z.object({ trackId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteAudioTrack(input.trackId);
      }),

    updateVolume: protectedProcedure
      .input(z.object({ trackId: z.number(), volume: z.number().min(0).max(200) }))
      .mutation(async ({ ctx, input }) => {
        return db.updateAudioTrackVolume(input.trackId, input.volume);
      }),
  }),

  sceneDetection: router({
    detect: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        videoPath: z.string(),
        threshold: z.number().default(27.0),
        method: z.enum(["content", "adaptive", "threshold"]).default("content"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const scriptPath = join(process.cwd(), "server", "scene_detection.py");
          const command = `python3 "${scriptPath}" "${input.videoPath}" ${input.threshold} ${input.method}`;
          const output = execSync(command, { encoding: "utf-8", timeout: 60000 });
          const result = JSON.parse(output);

          if (!result.success) throw new Error(result.error || "Scene detection failed");

          const savedScenes = [];
          for (const scene of result.scenes) {
            const saved = await db.createSceneDetection(
              input.projectId,
              Math.floor(scene.timestamp * 1000),
              scene.confidence
            );
            savedScenes.push(saved);
          }

          return { success: true, scenes: result.scenes, sceneCount: result.scene_count, method: result.method };
        } catch (error) {
          console.error("Scene detection error:", error);
          throw new Error(`Scene detection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectSceneDetections(input.projectId);
      }),
  }),

  colorGrading: router({
    suggest: protectedProcedure
      .input(z.object({
        frameData: z.string(), // base64 JPEG frame
        currentGrade: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a professional colorist. Analyze the video frame and suggest color grading adjustments.
Return JSON with a "grade" object containing numeric adjustments and a "description" string.
Grade fields (all numbers): brightness (-100 to 100), contrast (-100 to 100), saturation (-100 to 100),
hue (-180 to 180), temperature (-100 to 100, negative=cool/blue, positive=warm/orange),
tint (-100 to 100), liftR/liftG/liftB (-50 to 50), gammaR/gammaG/gammaB (-50 to 50),
gainR/gainG/gainB (-50 to 50), vignetteStrength (0 to 100).
Only include fields that need adjustment. Keep changes subtle and professional.`,
              },
              {
                role: "user" as const,
                content: [
                  { type: "image_url" as const, image_url: { url: input.frameData, detail: "low" as const } },
                  { type: "text" as const, text: "Suggest color grading for this frame. Be specific and professional." },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "color_grade_suggestion",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    grade: {
                      type: "object",
                      properties: {
                        brightness: { type: "number" }, contrast: { type: "number" },
                        saturation: { type: "number" }, hue: { type: "number" },
                        temperature: { type: "number" }, tint: { type: "number" },
                        liftR: { type: "number" }, liftG: { type: "number" }, liftB: { type: "number" },
                        gammaR: { type: "number" }, gammaG: { type: "number" }, gammaB: { type: "number" },
                        gainR: { type: "number" }, gainG: { type: "number" }, gainB: { type: "number" },
                        vignetteStrength: { type: "number" },
                      },
                      required: [],
                      additionalProperties: false,
                    },
                    description: { type: "string" },
                  },
                  required: ["grade", "description"],
                  additionalProperties: false,
                },
              },
            },
          });

          const rawContent = response.choices[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : Array.isArray(rawContent) ? rawContent.map(p => (p as {type:string;text?:string}).type === "text" ? (p as {text:string}).text : "").join("") : null;
          if (!content) throw new Error("No response from AI");
          const parsed = JSON.parse(content);
          return { grade: parsed.grade, description: parsed.description };
        } catch (error) {
          console.error("Color grading AI error:", error);
          throw new Error("AI suggestion failed: " + (error instanceof Error ? error.message : "Unknown"));
        }
      }),
  }),

  chatbot: router({
    command: protectedProcedure
      .input(z.object({
        message: z.string(),
        context: z.object({
          hasVideo: z.boolean(),
          duration: z.number(),
          clipCount: z.number(),
          captionCount: z.number(),
          currentTime: z.number(),
          trimStart: z.number(),
          trimEnd: z.number(),
          speed: z.number(),
          opacity: z.number(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are PixelCraft AI, a helpful video editing assistant. Parse user commands and return structured actions.

Current editor state:
- Has video: ${input.context.hasVideo}
- Video duration: ${input.context.duration.toFixed(1)}s
- Clips created: ${input.context.clipCount}
- Captions: ${input.context.captionCount}
- Current time: ${input.context.currentTime.toFixed(1)}s
- Trim: ${input.context.trimStart.toFixed(1)}s - ${input.context.trimEnd.toFixed(1)}s
- Speed: ${input.context.speed}x
- Opacity: ${Math.round(input.context.opacity * 100)}%

Return a JSON with:
- "action": one of: "trim", "speed", "opacity", "detect_scenes", "generate_captions", "create_clip", "export", "seek", "play", "pause", "none"
- "params": object with action-specific parameters
- "message": friendly response message to show the user
- "suggestions": array of 3 follow-up command suggestions

For trim: params = { start: number, end: number }
For speed: params = { speed: number } (0.25 to 4)
For opacity: params = { opacity: number } (0 to 1)
For seek: params = { time: number }
For create_clip: params = { name: string, start: number, end: number }
For export: params = { format: "16:9" | "9:16" | "1:1" }
For none/chat: just return a helpful message`,
              },
              { role: "user", content: input.message },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "editor_command",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    action: { type: "string" },
                    params: { type: "object", properties: {}, additionalProperties: true },
                    message: { type: "string" },
                    suggestions: { type: "array", items: { type: "string" } },
                  },
                  required: ["action", "params", "message", "suggestions"],
                  additionalProperties: false,
                },
              },
            },
          });

          const rawContent2 = response.choices[0]?.message?.content;
          const content = typeof rawContent2 === "string" ? rawContent2 : Array.isArray(rawContent2) ? rawContent2.map(p => (p as {type:string;text?:string}).type === "text" ? (p as {text:string}).text : "").join("") : null;
          if (!content) throw new Error("No response");
          return JSON.parse(content) as {
            action: string;
            params: Record<string, unknown>;
            message: string;
            suggestions: string[];
          };
        } catch (error) {
          console.error("Chatbot error:", error);
          return {
            action: "none",
            params: {},
            message: "I couldn't process that command. Try: 'set speed to 2x', 'trim from 5s to 30s', 'detect scenes', or 'export as 9:16'.",
            suggestions: ["Set speed to 2x", "Detect scenes", "Generate captions"],
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
