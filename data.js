// Content for Innerve 11 — sourced from innerve.tech. Edit here; main.js renders it.
window.INNERVE = {
  eventStart: "2027-01-30T09:00:00+05:30",

  // assets/audio/theme.mp3 is a 7-song medley; these are the song start times (seconds).
  // Add titles here to show them in the player, e.g. titles: ["Gurenge", ...]
  music: { starts: [0, 233.9, 500.4, 773.8, 1038.6, 1296.3, 1477.5], titles: [] },

  // Tracks mapped to the nine Hashira breathing styles
  tracks: [
    { name: "Health", form: "insect", formJp: "蟲の呼吸 · 蝶ノ舞「戯れ」", formEn: "Insect Breathing · Butterfly Dance: Caprice", img: "shinobu", hashira: "Shinobu Kocho",     style: "Insect Breathing",  kanji: "蟲", pat: "p-insect",  desc: "Heal, detect, protect. Tech that keeps people alive." },
    { name: "AR / VR", form: "mist", formJp: "霞の呼吸 · 壱ノ型「垂天遠霞」", formEn: "Mist Breathing · First Form: Low Clouds, Distant Haze", img: "muichiro", hashira: "Muichiro Tokito",    style: "Mist Breathing",    kanji: "霞", pat: "p-mist",    desc: "Bend what the eye believes. Build worlds inside the world." },
    { name: "EduTech", form: "flame", formJp: "炎の呼吸 · 壱ノ型「不知火」", formEn: "Flame Breathing · First Form: Unknowing Fire", img: "rengoku", hashira: "Kyojuro Rengoku",    style: "Flame Breathing",   kanji: "炎", pat: "p-flame",   desc: "Pass the fire on. Tools that make learning burn brighter." },
    { name: "GameDev", form: "sound", formJp: "音の呼吸 · 壱ノ型「轟」", formEn: "Sound Breathing · First Form: Roar", img: "tengen", hashira: "Tengen Uzui",    style: "Sound Breathing",   kanji: "音", pat: "p-sound",   desc: "Flamboyant by design. Make something people can't put down." },
    { name: "FinTech", form: "stone", formJp: "岩の呼吸 · 壱ノ型「蛇紋岩・双極」", formEn: "Stone Breathing · First Form: Serpentinite Bipolar", img: "gyomei", hashira: "Gyomei Himejima",    style: "Stone Breathing",   kanji: "岩", pat: "p-stone",   desc: "Rock‑solid money systems. Payments, credit, inclusion." },
    { name: "CyberSec", form: "serpent", formJp: "蛇の呼吸 · 壱ノ型「委蛇斬り」", formEn: "Serpent Breathing · First Form: Winding Serpent Slash", img: "obanai", hashira: "Obanai Iguro",   style: "Serpent Breathing", kanji: "蛇", pat: "p-serpent", desc: "Strike unseen. Find the threat before it finds you." },
    { name: "BlockChain", form: "love", formJp: "恋の呼吸 · 壱ノ型「初恋のわななき」", formEn: "Love Breathing · First Form: Shivers of First Love", img: "mitsuri", hashira: "Mitsuri Kanroji", style: "Love Breathing",    kanji: "恋", pat: "p-love",    desc: "Bonds that can't be broken. Trust, chained block by block." },
    { name: "Logistics", form: "wind", formJp: "風の呼吸 · 壱ノ型「塵旋風・削ぎ」", formEn: "Wind Breathing · First Form: Dust Whirlwind Cutter", img: "sanemi", hashira: "Sanemi Shinazugawa",  style: "Wind Breathing",    kanji: "風", pat: "p-wind",    desc: "Move faster than the wind. Supply chains, routing, mobility." },
    { name: "Defence", form: "water", formJp: "水の呼吸 · 壱ノ型「水面斬り」", formEn: "Water Breathing · First Form: Water Surface Slash", img: "giyu", hashira: "Giyu Tomioka",    style: "Water Breathing",   kanji: "水", pat: "p-hex",     desc: "Dead calm under pressure. Tech that guards the nation." }
  ],

  frames: [
    { img: "tanjiro-side", who: "Tanjiro Kamado",     tag: "Slayer · Water & Sun Breathing", kanji: "炭", cls: "big" },
    { img: "nezuko-side",  who: "Nezuko Kamado",      tag: "Demon · Blood Demon Art",       kanji: "禰" },
    { img: "akaza",        who: "Akaza",              tag: "Upper Moon Three",              kanji: "猗", cls: "dark" },
    { img: "zenitsu",      who: "Zenitsu Agatsuma",   tag: "Slayer · Thunder Breathing",    kanji: "雷" },
    { img: "inosuke",      who: "Inosuke Hashibira",  tag: "Slayer · Beast Breathing",      kanji: "獣" },
    { img: "giyu-action",  who: "Giyu Tomioka",       tag: "Water Hashira",                 kanji: "水", cls: "wide" }
  ],

  prizes: [
    { rank: "1st Prize",       kanji: "壱", amt: "125K+", hot: true },
    { rank: "2nd Prize",       kanji: "弐", amt: "75K+" },
    { rank: "3rd Prize",       kanji: "参", amt: "50K+" },
    { rank: "Ingenious Spark", kanji: "閃", amt: "25K+" },
    { rank: "Visionary Spark", kanji: "光", amt: "15K+" }
  ],
  prizePerks: ["Innerve goodies and merch", "Funding and internship opportunities from our sponsors"],

  timeline: [
    { date: "15 Nov 2026", title: "Registration Starts",            text: "Secure your spot starting November 15, 2026, at 12:00 AM IST." },
    { date: "31 Dec 2026", title: "Registration Ends",              text: "Registration closes on December 31, 2026, at 11:59 PM IST. Don't miss your chance." },
    { date: "08 Jan 2027", title: "Shortlisted Teams Announced",    text: "Shortlisted teams will be announced on January 8, 2027. Check back to see if your team advances." },
    { date: "30 Jan 2027", title: "Hackathon Begins",               text: "The 24‑hour coding marathon starts on January 30, 2027. Build innovative solutions and bring your ideas to life." },
    { date: "31 Jan 2027", title: "Results Announced",              text: "Winners will be announced on January 31, 2027. Exciting prizes and recognition await." }
  ],

  testimonials: [
    { name: "Mohit Nippanikar", org: "SVKM's Dwarkadas J. Sanghvi College of Engineering",
      quote: "This has been the best experience I've had over many hackathons. The time management, evaluation process, sponsor support and overall program coordination were exceptionally well planned. Everything from accommodation to a proper execution. It's rare to see such well organized management, and the effort truly showed." },
    { name: "Manasvi Mittal", org: "Indira Gandhi Delhi Technical University for Women",
      quote: "InNerve was honestly such a fun and memorable experience! The mentors were super supportive, and the judges were genuinely interested in understanding our projects and ideas. Learned a lot, had loads of fun, and winning 1st Runner‑Up made it even more special!" },
    { name: "Vivek Negi", org: "Army Institute of Technology",
      quote: "Innerve X was an unforgettable journey of innovation and teamwork! The competitive yet thrilling atmosphere pushed us to think creatively and build complex web solutions from scratch, helping us clinch the 2nd Runner‑Up title. Can't wait for the next one!" }
  ],

  sponsors: [
    { tier: "Title Sponsor",     name: "Keychain",          logo: "keyChainLogo.svg",          url: "https://www.keychain.com/", size: "xl" },
    { tier: "Platinum Sponsor",  name: "miniOrange",        logo: "miniOrange-black.svg",      url: "https://www.miniorange.com/", size: "l" },
    { tier: "Gold Sponsor",      name: "Josh Software",     logo: "josh.png",                  url: "https://www.joshsoftware.com/", size: "l" },
    { tier: "Bronze Sponsor",    name: "Accops",            logo: "Accops_Systems.png",        url: "https://www.accops.com/" },
    { tier: "Event Partner",     name: "MLH",               logo: "MlhLogo1.svg",              url: "https://mlh.io/" },
    { tier: "Banking Partner",   name: "Bank of Baroda",    logo: "Bank_of_Baroda_logo.png",   url: "https://bankofbaroda.bank.in/" },
    { tier: "Platform Sponsor",  name: "Devfolio",          logo: "Devfolio_Logo-Black.svg",   url: "https://devfolio.co/" },
    { tier: "Media Partner",     name: "Eventopia",         logo: "eventopia.svg",             url: "https://eventopia.in/" },
    { tier: "Supporting",        name: "MongoDB",           logo: "MongoDB_Fores-Green.svg",   url: "https://www.mongodb.com/" },
    { tier: "Supporting",        name: "ETHIndia",          logo: "ETHIndiaLogo.png",          url: "https://ethindia-villa.devfolio.co/" },
    { tier: "Supporting",        name: "GiveMyCertificate", logo: "givemycertficateLogo.png",  url: "https://givemycertificate.com/" },
    { tier: "Supporting",        name: "Keploy",            logo: "keploLogo.png",             url: "https://keplo.com/" },
    { tier: "Supporting",        name: "CodeCrafters",      logo: "CodeCraftersLogo.png",      url: "https://codecrafters.io/" },
    { tier: "Supporting",        name: "Mastra",            logo: "MastraAi.svg",              url: "https://mastra.ai/" }
  ],

  faq: {
    "General": [
      { q: "What is Innerve?", a: "A 24‑hour offline hackathon with challenging problems, exciting swags and goodies for participants. We also conduct seminars and interactions with industry experts." },
      { q: "Who is eligible to participate?", a: "Innerve 11 welcomes participants passionate about coding with keen interest in problem‑solving, i.e., students, professionals, and hobbyists from diverse backgrounds." },
      { q: "What are the different phases of the hackathon?", a: "Idea Pitching: 15th Dec 2026 – 8th Jan 2027, and the 24‑hrs Hackathon: 30th – 31st Jan 2027." },
      { q: "What kind of prizes can participants expect?", a: "Prizes include cash rewards, goodies, certificates, and special surprises for the winners." }
    ],
    "Registration": [
      { q: "How do I apply for Innerve 11?", a: "Our registration forms are out. Kindly refer to the filling instructions available on the website." },
      { q: "Is there a registration fee for Innerve?", a: "There is no registration fee. It is open for all." },
      { q: "Is there a minimum or maximum size for the team?", a: "Yes, minimum 2 and maximum 4 participants are allowed per team." },
      { q: "What are the dates of Phase 1 & 2?", a: "Idea Pitching: 15th Dec 2026 – 8th Jan 2027 & 24‑hrs Hackathon: 30th – 31st Jan 2027." }
    ],
    "Stay & Travel": [
      { q: "Where can participants find accommodation during the hackathon?", a: "Lodging is available at the AIT Campus itself. Mess and stay will be provided to all participants." },
      { q: "How do we reach the venue?", a: "Location is available below. For any further assistance please contact the OSS Club." },
      { q: "Will there be any travel reimbursements provided?", a: "Travel reimbursements will not be provided to participants. Participants are advised to plan their travel accordingly." },
      { q: "What to bring during in-person reporting at the venue?", a: "Carry your documents and devices. Stay on the lookout for further updates." }
    ]
  }
};
