import { pgTable, serial, timestamp, text, varchar, index, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 博客文章表
export const blogPosts = pgTable(
	"blog_posts",
	{
		id: serial().primaryKey(),
		title: varchar("title", { length: 200 }).notNull(),
		summary: varchar("summary", { length: 500 }).notNull(),
		content: text("content").notNull(),
		icon: varchar("icon", { length: 10 }).notNull().default("📝"),
		read_time: varchar("read_time", { length: 20 }).notNull().default("3分钟"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("blog_posts_created_at_idx").on(table.created_at),
	]
);

// 用户表
export const users = pgTable(
	"users",
	{
		id: serial().primaryKey(),
		username: varchar("username", { length: 50 }).notNull().unique(),
		password: varchar("password", { length: 255 }).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("users_username_idx").on(table.username),
	]
);

// 游戏记录表
export const gameRecords = pgTable(
	"game_records",
	{
		id: serial().primaryKey(),
		user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		scenario: varchar("scenario", { length: 100 }).notNull(),
		final_score: integer("final_score").notNull().default(0),
		result: varchar("result", { length: 20 }).notNull(),
		rounds: integer("rounds").notNull().default(0),
		played_at: timestamp("played_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("game_records_user_id_idx").on(table.user_id),
		index("game_records_played_at_idx").on(table.played_at),
	]
);
