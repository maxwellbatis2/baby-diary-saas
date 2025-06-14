#!/bin/bash

echo "🚀 Iniciando Baby Diary Backend..."

# Gerar cliente Prisma
echo "📦 Gerando cliente Prisma..."
npx prisma generate

# Aplicar migrações
echo "🗄️ Aplicando migrações do banco de dados..."
npx prisma migrate deploy

# Executar seed apenas se for necessário
echo "🌱 Verificando se o banco precisa ser populado..."
npx prisma db seed

# Iniciar o servidor
echo "🚀 Iniciando servidor..."
node dist/index.js 