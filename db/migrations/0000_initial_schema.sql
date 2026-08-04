CREATE TABLE "teams" (
	"tid" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"abbr" text NOT NULL,
	"alt_name" text,
	"logo_url" text,
	"country" text
);
--> statement-breakpoint
CREATE TABLE "players" (
	"pid" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"short_name" text,
	"first_name" text,
	"last_name" text,
	"birthdate" text,
	"birthplace" text,
	"country" text,
	"playing_role" text,
	"batting_style" text,
	"bowling_style" text,
	"nationality" text
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"match_number" text,
	"format_str" text,
	"status_str" text,
	"status_note" text,
	"date_start" text,
	"date_end" text,
	"venue" text,
	"team_a_id" integer,
	"team_b_id" integer,
	"toss_winner_id" integer,
	"winner_id" integer,
	"result" text
);
--> statement-breakpoint
CREATE TABLE "innings" (
	"id" integer PRIMARY KEY NOT NULL,
	"match_id" integer NOT NULL,
	"batting_team_id" integer,
	"bowling_team_id" integer,
	"innings_number" integer NOT NULL,
	"name" text,
	"short_name" text,
	"scores" text,
	"scores_full" text
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"innings_id" integer NOT NULL,
	"over_number" integer,
	"ball_number" integer,
	"batsman_id" integer,
	"bowler_id" integer,
	"runs" integer DEFAULT 0,
	"extras" integer DEFAULT 0,
	"wicket_type" text,
	"dismissed_player_id" integer,
	"commentary_text" text
);
--> statement-breakpoint
CREATE TABLE "batting_innings_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"match_id" integer NOT NULL,
	"innings_id" integer NOT NULL,
	"runs" integer DEFAULT 0,
	"balls" integer DEFAULT 0,
	"fours" integer DEFAULT 0,
	"sixes" integer DEFAULT 0,
	"strike_rate" numeric(6, 2),
	"how_out" text
);
--> statement-breakpoint
CREATE TABLE "bowling_innings_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"match_id" integer NOT NULL,
	"innings_id" integer NOT NULL,
	"overs" numeric(4, 1),
	"runs_conceded" integer DEFAULT 0,
	"wickets" integer DEFAULT 0,
	"economy" numeric(5, 2),
	"maidens" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_teams_tid_fk" FOREIGN KEY ("team_a_id") REFERENCES "public"."teams"("tid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_teams_tid_fk" FOREIGN KEY ("team_b_id") REFERENCES "public"."teams"("tid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_toss_winner_id_teams_tid_fk" FOREIGN KEY ("toss_winner_id") REFERENCES "public"."teams"("tid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_teams_tid_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."teams"("tid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innings" ADD CONSTRAINT "innings_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innings" ADD CONSTRAINT "innings_batting_team_id_teams_tid_fk" FOREIGN KEY ("batting_team_id") REFERENCES "public"."teams"("tid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "innings" ADD CONSTRAINT "innings_bowling_team_id_teams_tid_fk" FOREIGN KEY ("bowling_team_id") REFERENCES "public"."teams"("tid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_innings_id_innings_id_fk" FOREIGN KEY ("innings_id") REFERENCES "public"."innings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_batsman_id_players_pid_fk" FOREIGN KEY ("batsman_id") REFERENCES "public"."players"("pid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_bowler_id_players_pid_fk" FOREIGN KEY ("bowler_id") REFERENCES "public"."players"("pid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_dismissed_player_id_players_pid_fk" FOREIGN KEY ("dismissed_player_id") REFERENCES "public"."players"("pid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batting_innings_stats" ADD CONSTRAINT "batting_innings_stats_player_id_players_pid_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("pid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batting_innings_stats" ADD CONSTRAINT "batting_innings_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batting_innings_stats" ADD CONSTRAINT "batting_innings_stats_innings_id_innings_id_fk" FOREIGN KEY ("innings_id") REFERENCES "public"."innings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bowling_innings_stats" ADD CONSTRAINT "bowling_innings_stats_player_id_players_pid_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("pid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bowling_innings_stats" ADD CONSTRAINT "bowling_innings_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bowling_innings_stats" ADD CONSTRAINT "bowling_innings_stats_innings_id_innings_id_fk" FOREIGN KEY ("innings_id") REFERENCES "public"."innings"("id") ON DELETE no action ON UPDATE no action;
