-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "peso" TEXT
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "prescribed_intensity" TEXT NOT NULL,
    "cargaPlanejada" INTEGER NOT NULL,
    "pse" INTEGER,
    "sentimentoImediato" TEXT,
    "status4h" TEXT,
    "notaRecuperacao4h" INTEGER,
    "status24h" TEXT,
    "notaRecuperacao24h" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
