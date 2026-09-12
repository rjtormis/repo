ALTER TABLE "exercise" ADD COLUMN IF NOT EXISTS "isCommon" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "exercise_isCommon_name_idx" ON "exercise" ("isCommon", "name");
CREATE INDEX IF NOT EXISTS "exercise_muscleGroups_idx" ON "exercise" ("muscleGroups");

UPDATE "exercise"
SET "isCommon" = true
WHERE "name" IN (
  'Barbell Bench Press',
  'Barbell Incline Bench Press',
  'Barbell Decline Bench Press',
  'Barbell Close Grip Bench Press',
  'Barbell Conventional Deadlift',
  'Barbell Sumo Deadlift',
  'Barbell Romanian Deadlift',
  'Barbell Stiff Legged Deadlift',
  'Barbell High Bar Back Squat',
  'Barbell Low Bar Back Squat',
  'Barbell Front Rack Squat',
  'Barbell Overhead Squat',
  'Barbell Overhead Press',
  'Barbell Push Press',
  'Barbell Bent Over Row',
  'Barbell Pendlay Row',
  'Barbell Hip Thrust',
  'Barbell Bicep Curl',
  'Barbell Skull Crusher',
  'Barbell Good Morning',
  'Barbell Shrug',
  'Barbell Power Clean',
  'Barbell Thruster',
  'Bar Pull Up',
  'Bar Chin Up',
  'Bar Hanging Leg Raise',
  'Bar Hanging Toes to Bar',
  'Bodyweight Push Up',
  'Bodyweight Dips',
  'Ab Wheel Kneeling Rollout',
  'Cable Face Pull',
  'Cable Wide Grip Lat Pulldown',
  'Cable V Grip Lat Pulldown',
  'Cable Rope Tricep Pushdown',
  'Cable Straight Bar Tricep Pushdown',
  'Cable V Grip Seated Low Row',
  'Cable Pallof Press',
  'Double Dumbbell Bench Press',
  'Double Dumbbell Lateral Raise',
  'Double Dumbbell Hammer Curl',
  'Double Dumbbell Arnold Press',
  'Kettlebell Goblet Squat',
  'Trap Bar Deadlift',
  'Ring Dips'
);

-- Clubbell (and macebell) circles are shoulder patterns, not abs.
UPDATE "exercise"
SET
  "muscleGroups" = 'SHOULDERS',
  "primeMoverMuscle" = 'LATERAL_DELTOID'
WHERE (
    "name" ILIKE '%Clubbell%Circle%'
    OR "name" ILIKE '%Macebell%Circle%'
  )
  AND "name" NOT ILIKE '%Shield Cast%'
  AND "name" NOT ILIKE '%Flag Press%'
  AND "name" NOT ILIKE '%360%'
  AND "muscleGroups" = 'ABDOMINALS';
