import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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

  const tempUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Temp Creator',
      email: 'temp@example.com',
      password: passwordHash,
      isActive: false,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      id: uuidv4(),
      name: 'admin',
      description: 'Administrator role with full access',
      createdById: tempUser.id,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@example.com',
      password: passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      createdById: adminUser.id,
    },
  });

  await prisma.user.delete({
    where: { id: tempUser.id },
  });

  // CATEGORIAS
  const categories = [
    {
      id: 'dcfdfd81-7b52-49aa-b6cc-a626953754e0',
      name: 'Adesivos Decorativos',
      parentId: null,
    },
    {
      id: 'a332c5da-7066-4405-9379-b91071097e6d',
      name: 'Papel de Parede',
      parentId: null,
    },
    {
      id: '0d360427-1c08-493b-8018-a5f1f7fac0e6',
      name: 'infantil',
      parentId: 'a332c5da-7066-4405-9379-b91071097e6d',
    },
    {
      id: '5f018c52-88ed-4890-845b-ca4a8897dc68',
      name: 'Menina',
      parentId: '0d360427-1c08-493b-8018-a5f1f7fac0e6',
    },
    {
      id: '2b88b8a2-6cae-4a83-b185-b47a8f10fb51',
      name: 'Menino',
      parentId: '0d360427-1c08-493b-8018-a5f1f7fac0e6',
    },
    {
      id: '82021e33-9bc1-4712-986d-acb73ac9f850',
      name: 'Sala',
      parentId: 'a332c5da-7066-4405-9379-b91071097e6d',
    },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        isActive: true,
        showMenu: false,
        createdById: adminUser.id,
        parentId: category.parentId,
      },
    });
  }

  // HEADER MENU
  const headerMenus = [
    {
      id: '244a1869-d1ba-40c2-ad34-3c484598c4bb',
      name: 'Quem Somos',
      link: '/quem-somos',
      order: 1,
    },
    {
      id: '71b1afde-3539-4abe-9ddc-fdcfe1a9b73d',
      name: 'Contato',
      link: '/contato',
      order: 2,
    },
    {
      id: 'c45d17b8-51cc-4c5e-9a4e-efa2bcee7a1f',
      name: 'Blog',
      link: '/blog',
      order: 3,
    },
    {
      id: '3e10a7f1-2e05-4382-889b-4667cc1b5687',
      name: 'Perguntas Frequentes',
      link: '/perguntas-frequentes',
      order: 4,
    },
    {
      id: '2d7412cc-f729-42ef-b880-cd1502bbf805',
      name: 'Troca e Devolução',
      link: '/troca-e-devolucao',
      order: 5,
    },
    {
      id: '869065af-7d6a-4ac0-b8fe-63652ac62f25',
      name: 'Segurança e Privacidade',
      link: '/seguranca-e-privacidade',
      order: 6,
    },
    {
      id: '3a663e30-80fa-49ff-8b1c-eec0be9df272',
      name: 'Inspirações',
      link: '/inspiracoes',
      order: 7,
    },
    {
      id: '04113e22-1cc8-46fa-85a1-bb2a3a100f76',
      name: 'Mente seu Quartinho',
      link: '/monte-seu-quartinho',
      order: 8,
    },
    {
      id: 'd8f65798-ded3-4762-b655-e3b7540ea931',
      name: 'Parcerias',
      link: '/parcerias',
      order: 9,
      isActive: false,
    },
    {
      id: '3411be55-838a-4c0b-99d4-2e413bcd801e',
      name: 'teste de integração',
      link: '/teste',
      order: 10,
    },
  ];

  for (const menu of headerMenus) {
    await prisma.headerMenu.create({
      data: {
        id: menu.id,
        name: menu.name,
        link: menu.link,
        order: menu.order,
        isActive: menu?.isActive ?? true,
        createdById: adminUser.id,
        createdAt: new Date(),
      },
    });
  }

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
