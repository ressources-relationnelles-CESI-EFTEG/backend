-- CreateTable
CREATE TABLE "conversation" (
    "id_conversation" SERIAL NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id_conversation")
);

-- CreateTable
CREATE TABLE "participant_conversation" (
    "id_conversation" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_conversation_pkey" PRIMARY KEY ("id_conversation","id_utilisateur")
);

-- CreateTable
CREATE TABLE "message" (
    "id_message" SERIAL NOT NULL,
    "id_conversation" INTEGER NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id_message")
);

-- CreateIndex
CREATE INDEX "participant_conversation_id_utilisateur_idx" ON "participant_conversation"("id_utilisateur");

-- CreateIndex
CREATE INDEX "message_id_conversation_idx" ON "message"("id_conversation");

-- CreateIndex
CREATE INDEX "message_id_utilisateur_idx" ON "message"("id_utilisateur");

-- AddForeignKey
ALTER TABLE "participant_conversation" ADD CONSTRAINT "participant_conversation_id_conversation_fkey" FOREIGN KEY ("id_conversation") REFERENCES "conversation"("id_conversation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant_conversation" ADD CONSTRAINT "participant_conversation_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_conversation_fkey" FOREIGN KEY ("id_conversation") REFERENCES "conversation"("id_conversation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;
