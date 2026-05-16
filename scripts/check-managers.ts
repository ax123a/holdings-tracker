import { prisma } from "../lib/db";

(async () => {
  const rows = await prisma.holder.findMany({
    select: { displayCode: true, managerName: true, managerTitle: true },
    orderBy: { displayCode: "asc" },
  });
  for (const r of rows) {
    console.log(
      r.displayCode.padEnd(6),
      (r.managerName ?? "—").padEnd(35),
      r.managerTitle ?? "",
    );
  }
  await prisma.$disconnect();
})();
