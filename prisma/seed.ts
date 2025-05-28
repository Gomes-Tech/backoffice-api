import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const alreadySeeded = await prisma.seedStatus.findUnique({
    where: { id: 'main-seed' },
  });

  if (alreadySeeded) {
    console.log('Banco de dados já foi seedado. Abortando seed.');
    return;
  }

  const passwordHash =
    '$2b$12$Z5V5SVvPwbc6fI1h6U.Uzuz9T5wKxSxbuJfGLc6MNn5kuw3FUO9b2';

  // Primeiro, cria um usuário temporário apenas para preencher o createdBy (evita ciclo)
  const tempUser = await prisma.user.create({
    data: {
      name: 'Temp Creator',
      email: 'temp@example.com',
      password: passwordHash,
      isActive: false,
    },
  });

  // Cria a role "admin" com o createdBy apontando para o usuário temporário
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrator role with full access',
      createdById: tempUser.id,
      isActive: true,
    },
  });

  // Agora cria o usuário real e associa a role correta
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: passwordHash,
      photo: null,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Atualiza a role para que o createdBy seja o próprio adminUser
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      createdById: adminUser.id,
    },
  });

  // Remove o usuário temporário
  await prisma.user.delete({
    where: { id: tempUser.id },
  });

  const categories = [
    {
      name: 'Adesivos Decorativos',
      slug: 'adesivos-decorativos',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Réguas de Crescimento',
      slug: 'reguas-de-crescimento',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Espelho Decorativo',
      slug: 'espelho-decorativo',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Prateleira',
      slug: 'prateleiras',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Gancho Cabideiro',
      slug: 'gancho-cabideiro-infantil',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Papel de Parede',
      slug: 'papel-de-parede',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Galhos em Recorte',
      slug: 'galhos-em-recorte',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
    {
      name: 'Letras 3D',
      slug: 'letras-3d',
      isActive: true,
      seoCanonicalUrl: 'teste',
      seoDescription: 'teste',
      seoKeywords: 'teste, teste2',
      seoMetaRobots: 'noindex, follow',
      seoTitle: 'teste',
    },
  ];

  // Cria todas as categorias
  await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: {
          ...category,
          createdBy: {
            connect: { id: adminUser.id },
          },
        },
      }),
    ),
  );

  await prisma.seedStatus.create({
    data: { id: 'main-seed', executedAt: new Date() },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
