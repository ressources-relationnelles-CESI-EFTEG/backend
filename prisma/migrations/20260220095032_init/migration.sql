-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('USER', 'INFORMATION', 'MENU_ITEM', 'EMOTION', 'TRACKER_ENTRY');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informations" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "informations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "url" VARCHAR(2048),
    "information_id" INTEGER,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotions" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "level" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "color" VARCHAR(50) NOT NULL,
    "icon_path" VARCHAR(1024) NOT NULL,

    CONSTRAINT "emotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_entries" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emotion_id" INTEGER NOT NULL,
    "note" TEXT,
    "date_entry" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "target_type" "TargetType" NOT NULL,
    "target_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "informations_slug_key" ON "informations"("slug");

-- CreateIndex
CREATE INDEX "informations_sort_order_idx" ON "informations"("sort_order");

-- CreateIndex
CREATE INDEX "menu_items_information_id_idx" ON "menu_items"("information_id");

-- CreateIndex
CREATE INDEX "menu_items_sort_order_idx" ON "menu_items"("sort_order");

-- CreateIndex
CREATE INDEX "emotions_parent_id_idx" ON "emotions"("parent_id");

-- CreateIndex
CREATE INDEX "emotions_level_idx" ON "emotions"("level");

-- CreateIndex
CREATE INDEX "tracker_entries_emotion_id_idx" ON "tracker_entries"("emotion_id");

-- CreateIndex
CREATE INDEX "tracker_entries_date_entry_idx" ON "tracker_entries"("date_entry");

-- CreateIndex
CREATE UNIQUE INDEX "tracker_entries_user_id_date_entry_key" ON "tracker_entries"("user_id", "date_entry");

-- CreateIndex
CREATE INDEX "audit_log_admin_id_idx" ON "audit_log"("admin_id");

-- CreateIndex
CREATE INDEX "audit_log_target_type_target_id_idx" ON "audit_log"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_information_id_fkey" FOREIGN KEY ("information_id") REFERENCES "informations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emotions" ADD CONSTRAINT "emotions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "emotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_entries" ADD CONSTRAINT "tracker_entries_emotion_id_fkey" FOREIGN KEY ("emotion_id") REFERENCES "emotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
