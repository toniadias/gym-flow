/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Equipamento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_nome_key" ON "Equipamento"("nome");
