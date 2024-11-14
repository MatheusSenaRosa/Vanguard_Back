import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const customerStatus = [
    {
      id: uuid(),
      description: "Ativo",
    },
    {
      id: uuid(),
      description: "Inativo",
    },
  ];

  const roles = [
    {
      id: uuid(),
      description: "Administrador",
    },
    {
      id: uuid(),
      description: "Supervisor",
    },
    {
      id: uuid(),
      description: "Criador de conteúdo",
    },
  ];

  const occupations = [
    {
      id: uuid(),
      description: "Apenas estudando.",
    },
    {
      id: uuid(),
      description: "Estou trabalhando, mas não na área.",
    },
    {
      id: uuid(),
      description: "Estou trabalhando na área.",
    },
  ];

  const customers = [
    {
      id: uuid(),
      email: "aluno@gmail.com",
      name: "Aluno Teste",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      statusId: customerStatus[0].id,
    },
    {
      id: uuid(),
      email: "ativo-cypress@gmail.com",
      name: "Ativo Cypress",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      statusId: customerStatus[0].id,
    },
    {
      id: uuid(),
      email: "ativo2-cypress@gmail.com",
      name: "Ativo Cypress",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      statusId: customerStatus[0].id,
    },
    {
      id: uuid(),
      email: "inativo-cypress@gmail.com",
      name: "Inativo Cypress",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      statusId: customerStatus[1].id,
    },
    {
      id: uuid(),
      email: "esquecisenha-cypress@gmail.com",
      name: "Esqueci Senha Cypress",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      statusId: customerStatus[0].id,
    },
  ];

  for (let i = 1; i <= 20; i++) {
    customers.push({
      id: uuid(),
      email: `customer-seed${i}@gmail.com`,
      name: `Seed ${i}`,
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      statusId: i % 2 ? customerStatus[0].id : customerStatus[1].id,
    });
  }

  const managers = [
    {
      id: uuid(),
      email: "admin@gmail.com",
      name: "Administrador Teste",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      roleId: roles[0].id,
    },
    {
      id: uuid(),
      email: "supervisor@gmail.com",
      name: "Supervisor Teste",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      roleId: roles[1].id,
    },
    {
      id: uuid(),
      email: "criador@gmail.com",
      name: "Criador Teste",
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      roleId: roles[2].id,
    },
  ];

  for (let i = 1; i <= 20; i++) {
    managers.push({
      id: uuid(),
      email: `supervisor-seed${i}@gmail.com`,
      name: `Seed ${i}`,
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      roleId: roles[1].id,
    });
  }

  for (let i = 1; i <= 20; i++) {
    managers.push({
      id: uuid(),
      email: `criador-seed${i}@gmail.com`,
      name: `Seed ${i}`,
      password: "$2b$10$y6B4LfurIqXgnYfZfvmZHO2nmZ/knydNsjyZqS.HLnW4CM5aLXyLO",
      roleId: roles[2].id,
    });
  }

  await Promise.all([
    prisma.customerStatus.createMany({
      data: customerStatus,
    }),
    prisma.occupations.createMany({
      data: occupations,
    }),
    prisma.roles.createMany({
      data: roles,
    }),
  ]);

  await Promise.all([
    prisma.managers.createMany({
      data: managers,
    }),
    prisma.customers.createMany({
      data: customers,
    }),
  ]);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
