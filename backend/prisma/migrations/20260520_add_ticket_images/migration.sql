-- AddField images to Ticket
ALTER TABLE "Ticket" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
