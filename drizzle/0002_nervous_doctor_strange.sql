CREATE TABLE `audioTracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`audioUrl` varchar(512) NOT NULL,
	`audioKey` varchar(512) NOT NULL,
	`duration` int NOT NULL,
	`volume` int DEFAULT 100,
	`startTime` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audioTracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `colorGrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`clipId` int,
	`brightness` int DEFAULT 0,
	`contrast` int DEFAULT 0,
	`saturation` int DEFAULT 0,
	`hue` int DEFAULT 0,
	`temperature` int DEFAULT 0,
	`tint` int DEFAULT 0,
	`lutUrl` varchar(512),
	`preset` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `colorGrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audioTracks` ADD CONSTRAINT `audioTracks_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `colorGrades` ADD CONSTRAINT `colorGrades_projectId_projects_id_fk` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `colorGrades` ADD CONSTRAINT `colorGrades_clipId_clips_id_fk` FOREIGN KEY (`clipId`) REFERENCES `clips`(`id`) ON DELETE cascade ON UPDATE no action;