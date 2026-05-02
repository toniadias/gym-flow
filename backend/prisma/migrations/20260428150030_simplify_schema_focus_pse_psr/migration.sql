/*
  Warnings:

  - You are about to drop the `_TreinoEquipamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `peso` on the `Equipamento` table. All the data in the column will be lost.
  - You are about to drop the column `cargaInterna` on the `Treino` table. All the data in the column will be lost.
  - You are about to drop the column `cargaPlanejada` on the `Treino` table. All the data in the column will be lost.
  - You are about to drop the column `cargaSugerida` on the `Treino` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackIA` on the `Treino` table. All the data in the column will be lost.
  - You are about to drop the column `notaRecuperacao4h` on the `Treino` table. All the data in the column will be lost.
  - You are about to drop the column `sentimentoImediato` on the `Treino` table. All the data in the column will be lost.
  - You are about to drop the column `status4h` on the `Treino` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_TreinoEquipamentos_B_index";

-- DropIndex
DROP INDEX "_TreinoEquipamentos_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TreinoEquipamentos";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TreinoEquipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treinoId" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "cargaPlanejada" INTEGER NOT NULL,
    "cargaSugerida" INTEGER,
    CONSTRAINT "TreinoEquipamento_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TreinoEquipamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CargaUsuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "pesoAtual" INTEGER NOT NULL,
    CONSTRAINT "CargaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CargaUsuario_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "musculoAlvo" TEXT,
    "url" TEXT NOT NULL
);
INSERT INTO "new_Equipamento" ("id", "musculoAlvo", "nome", "url") SELECT "id", "musculoAlvo", "nome", "url" FROM "Equipamento";
DROP TABLE "Equipamento";
ALTER TABLE "new_Equipamento" RENAME TO "Equipamento";
CREATE TABLE "new_Treino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "prescribed_intensity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataInicio" DATETIME,
    "dataFeedback" DATETIME,
    "duracaoMinutos" INTEGER,
    "statusPSE" TEXT,
    "pse" INTEGER,
    "status24h" TEXT,
    "notaRecuperacao24h" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Treino" ("concluido", "createdAt", "dataFeedback", "dataInicio", "duracaoMinutos", "exercise", "id", "notaRecuperacao24h", "prescribed_intensity", "pse", "status", "status24h", "usuarioId") SELECT "concluido", "createdAt", "dataFeedback", "dataInicio", "duracaoMinutos", "exercise", "id", "notaRecuperacao24h", "prescribed_intensity", "pse", "status", "status24h", "usuarioId" FROM "Treino";
DROP TABLE "Treino";
ALTER TABLE "new_Treino" RENAME TO "Treino";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TreinoEquipamento_treinoId_equipamentoId_key" ON "TreinoEquipamento"("treinoId", "equipamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "CargaUsuario_usuarioId_equipamentoId_key" ON "CargaUsuario"("usuarioId", "equipamentoId");
