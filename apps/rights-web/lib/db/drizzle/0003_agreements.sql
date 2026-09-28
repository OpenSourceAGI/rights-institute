CREATE TABLE `agreementEvents` (
	`id` text PRIMARY KEY NOT NULL,
	`agreementId` text NOT NULL,
	`type` text NOT NULL,
	`actor` text NOT NULL,
	`detail` text,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`agreementId`) REFERENCES `agreements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `agreements` (
	`id` text PRIMARY KEY NOT NULL,
	`inviteToken` text NOT NULL,
	`seekerToken` text NOT NULL,
	`ownerUserId` text,
	`type` text DEFAULT 'employment' NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`paragraphs` text NOT NULL,
	`seekerName` text NOT NULL,
	`seekerEmail` text NOT NULL,
	`employerName` text,
	`employerEmail` text,
	`employerSignerName` text,
	`employerSignerTitle` text,
	`employerSignature` text,
	`employerSignedAt` integer,
	`seekerSignature` text,
	`seekerSignedAt` integer,
	`contentHash` text,
	`documentHash` text,
	`certificateId` text,
	`openCount` integer DEFAULT 0 NOT NULL,
	`firstOpenedAt` integer,
	`lastOpenedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`ownerUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agreements_inviteToken_unique` ON `agreements` (`inviteToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `agreements_seekerToken_unique` ON `agreements` (`seekerToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `agreements_certificateId_unique` ON `agreements` (`certificateId`);--> statement-breakpoint
CREATE TABLE `prosperLedger` (
	`height` integer PRIMARY KEY NOT NULL,
	`blockHash` text NOT NULL,
	`prevHash` text NOT NULL,
	`kind` text DEFAULT 'agreement' NOT NULL,
	`refId` text NOT NULL,
	`certificateId` text NOT NULL,
	`documentHash` text NOT NULL,
	`timestamp` integer NOT NULL,
	`anchorTxHash` text,
	`anchorChainId` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prosperLedger_blockHash_unique` ON `prosperLedger` (`blockHash`);--> statement-breakpoint
CREATE UNIQUE INDEX `prosperLedger_certificateId_unique` ON `prosperLedger` (`certificateId`);