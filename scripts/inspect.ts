import { prisma } from "../lib/db";

(async () => {
  const h = await prisma.holder.findFirst();
  console.log("Holder:", JSON.stringify(h, null, 2));
  const f = await prisma.filing.findMany({ orderBy: { reportPeriod: "desc" } });
  console.log("Filings:", f.length);
  for (const x of f) {
    console.log("  ", x.accessionNumber, x.reportPeriod.toISOString().slice(0, 10), "filed=", x.filedAt.toISOString().slice(0, 10), "type=", x.filingType);
  }
  if (f[0]) {
    const top = await prisma.position.findMany({
      where: { filingId: f[0].id },
      include: { security: true },
      orderBy: { valueUsd: "desc" },
      take: 10,
    });
    console.log("Top 10 positions in latest filing:");
    for (const p of top) {
      console.log(
        " ",
        (p.security.ticker ?? "----").padEnd(6),
        p.security.cusip,
        p.security.issuerName.slice(0, 30).padEnd(30),
        "shares=",
        p.shares,
        "value=$",
        Math.round(p.valueUsd / 1e6) + "M",
      );
    }
  }
  const counts = {
    holders: await prisma.holder.count(),
    filings: await prisma.filing.count(),
    securities: await prisma.security.count(),
    positions: await prisma.position.count(),
    tickered: await prisma.security.count({ where: { NOT: { ticker: null } } }),
  };
  console.log("Counts:", counts);
  await prisma.$disconnect();
})();
