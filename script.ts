import {prisma} from './lib/prisma'

async function main() {
    const user = await prisma.user.create({
        data : {
            name : "Simran",
            email : "simran@yopmail.com"
        }
    })
    console.log("Created user : ", user);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })