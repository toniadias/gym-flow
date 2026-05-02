-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Treino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "prescribed_intensity" TEXT NOT NULL,
    "cargaPlanejada" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "cargaSugerida" INTEGER,
    "feedbackIA" TEXT,
    "dataInicio" DATETIME,
    "duracaoMinutos" INTEGER,
    "cargaInterna" INTEGER,
    "pse" INTEGER,
    "sentimentoImediato" TEXT,
    "dataFeedback" DATETIME,
    "status4h" TEXT,
    "notaRecuperacao4h" INTEGER,
    "status24h" TEXT,
    "notaRecuperacao24h" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Treino" ("cargaPlanejada", "concluido", "createdAt", "dataFeedback", "exercise", "id", "notaRecuperacao24h", "notaRecuperacao4h", "prescribed_intensity", "pse", "sentimentoImediato", "status24h", "status4h", "usuarioId") SELECT "cargaPlanejada", "concluido", "createdAt", "dataFeedback", "exercise", "id", "notaRecuperacao24h", "notaRecuperacao4h", "prescribed_intensity", "pse", "sentimentoImediato", "status24h", "status4h", "usuarioId" FROM "Treino";
DROP TABLE "Treino";
ALTER TABLE "new_Treino" RENAME TO "Treino";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
