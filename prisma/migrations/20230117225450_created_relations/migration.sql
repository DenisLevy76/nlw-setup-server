-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_days_habits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    CONSTRAINT "days_habits_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "days" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "days_habits_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_days_habits" ("dayId", "habitId", "id") SELECT "dayId", "habitId", "id" FROM "days_habits";
DROP TABLE "days_habits";
ALTER TABLE "new_days_habits" RENAME TO "days_habits";
CREATE UNIQUE INDEX "days_habits_dayId_habitId_key" ON "days_habits"("dayId", "habitId");
CREATE TABLE "new_habit_week_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitId" TEXT NOT NULL,
    "weekDay" TEXT NOT NULL,
    CONSTRAINT "habit_week_days_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_habit_week_days" ("habitId", "id", "weekDay") SELECT "habitId", "id", "weekDay" FROM "habit_week_days";
DROP TABLE "habit_week_days";
ALTER TABLE "new_habit_week_days" RENAME TO "habit_week_days";
CREATE UNIQUE INDEX "habit_week_days_habitId_weekDay_key" ON "habit_week_days"("habitId", "weekDay");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
