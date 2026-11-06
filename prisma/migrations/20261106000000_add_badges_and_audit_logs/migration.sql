-- CreateTable
CREATE TABLE "Badges" (
    "id_badge" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(255),
    "category" VARCHAR(20) NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Badges_pkey" PRIMARY KEY ("id_badge")
);

-- CreateTable
CREATE TABLE "User_Badges" (
    "id_user_badge" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_badge" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Badges_pkey" PRIMARY KEY ("id_user_badge")
);

-- CreateTable
CREATE TABLE "Audit_Logs" (
    "id_log" SERIAL NOT NULL,
    "actor_type" VARCHAR(20) NOT NULL,
    "actor_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(50),
    "entity_id" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_Logs_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badges_code_key" ON "Badges"("code");

-- CreateIndex
CREATE INDEX "User_Badges_id_user_idx" ON "User_Badges"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "User_Badges_id_user_id_badge_key" ON "User_Badges"("id_user", "id_badge");

-- CreateIndex
CREATE INDEX "Audit_Logs_created_at_idx" ON "Audit_Logs"("created_at");

-- CreateIndex
CREATE INDEX "Audit_Logs_actor_type_actor_id_idx" ON "Audit_Logs"("actor_type", "actor_id");

-- CreateIndex
CREATE INDEX "Audit_Logs_action_idx" ON "Audit_Logs"("action");

-- AddForeignKey
ALTER TABLE "User_Badges" ADD CONSTRAINT "User_Badges_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Badges" ADD CONSTRAINT "User_Badges_id_badge_fkey" FOREIGN KEY ("id_badge") REFERENCES "Badges"("id_badge") ON DELETE CASCADE ON UPDATE CASCADE;
