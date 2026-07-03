import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { transcribeAudio } from "./_core/voiceTranscription";
import { execSync } from "child_process";
import { join } from "path";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
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
          const result = await transcribeAudio({
            audioUrl: input.audioUrl,
            language: input.language,
          });

          // Check if result is an error
          if ('error' in result) {
            throw new Error(result.error);
          }

          if (!result.text) {
            throw new Error("Failed to transcribe audio");
          }

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
            language: result.language,
          };
        } catch (error) {
          console.error("Caption generation error:", error);
          throw new Error("Failed to generate captions");
        }
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectCaptions(input.projectId);
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
          // Call Python script for scene detection
          const scriptPath = join(process.cwd(), "server", "scene_detection.py");
          const command = `python3 "${scriptPath}" "${input.videoPath}" ${input.threshold} ${input.method}`;
          
          const output = execSync(command, { encoding: "utf-8" });
          const result = JSON.parse(output);

          if (!result.success) {
            throw new Error(result.error || "Scene detection failed");
          }

          // Save detected scenes to database
          const savedScenes = [];
          for (const scene of result.scenes) {
            const saved = await db.createSceneDetection(
              input.projectId,
              Math.floor(scene.timestamp * 1000),
              scene.confidence
            );
            savedScenes.push(saved);
          }

          return {
            success: true,
            scenes: result.scenes,
            sceneCount: result.scene_count,
            method: result.method,
            threshold: result.threshold,
          };
        } catch (error) {
          console.error("Scene detection error:", error);
          throw new Error(`Failed to detect scenes: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProjectSceneDetections(input.projectId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
