-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreinoEquipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treinoId" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "cargaPlanejada" INTEGER NOT NULL,
    "cargaSugerida" INTEGER,
    "series" INTEGER NOT NULL DEFAULT 3,
    "repeticoes" INTEGER NOT NULL DEFAULT 10,
    "pesoRealizado" INTEGER,
    CONSTRAINT "TreinoEquipamento_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TreinoEquipamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreinoEquipamento" ("cargaPlanejada", "cargaSugerida", "equipamentoId", "id", "treinoId") SELECT "cargaPlanejada", "cargaSugerida", "equipamentoId", "id", "treinoId" FROM "TreinoEquipamento";
DROP TABLE "TreinoEquipamento";
ALTER TABLE "new_TreinoEquipamento" RENAME TO "TreinoEquipamento";
CREATE UNIQUE INDEX "TreinoEquipamento_treinoId_equipamentoId_key" ON "TreinoEquipamento"("treinoId", "equipamentoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
