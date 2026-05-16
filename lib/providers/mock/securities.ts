// LOCAL 13F DATASET — security universe.
// Tickers, issuer names, and CUSIPs are real public identifiers.
// refPrice is a synthetic anchor used by the generator to convert shares ↔ USD.

export type SecDef = {
  id: string;
  ticker: string;
  cusip: string;
  issuerName: string;
  exchange: string;
  country: string;
  themes: string[];
  refPrice: number;
};

export const SEC_DEFS: SecDef[] = [
  // AI / Semiconductors
  { id: "s-nvda",  ticker: "NVDA",  cusip: "67066G104", issuerName: "NVIDIA Corp.",                  exchange: "NASDAQ", country: "US", themes: ["ai","semi"], refPrice: 720 },
  { id: "s-amd",   ticker: "AMD",   cusip: "007903107", issuerName: "Advanced Micro Devices Inc.",   exchange: "NASDAQ", country: "US", themes: ["ai","semi"], refPrice: 165 },
  { id: "s-tsm",   ticker: "TSM",   cusip: "874039100", issuerName: "Taiwan Semiconductor Mfg.",     exchange: "NYSE",   country: "TW", themes: ["ai","semi"], refPrice: 180 },
  { id: "s-asml",  ticker: "ASML",  cusip: "N07059210", issuerName: "ASML Holding NV",               exchange: "NASDAQ", country: "NL", themes: ["ai","semi"], refPrice: 820 },
  { id: "s-arm",   ticker: "ARM",   cusip: "G0427H103", issuerName: "Arm Holdings PLC",              exchange: "NASDAQ", country: "GB", themes: ["ai","semi"], refPrice: 130 },
  { id: "s-avgo",  ticker: "AVGO",  cusip: "11135F101", issuerName: "Broadcom Inc.",                 exchange: "NASDAQ", country: "US", themes: ["ai","semi"], refPrice: 1500 },
  { id: "s-intc",  ticker: "INTC",  cusip: "458140100", issuerName: "Intel Corp.",                   exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 32 },
  { id: "s-mu",    ticker: "MU",    cusip: "595112103", issuerName: "Micron Technology Inc.",        exchange: "NASDAQ", country: "US", themes: ["ai","semi"], refPrice: 120 },
  { id: "s-qcom",  ticker: "QCOM",  cusip: "747525103", issuerName: "Qualcomm Inc.",                 exchange: "NASDAQ", country: "US", themes: ["semi","comms"], refPrice: 165 },
  { id: "s-mrvl",  ticker: "MRVL",  cusip: "574012100", issuerName: "Marvell Technology Inc.",       exchange: "NASDAQ", country: "US", themes: ["ai","semi"], refPrice: 85 },
  { id: "s-lrcx",  ticker: "LRCX",  cusip: "512807108", issuerName: "Lam Research Corp.",            exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 1000 },
  { id: "s-klac",  ticker: "KLAC",  cusip: "482480100", issuerName: "KLA Corp.",                     exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 750 },
  { id: "s-amat",  ticker: "AMAT",  cusip: "038222105", issuerName: "Applied Materials Inc.",        exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 200 },
  { id: "s-on",    ticker: "ON",    cusip: "682189105", issuerName: "ON Semiconductor Corp.",        exchange: "NASDAQ", country: "US", themes: ["semi","auto"], refPrice: 70 },
  { id: "s-adi",   ticker: "ADI",   cusip: "032654105", issuerName: "Analog Devices Inc.",           exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 220 },
  { id: "s-txn",   ticker: "TXN",   cusip: "882508104", issuerName: "Texas Instruments Inc.",        exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 175 },
  { id: "s-mpwr",  ticker: "MPWR",  cusip: "609839105", issuerName: "Monolithic Power Systems Inc.", exchange: "NASDAQ", country: "US", themes: ["semi"], refPrice: 700 },

  // Cloud / SaaS / Software
  { id: "s-msft",  ticker: "MSFT",  cusip: "594918104", issuerName: "Microsoft Corp.",               exchange: "NASDAQ", country: "US", themes: ["ai","cloud"], refPrice: 420 },
  { id: "s-googl", ticker: "GOOGL", cusip: "02079K305", issuerName: "Alphabet Inc. Class A",         exchange: "NASDAQ", country: "US", themes: ["ai","cloud","comms"], refPrice: 175 },
  { id: "s-amzn",  ticker: "AMZN",  cusip: "023135106", issuerName: "Amazon.com Inc.",               exchange: "NASDAQ", country: "US", themes: ["ai","cloud","consumer"], refPrice: 200 },
  { id: "s-meta",  ticker: "META",  cusip: "30303M102", issuerName: "Meta Platforms Inc.",           exchange: "NASDAQ", country: "US", themes: ["ai","comms"], refPrice: 540 },
  { id: "s-orcl",  ticker: "ORCL",  cusip: "68389X105", issuerName: "Oracle Corp.",                  exchange: "NYSE",   country: "US", themes: ["ai","cloud"], refPrice: 180 },
  { id: "s-crm",   ticker: "CRM",   cusip: "79466L302", issuerName: "Salesforce Inc.",               exchange: "NYSE",   country: "US", themes: ["ai","cloud"], refPrice: 280 },
  { id: "s-snow",  ticker: "SNOW",  cusip: "833445109", issuerName: "Snowflake Inc.",                exchange: "NYSE",   country: "US", themes: ["ai","cloud"], refPrice: 175 },
  { id: "s-mdb",   ticker: "MDB",   cusip: "60937P106", issuerName: "MongoDB Inc.",                  exchange: "NASDAQ", country: "US", themes: ["ai","cloud"], refPrice: 280 },
  { id: "s-now",   ticker: "NOW",   cusip: "81762P102", issuerName: "ServiceNow Inc.",               exchange: "NYSE",   country: "US", themes: ["ai","cloud"], refPrice: 800 },
  { id: "s-anet",  ticker: "ANET",  cusip: "040413106", issuerName: "Arista Networks Inc.",          exchange: "NYSE",   country: "US", themes: ["ai","cloud"], refPrice: 340 },
  { id: "s-ddog",  ticker: "DDOG",  cusip: "23804L103", issuerName: "Datadog Inc.",                  exchange: "NASDAQ", country: "US", themes: ["ai","cloud"], refPrice: 125 },
  { id: "s-net",   ticker: "NET",   cusip: "18915M107", issuerName: "Cloudflare Inc.",               exchange: "NYSE",   country: "US", themes: ["cloud"], refPrice: 110 },
  { id: "s-crwd",  ticker: "CRWD",  cusip: "22788C105", issuerName: "CrowdStrike Holdings Inc.",     exchange: "NASDAQ", country: "US", themes: ["ai","cloud"], refPrice: 360 },
  { id: "s-zs",    ticker: "ZS",    cusip: "98980G102", issuerName: "Zscaler Inc.",                  exchange: "NASDAQ", country: "US", themes: ["cloud"], refPrice: 200 },
  { id: "s-okta",  ticker: "OKTA",  cusip: "679295105", issuerName: "Okta Inc.",                     exchange: "NASDAQ", country: "US", themes: ["cloud"], refPrice: 90 },
  { id: "s-panw",  ticker: "PANW",  cusip: "697435105", issuerName: "Palo Alto Networks Inc.",       exchange: "NASDAQ", country: "US", themes: ["cloud"], refPrice: 360 },
  { id: "s-ftnt",  ticker: "FTNT",  cusip: "34959E109", issuerName: "Fortinet Inc.",                 exchange: "NASDAQ", country: "US", themes: ["cloud"], refPrice: 75 },
  { id: "s-intu",  ticker: "INTU",  cusip: "461202103", issuerName: "Intuit Inc.",                   exchange: "NASDAQ", country: "US", themes: ["cloud"], refPrice: 660 },
  { id: "s-wday",  ticker: "WDAY",  cusip: "98138H101", issuerName: "Workday Inc.",                  exchange: "NASDAQ", country: "US", themes: ["cloud"], refPrice: 250 },
  { id: "s-adbe",  ticker: "ADBE",  cusip: "00724F101", issuerName: "Adobe Inc.",                    exchange: "NASDAQ", country: "US", themes: ["ai","cloud"], refPrice: 510 },

  // AI-native / pure play
  { id: "s-pltr",  ticker: "PLTR",  cusip: "69608A108", issuerName: "Palantir Technologies Inc.",    exchange: "NASDAQ", country: "US", themes: ["ai","defense"], refPrice: 28 },
  { id: "s-smci",  ticker: "SMCI",  cusip: "86800U104", issuerName: "Super Micro Computer Inc.",     exchange: "NASDAQ", country: "US", themes: ["ai","semi"], refPrice: 480 },
  { id: "s-ai",    ticker: "AI",    cusip: "12468P104", issuerName: "C3.ai Inc.",                    exchange: "NYSE",   country: "US", themes: ["ai"], refPrice: 28 },
  { id: "s-soun",  ticker: "SOUN",  cusip: "83605A106", issuerName: "SoundHound AI Inc.",            exchange: "NASDAQ", country: "US", themes: ["ai"], refPrice: 8 },
  { id: "s-bbai",  ticker: "BBAI",  cusip: "05581M108", issuerName: "BigBear.ai Holdings Inc.",      exchange: "NYSE",   country: "US", themes: ["ai","defense"], refPrice: 4 },
  { id: "s-ionq",  ticker: "IONQ",  cusip: "46222L108", issuerName: "IonQ Inc.",                     exchange: "NYSE",   country: "US", themes: ["ai"], refPrice: 12 },
  { id: "s-path",  ticker: "PATH",  cusip: "90364P105", issuerName: "UiPath Inc.",                   exchange: "NYSE",   country: "US", themes: ["ai"], refPrice: 13 },

  // Space / Satellite
  { id: "s-rklb",  ticker: "RKLB",  cusip: "G7733P102", issuerName: "Rocket Lab USA Inc.",           exchange: "NASDAQ", country: "US", themes: ["space"], refPrice: 7 },
  { id: "s-asts",  ticker: "ASTS",  cusip: "00217D100", issuerName: "AST SpaceMobile Inc.",          exchange: "NASDAQ", country: "US", themes: ["space","comms"], refPrice: 25 },
  { id: "s-irdm",  ticker: "IRDM",  cusip: "46269C102", issuerName: "Iridium Communications Inc.",   exchange: "NASDAQ", country: "US", themes: ["space","comms"], refPrice: 28 },
  { id: "s-spir",  ticker: "SPIR",  cusip: "84857L103", issuerName: "Spire Global Inc.",             exchange: "NYSE",   country: "US", themes: ["space"], refPrice: 12 },
  { id: "s-pl",    ticker: "PL",    cusip: "72703H101", issuerName: "Planet Labs PBC",               exchange: "NYSE",   country: "US", themes: ["space"], refPrice: 3 },

  // Defense primes
  { id: "s-lmt",   ticker: "LMT",   cusip: "539830109", issuerName: "Lockheed Martin Corp.",         exchange: "NYSE",   country: "US", themes: ["defense","space"], refPrice: 470 },
  { id: "s-noc",   ticker: "NOC",   cusip: "666807102", issuerName: "Northrop Grumman Corp.",        exchange: "NYSE",   country: "US", themes: ["defense","space"], refPrice: 510 },
  { id: "s-rtx",   ticker: "RTX",   cusip: "75513E101", issuerName: "RTX Corp.",                     exchange: "NYSE",   country: "US", themes: ["defense","space"], refPrice: 115 },
  { id: "s-lhx",   ticker: "LHX",   cusip: "502431109", issuerName: "L3Harris Technologies Inc.",    exchange: "NYSE",   country: "US", themes: ["defense","space"], refPrice: 230 },
  { id: "s-ba",    ticker: "BA",    cusip: "097023105", issuerName: "Boeing Co.",                    exchange: "NYSE",   country: "US", themes: ["defense","industrial","space"], refPrice: 180 },
  { id: "s-gd",    ticker: "GD",    cusip: "369550108", issuerName: "General Dynamics Corp.",        exchange: "NYSE",   country: "US", themes: ["defense"], refPrice: 280 },
  { id: "s-hii",   ticker: "HII",   cusip: "446413106", issuerName: "Huntington Ingalls Industries", exchange: "NYSE",   country: "US", themes: ["defense"], refPrice: 240 },
  { id: "s-ktos",  ticker: "KTOS",  cusip: "50077B207", issuerName: "Kratos Defense & Security",     exchange: "NASDAQ", country: "US", themes: ["defense"], refPrice: 22 },
  { id: "s-avav",  ticker: "AVAV",  cusip: "008073108", issuerName: "AeroVironment Inc.",            exchange: "NASDAQ", country: "US", themes: ["defense"], refPrice: 175 },
  { id: "s-txt",   ticker: "TXT",   cusip: "883203101", issuerName: "Textron Inc.",                  exchange: "NYSE",   country: "US", themes: ["defense","industrial"], refPrice: 85 },

  // Mega-cap consumer tech / media
  { id: "s-aapl",  ticker: "AAPL",  cusip: "037833100", issuerName: "Apple Inc.",                    exchange: "NASDAQ", country: "US", themes: ["consumer","ai"], refPrice: 200 },
  { id: "s-tsla",  ticker: "TSLA",  cusip: "88160R101", issuerName: "Tesla Inc.",                    exchange: "NASDAQ", country: "US", themes: ["auto","ai"], refPrice: 240 },
  { id: "s-nflx",  ticker: "NFLX",  cusip: "64110L106", issuerName: "Netflix Inc.",                  exchange: "NASDAQ", country: "US", themes: ["comms"], refPrice: 650 },
  { id: "s-dis",   ticker: "DIS",   cusip: "254687106", issuerName: "Walt Disney Co.",               exchange: "NYSE",   country: "US", themes: ["comms","consumer"], refPrice: 100 },
  { id: "s-tmus",  ticker: "TMUS",  cusip: "872590104", issuerName: "T-Mobile US Inc.",              exchange: "NASDAQ", country: "US", themes: ["comms"], refPrice: 200 },
  { id: "s-t",     ticker: "T",     cusip: "00206R102", issuerName: "AT&T Inc.",                     exchange: "NYSE",   country: "US", themes: ["comms"], refPrice: 20 },
  { id: "s-vz",    ticker: "VZ",    cusip: "92343V104", issuerName: "Verizon Communications Inc.",   exchange: "NYSE",   country: "US", themes: ["comms"], refPrice: 42 },
  { id: "s-cmcsa", ticker: "CMCSA", cusip: "20030N101", issuerName: "Comcast Corp.",                 exchange: "NASDAQ", country: "US", themes: ["comms"], refPrice: 40 },
  { id: "s-uber",  ticker: "UBER",  cusip: "90353T100", issuerName: "Uber Technologies Inc.",        exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 70 },

  // Financials
  { id: "s-brk",   ticker: "BRK.B", cusip: "084670702", issuerName: "Berkshire Hathaway Inc.",       exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 440 },
  { id: "s-jpm",   ticker: "JPM",   cusip: "46625H100", issuerName: "JPMorgan Chase & Co.",          exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 215 },
  { id: "s-bac",   ticker: "BAC",   cusip: "060505104", issuerName: "Bank of America Corp.",         exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 42 },
  { id: "s-wfc",   ticker: "WFC",   cusip: "949746101", issuerName: "Wells Fargo & Co.",             exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 60 },
  { id: "s-c",     ticker: "C",     cusip: "172967424", issuerName: "Citigroup Inc.",                exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 65 },
  { id: "s-gs",    ticker: "GS",    cusip: "38141G104", issuerName: "Goldman Sachs Group Inc.",      exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 500 },
  { id: "s-ms",    ticker: "MS",    cusip: "617446448", issuerName: "Morgan Stanley",                exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 110 },
  { id: "s-v",     ticker: "V",     cusip: "92826C839", issuerName: "Visa Inc.",                     exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 290 },
  { id: "s-ma",    ticker: "MA",    cusip: "57636Q104", issuerName: "Mastercard Inc.",               exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 480 },
  { id: "s-axp",   ticker: "AXP",   cusip: "025816109", issuerName: "American Express Co.",          exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 260 },
  { id: "s-bx",    ticker: "BX",    cusip: "09260D107", issuerName: "Blackstone Inc.",               exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 165 },
  { id: "s-kkr",   ticker: "KKR",   cusip: "48251W104", issuerName: "KKR & Co. Inc.",                exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 110 },
  { id: "s-blk",   ticker: "BLK",   cusip: "09247X101", issuerName: "BlackRock Inc.",                exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 900 },
  { id: "s-schw",  ticker: "SCHW",  cusip: "808513105", issuerName: "Charles Schwab Corp.",          exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 75 },
  { id: "s-mco",   ticker: "MCO",   cusip: "615369105", issuerName: "Moody's Corp.",                 exchange: "NYSE",   country: "US", themes: ["finance"], refPrice: 480 },

  // Consumer
  { id: "s-ko",    ticker: "KO",    cusip: "191216100", issuerName: "Coca-Cola Co.",                 exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 65 },
  { id: "s-pep",   ticker: "PEP",   cusip: "713448108", issuerName: "PepsiCo Inc.",                  exchange: "NASDAQ", country: "US", themes: ["consumer"], refPrice: 170 },
  { id: "s-cost",  ticker: "COST",  cusip: "22160K105", issuerName: "Costco Wholesale Corp.",        exchange: "NASDAQ", country: "US", themes: ["consumer"], refPrice: 880 },
  { id: "s-wmt",   ticker: "WMT",   cusip: "931142103", issuerName: "Walmart Inc.",                  exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 80 },
  { id: "s-pg",    ticker: "PG",    cusip: "742718109", issuerName: "Procter & Gamble Co.",          exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 165 },
  { id: "s-nke",   ticker: "NKE",   cusip: "654106103", issuerName: "Nike Inc.",                     exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 75 },
  { id: "s-mcd",   ticker: "MCD",   cusip: "580135101", issuerName: "McDonald's Corp.",              exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 290 },
  { id: "s-sbux",  ticker: "SBUX",  cusip: "855244109", issuerName: "Starbucks Corp.",               exchange: "NASDAQ", country: "US", themes: ["consumer"], refPrice: 95 },
  { id: "s-tgt",   ticker: "TGT",   cusip: "87612E106", issuerName: "Target Corp.",                  exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 145 },
  { id: "s-hd",    ticker: "HD",    cusip: "437076102", issuerName: "Home Depot Inc.",               exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 380 },
  { id: "s-low",   ticker: "LOW",   cusip: "548661107", issuerName: "Lowe's Companies Inc.",         exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 250 },
  { id: "s-cmg",   ticker: "CMG",   cusip: "169656105", issuerName: "Chipotle Mexican Grill Inc.",   exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 60 },
  { id: "s-qsr",   ticker: "QSR",   cusip: "76131D103", issuerName: "Restaurant Brands Int'l",       exchange: "NYSE",   country: "US", themes: ["consumer"], refPrice: 70 },
  { id: "s-hlt",   ticker: "HLT",   cusip: "43300A203", issuerName: "Hilton Worldwide Holdings Inc.", exchange: "NYSE",  country: "US", themes: ["consumer"], refPrice: 220 },

  // Healthcare
  { id: "s-unh",   ticker: "UNH",   cusip: "91324P102", issuerName: "UnitedHealth Group Inc.",       exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 540 },
  { id: "s-lly",   ticker: "LLY",   cusip: "532457108", issuerName: "Eli Lilly and Co.",             exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 820 },
  { id: "s-jnj",   ticker: "JNJ",   cusip: "478160104", issuerName: "Johnson & Johnson",             exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 160 },
  { id: "s-pfe",   ticker: "PFE",   cusip: "717081103", issuerName: "Pfizer Inc.",                   exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 28 },
  { id: "s-mrk",   ticker: "MRK",   cusip: "58933Y105", issuerName: "Merck & Co. Inc.",              exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 115 },
  { id: "s-abbv",  ticker: "ABBV",  cusip: "00287Y109", issuerName: "AbbVie Inc.",                   exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 180 },
  { id: "s-tmo",   ticker: "TMO",   cusip: "883556102", issuerName: "Thermo Fisher Scientific Inc.", exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 560 },
  { id: "s-abt",   ticker: "ABT",   cusip: "002824100", issuerName: "Abbott Laboratories",           exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 110 },
  { id: "s-dhr",   ticker: "DHR",   cusip: "235851102", issuerName: "Danaher Corp.",                 exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 250 },
  { id: "s-bmy",   ticker: "BMY",   cusip: "110122108", issuerName: "Bristol-Myers Squibb Co.",      exchange: "NYSE",   country: "US", themes: ["health"], refPrice: 50 },
  { id: "s-gild",  ticker: "GILD",  cusip: "375558103", issuerName: "Gilead Sciences Inc.",          exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 78 },
  { id: "s-regn",  ticker: "REGN",  cusip: "75886F107", issuerName: "Regeneron Pharmaceuticals",     exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 900 },
  { id: "s-amgn",  ticker: "AMGN",  cusip: "031162100", issuerName: "Amgen Inc.",                    exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 295 },
  { id: "s-mrna",  ticker: "MRNA",  cusip: "60770K107", issuerName: "Moderna Inc.",                  exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 40 },
  { id: "s-biib",  ticker: "BIIB",  cusip: "09062X103", issuerName: "Biogen Inc.",                   exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 200 },
  { id: "s-vrtx",  ticker: "VRTX",  cusip: "92532F100", issuerName: "Vertex Pharmaceuticals Inc.",   exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 490 },
  { id: "s-alny",  ticker: "ALNY",  cusip: "02043Q107", issuerName: "Alnylam Pharmaceuticals",       exchange: "NASDAQ", country: "US", themes: ["health"], refPrice: 270 },

  // Energy
  { id: "s-xom",   ticker: "XOM",   cusip: "30231G102", issuerName: "Exxon Mobil Corp.",             exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 120 },
  { id: "s-cvx",   ticker: "CVX",   cusip: "166764100", issuerName: "Chevron Corp.",                 exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 160 },
  { id: "s-cop",   ticker: "COP",   cusip: "20825C104", issuerName: "ConocoPhillips",                exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 115 },
  { id: "s-slb",   ticker: "SLB",   cusip: "806857108", issuerName: "Schlumberger NV",               exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 45 },
  { id: "s-oxy",   ticker: "OXY",   cusip: "674599105", issuerName: "Occidental Petroleum Corp.",    exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 60 },
  { id: "s-eog",   ticker: "EOG",   cusip: "26875P101", issuerName: "EOG Resources Inc.",            exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 125 },
  { id: "s-psx",   ticker: "PSX",   cusip: "718546104", issuerName: "Phillips 66",                   exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 130 },
  { id: "s-mpc",   ticker: "MPC",   cusip: "56585A102", issuerName: "Marathon Petroleum Corp.",      exchange: "NYSE",   country: "US", themes: ["energy"], refPrice: 175 },

  // Industrial
  { id: "s-cat",   ticker: "CAT",   cusip: "149123101", issuerName: "Caterpillar Inc.",              exchange: "NYSE",   country: "US", themes: ["industrial"], refPrice: 350 },
  { id: "s-de",    ticker: "DE",    cusip: "244199105", issuerName: "Deere & Co.",                   exchange: "NYSE",   country: "US", themes: ["industrial"], refPrice: 400 },
  { id: "s-ge",    ticker: "GE",    cusip: "369604301", issuerName: "GE Aerospace",                  exchange: "NYSE",   country: "US", themes: ["industrial","defense"], refPrice: 170 },
  { id: "s-hon",   ticker: "HON",   cusip: "438516106", issuerName: "Honeywell International Inc.",  exchange: "NASDAQ", country: "US", themes: ["industrial"], refPrice: 200 },
  { id: "s-emr",   ticker: "EMR",   cusip: "291011104", issuerName: "Emerson Electric Co.",          exchange: "NYSE",   country: "US", themes: ["industrial"], refPrice: 110 },
  { id: "s-etn",   ticker: "ETN",   cusip: "G29183103", issuerName: "Eaton Corp. PLC",               exchange: "NYSE",   country: "IE", themes: ["industrial"], refPrice: 320 },
  { id: "s-itw",   ticker: "ITW",   cusip: "452308109", issuerName: "Illinois Tool Works Inc.",      exchange: "NYSE",   country: "US", themes: ["industrial"], refPrice: 250 },
  { id: "s-cp",    ticker: "CP",    cusip: "13646K108", issuerName: "Canadian Pacific Kansas City",  exchange: "NYSE",   country: "CA", themes: ["industrial"], refPrice: 80 },

  // Autos / EV
  { id: "s-f",     ticker: "F",     cusip: "345370860", issuerName: "Ford Motor Co.",                exchange: "NYSE",   country: "US", themes: ["auto"], refPrice: 12 },
  { id: "s-gm",    ticker: "GM",    cusip: "37045V100", issuerName: "General Motors Co.",            exchange: "NYSE",   country: "US", themes: ["auto"], refPrice: 50 },
  { id: "s-rivn",  ticker: "RIVN",  cusip: "76954A103", issuerName: "Rivian Automotive Inc.",        exchange: "NASDAQ", country: "US", themes: ["auto"], refPrice: 13 },
  { id: "s-lcid",  ticker: "LCID",  cusip: "549498103", issuerName: "Lucid Group Inc.",              exchange: "NASDAQ", country: "US", themes: ["auto"], refPrice: 3 },
  { id: "s-nio",   ticker: "NIO",   cusip: "62914V106", issuerName: "NIO Inc.",                      exchange: "NYSE",   country: "CN", themes: ["auto"], refPrice: 5 },
];

export const SEC_BY_ID = new Map(SEC_DEFS.map((s) => [s.id, s]));
