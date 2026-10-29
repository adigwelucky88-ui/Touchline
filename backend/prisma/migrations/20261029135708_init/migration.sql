-- CreateEnum
CREATE TYPE "AgeTier" AS ENUM ('adult', 'teen', 'young_teen', 'child');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('athlete', 'guardian', 'scout', 'moderator', 'admin');

-- CreateEnum
CREATE TYPE "GuardianshipStatus" AS ENUM ('pending', 'verified', 'revoked');

-- CreateEnum
CREATE TYPE "ConsentKind" AS ENUM ('terms', 'privacy', 'guardian', 'content_rights');

-- CreateEnum
CREATE TYPE "SeasonFormat" AS ENUM ('split_year', 'calendar_year');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('enum', 'number', 'text', 'boolean');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('public', 'signed_in', 'private');

-- CreateEnum
CREATE TYPE "OrganizationKind" AS ENUM ('club', 'academy', 'school', 'national_team');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('uploading', 'processing', 'in_review', 'published', 'rejected', 'removed');

-- CreateEnum
CREATE TYPE "ModerationSource" AS ENUM ('rekognition', 'human');

-- CreateEnum
CREATE TYPE "ModerationDecision" AS ENUM ('approve', 'review', 'reject');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'actioned', 'dismissed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "cognito_sub" TEXT,
    "email" TEXT,
    "date_of_birth" DATE NOT NULL,
    "age_tier" "AgeTier" NOT NULL,
    "country" CHAR(2) NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "roles" "UserRole"[] DEFAULT ARRAY['athlete']::"UserRole"[],
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardianships" (
    "id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "minor_id" UUID NOT NULL,
    "status" "GuardianshipStatus" NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guardianships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "ConsentKind" NOT NULL,
    "version" TEXT NOT NULL,
    "granted_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports" (
    "key" TEXT NOT NULL,
    "label_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "season_format" "SeasonFormat" NOT NULL,
    "terminology" JSONB NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "sport_key" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" UUID NOT NULL,
    "sport_key" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_definitions" (
    "id" UUID NOT NULL,
    "sport_key" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label_key" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "rules" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sport_key" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "position_id" UUID,
    "country" CHAR(2) NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "athlete_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_attributes" (
    "profile_id" UUID NOT NULL,
    "definition_id" UUID NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "profile_attributes_pkey" PRIMARY KEY ("profile_id","definition_id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "sport_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "OrganizationKind" NOT NULL DEFAULT 'club',
    "country" CHAR(2) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "season" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "uploader_id" UUID NOT NULL,
    "chapter_id" UUID,
    "title" TEXT NOT NULL,
    "headline" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'uploading',
    "visibility" "Visibility" NOT NULL DEFAULT 'public',
    "duration_seconds" INTEGER,
    "raw_object_key" TEXT,
    "hls_manifest_key" TEXT,
    "thumbnail_key" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_skill_tags" (
    "video_id" UUID NOT NULL,
    "skill_category_id" UUID NOT NULL,

    CONSTRAINT "video_skill_tags_pkey" PRIMARY KEY ("video_id","skill_category_id")
);

-- CreateTable
CREATE TABLE "moderation_results" (
    "id" UUID NOT NULL,
    "video_id" UUID NOT NULL,
    "source" "ModerationSource" NOT NULL,
    "decision" "ModerationDecision" NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "reviewer_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "video_id" UUID,
    "profile_id" UUID,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("blocker_id","blocked_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "user_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("user_id","profile_id")
);

-- CreateTable
CREATE TABLE "saves" (
    "user_id" UUID NOT NULL,
    "video_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saves_pkey" PRIMARY KEY ("user_id","video_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cognito_sub_key" ON "users"("cognito_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "guardianships_guardian_id_minor_id_key" ON "guardianships"("guardian_id", "minor_id");

-- CreateIndex
CREATE INDEX "consents_user_id_kind_idx" ON "consents"("user_id", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "positions_sport_key_key_key" ON "positions"("sport_key", "key");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_sport_key_key_key" ON "skill_categories"("sport_key", "key");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_definitions_sport_key_key_key" ON "attribute_definitions"("sport_key", "key");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_profiles_handle_key" ON "athlete_profiles"("handle");

-- CreateIndex
CREATE INDEX "athlete_profiles_sport_key_country_idx" ON "athlete_profiles"("sport_key", "country");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_profiles_user_id_sport_key_key" ON "athlete_profiles"("user_id", "sport_key");

-- CreateIndex
CREATE INDEX "organizations_sport_key_country_name_idx" ON "organizations"("sport_key", "country", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_profile_id_organization_id_season_key" ON "chapters"("profile_id", "organization_id", "season");

-- CreateIndex
CREATE INDEX "videos_status_published_at_idx" ON "videos"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "videos_profile_id_status_idx" ON "videos"("profile_id", "status");

-- CreateIndex
CREATE INDEX "moderation_results_video_id_idx" ON "moderation_results"("video_id");

-- CreateIndex
CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_target_type_target_id_idx" ON "audit_log"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_minor_id_fkey" FOREIGN KEY ("minor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_sport_key_fkey" FOREIGN KEY ("sport_key") REFERENCES "sports"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_sport_key_fkey" FOREIGN KEY ("sport_key") REFERENCES "sports"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_definitions" ADD CONSTRAINT "attribute_definitions_sport_key_fkey" FOREIGN KEY ("sport_key") REFERENCES "sports"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_sport_key_fkey" FOREIGN KEY ("sport_key") REFERENCES "sports"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_attributes" ADD CONSTRAINT "profile_attributes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "athlete_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_attributes" ADD CONSTRAINT "profile_attributes_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "attribute_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_sport_key_fkey" FOREIGN KEY ("sport_key") REFERENCES "sports"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "athlete_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "athlete_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_skill_tags" ADD CONSTRAINT "video_skill_tags_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_skill_tags" ADD CONSTRAINT "video_skill_tags_skill_category_id_fkey" FOREIGN KEY ("skill_category_id") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_results" ADD CONSTRAINT "moderation_results_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "athlete_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saves" ADD CONSTRAINT "saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saves" ADD CONSTRAINT "saves_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
