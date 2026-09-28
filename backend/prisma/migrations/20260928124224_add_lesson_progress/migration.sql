-- CreateTable
CREATE TABLE "lessons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "course_id" INTEGER NOT NULL,
    CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "progresses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "watched_seconds" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "progresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "progresses_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "progresses_user_id_lesson_id_key" ON "progresses"("user_id", "lesson_id");
