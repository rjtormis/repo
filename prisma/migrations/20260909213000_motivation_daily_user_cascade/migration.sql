-- Account deletion must take daily motivation rows with the user.
ALTER TABLE "motivation_message_daily" DROP CONSTRAINT IF EXISTS "motivation_message_daily_userId_fkey";
ALTER TABLE "motivation_message_daily" ADD CONSTRAINT "motivation_message_daily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
