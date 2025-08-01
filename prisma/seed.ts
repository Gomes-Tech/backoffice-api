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
        createdBy: {
          connect: { id: adminUser.id },
        },
        createdAt: new Date(),
      },
    });
  }

  const attribute = await prisma.attribute.create({
    data: {
      id: uuidv4(),
      name: 'Cor',
      createdBy: {
        connect: { id: adminUser.id },
      },
    },
  });

  const colors = [
    { name: 'Rosa Blush', value: '#D9BEB9' },
    { name: 'Rosa Claro', value: '#DDA5B0' },
    { name: 'Rosa Pink', value: '#CF5D8E' },
    { name: 'Violeta', value: '#816E9B' },
    { name: 'Lavanda', value: '#BFA8BC' },
    { name: 'Verde Água', value: '#7EAFA4' },
    { name: 'Verde Sereno', value: '#4CAA8D' },
    { name: 'Azul Claro', value: '#72A0AF' },
    { name: 'Verde Bandeira', value: '#478A2D' },
    { name: 'Verde Escuro', value: '#34442A' },
    { name: 'Azul Escuro', value: '#282963' },
    { name: 'Laranja', value: '#C1442E' },
    { name: 'Salmão', value: '#DC8F57' },
    { name: 'Amarelo Pastel', value: '#E7DAA5' },
    { name: 'Avelã', value: '#B29880' },
    { name: 'Capuccino', value: '#967353' },
    { name: 'Canela', value: '#9A705D' },
    { name: 'Rose Gold', value: '#DEAFA5' },
    { name: 'Cobre', value: '#EBAD84' },
    { name: 'Dourado', value: '#F3C87C' },
    { name: 'Preto', value: '#383531' },
    { name: 'Grafite', value: '#5A5752' },
    { name: 'Cinza Claro', value: '#969289' },
  ];

  for (const color of colors) {
    await prisma.attributeValue.create({
      data: {
        id: uuidv4(),
        name: color.name,
        value: color.value,
        attribute: {
          connect: { id: attribute.id },
        },
        createdBy: {
          connect: { id: adminUser.id },
        },
      },
    });
  }

  const footerMenus = [
    {
      id: 'f10a13e3-154c-4a79-a1c0-35012593293c',
      name: 'Institucional',
      isActive: true,
      items: [
        {
          id: '2742888b-8ce7-4518-9b30-8d25565b7800',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Quem Somos',
        },
        {
          id: '98f733cb-dba8-44cf-a70c-a798f4854eec',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Mapa do Site',
        },
        {
          id: 'f493ccf0-b416-49cb-95ad-f521f765c650',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Seja Parceiro',
        },
        {
          id: 'c2a895d0-b33f-4f4b-b8ab-240212612ea7',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Troca e Devolução',
        },
        {
          id: 'c28bfa97-40b6-4811-9b0a-61399dbab475',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Segurança e Privacidade',
        },
        {
          id: 'caee3ef7-5535-4850-83fe-9d8dd9c8405b',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Pagamentos',
        },
        {
          id: '30ad76fa-1bf5-45bb-9a91-c31624d3340b',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Prazos e Entrega',
        },
        {
          id: '44aadea9-6229-4d71-ad20-631ca34527c5',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Blog',
        },
        {
          id: 'd831df41-d6a7-4547-8d71-4e8ebe2b0b94',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Inspirações',
        },
        {
          id: 'ed35ba60-2919-45fd-b670-6de51be29cc9',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Monte seu Quartinho',
        },
      ],
    },
    {
      id: 'd092c2c5-ff33-4d19-a8fe-7e849f7c4828',
      name: 'Formas de Pagamento',
      isActive: true,
      items: [
        {
          id: 'dab501f5-d07a-4e2d-9b62-23a0373df922',
          imageAlt: 'image 18.svg',
          imageKey: null,
          imageUrl:
            'https://rkauidnzwwateglzfgnz.supabase.co/storage/v1/object/public/backoffice/footer-menus/1753958175082-image%2018.svg',
          imageHeight: '27',
          imageWidth: '43',
          type: 'IMAGE',
          url: null,
          content: null,
        },
        {
          id: '860e512e-bb67-47a7-b5b5-ffd6c1a3fe1a',
          imageAlt: 'pix.svg',
          imageKey: 'footer-menus/1754037795355-image 20.svg',
          imageUrl:
            'https://rkauidnzwwateglzfgnz.supabase.co/storage/v1/object/public/backoffice/footer-menus/1754037795355-image%2020.svg',
          imageHeight: '27',
          imageWidth: '43',
          type: 'IMAGE',
          url: null,
          content: null,
        },
      ],
    },
    {
      id: 'e7183f57-84a6-481f-859d-d0326a03868a',
      name: 'Certificados de Segurança',
      isActive: true,
      items: [
        {
          id: 'f153501d-d8e5-4ca3-ac83-100082fcd3ef',
          imageAlt: 'image 16.svg',
          imageKey: 'footer-menus/1754037904750-image 16.svg',
          imageUrl:
            'https://rkauidnzwwateglzfgnz.supabase.co/storage/v1/object/public/backoffice/footer-menus/1754037904750-image%2016.svg',
          imageHeight: '88',
          imageWidth: '107',
          type: 'IMAGE',
          url: null,
          content: null,
        },
        {
          id: 'a07183e9-73f3-422c-b8de-460d07f91311',
          imageAlt: 'image 17.svg',
          imageKey: 'footer-menus/1754037904751-image 17.svg',
          imageUrl:
            'https://rkauidnzwwateglzfgnz.supabase.co/storage/v1/object/public/backoffice/footer-menus/1754037904751-image%2017.svg',
          imageHeight: '88',
          imageWidth: '110',
          type: 'IMAGE',
          url: null,
          content: null,
        },
      ],
    },
    {
      id: 'd270b622-d415-45de-a0f5-76d9063ae64e',
      name: 'Decoração para Quartinho de Bebê',
      isActive: true,
      items: [
        {
          id: 'f9703b0e-e87d-4d5a-b8a9-688d728c4e50',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Papel de Parede Infantil',
        },
        {
          id: '42b349ee-260d-4b43-8c5a-8b9d02621f1c',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Adesivo de Parede Infantil',
        },
        {
          id: '7f87633f-1ecb-45a1-ad25-3764d3f3e679',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Nome em 3D',
        },
        {
          id: '86698107-70a6-42d5-97aa-d3639635cb20',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Prateleira Infantil',
        },
        {
          id: '4a02e8aa-31b5-43ee-bd15-aaa4a5b22f7e',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Tapete Infantil',
        },
        {
          id: '36bde464-f3e7-4f38-8919-01ffbc543006',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Espelho Decorativo',
        },
        {
          id: 'ea57070b-8d4d-4c64-8332-5e0359848d0c',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Cabideiro de Parede',
        },
      ],
    },
    {
      id: '7da50521-5667-48d1-bcf0-f80ab9d9b631',
      name: 'Contato',
      isActive: true,
      items: [
        {
          id: '538782b0-bc3c-4cd8-934c-d89285761cca',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Fale Conosco',
        },
        {
          id: '01f2b8e9-c99f-42ba-8a34-0bdd57b96297',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'WhatsApp',
        },
        {
          id: 'd3485394-ac4a-403a-8486-0a61fcdb4b94',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'LINK',
          url: 'https://www.instagram.com/decoreasy_/',
          content: 'Perguntas Frequentes',
        },
      ],
    },
    {
      id: '43086172-2911-404d-abba-247e4b83ed96',
      name: 'Horário de Atendimento',
      isActive: true,
      items: [
        {
          id: '112771be-27cc-421a-accd-0000aa6e782e',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'TEXT',
          url: null,
          content: 'Segunda à Sexta: 08:00 às 18:00',
        },
        {
          id: '6826c052-94d6-4ca6-8824-7e83b600bb5f',
          imageAlt: null,
          imageKey: null,
          imageUrl: null,
          imageHeight: null,
          imageWidth: null,
          type: 'TEXT',
          url: null,
          content: 'Sábado: 09:00 às 13:00',
        },
      ],
    },
  ];

  for (const menu of footerMenus) {
    await prisma.footerMenu.create({
      data: {
        id: menu.id,
        name: menu.name,
        isActive: menu.isActive,
        createdBy: {
          connect: { id: adminUser.id },
        },
        items: {
          create: menu.items.map((item) => ({
            id: item.id,
            type: item.type,
            url: item.url,
            content: item.content,
            imageAlt: item.imageAlt,
            imageKey: item.imageKey,
            imageUrl: item.imageUrl,
            imageHeight: item.imageHeight,
            imageWidth: item.imageWidth,
          })),
        },
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
