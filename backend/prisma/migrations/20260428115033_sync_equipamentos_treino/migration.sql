-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN "musculoAlvo" TEXT;

-- CreateTable
CREATE TABLE "_TreinoEquipamentos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TreinoEquipamentos_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TreinoEquipamentos_B_fkey" FOREIGN KEY ("B") REFERENCES "Treino" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_TreinoEquipamentos_AB_unique" ON "_TreinoEquipamentos"("A", "B");

-- CreateIndex
CREATE INDEX "_TreinoEquipamentos_B_index" ON "_TreinoEquipamentos"("B");
