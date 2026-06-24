CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE');

ALTER TABLE "ProjectUserDailyLog"
ADD COLUMN "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT';
