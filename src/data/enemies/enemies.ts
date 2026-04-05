export interface Boss {
  id: string;
  name: string;
  index: string;
  description: string;
  damageType: string[];
  abilities: string[];
}

const ENEMY_AVATAR_BASE =
  "https://cdn.jsdelivr.net/gh/ArknightsAssets/ArknightsAssets2@cn/assets/dyn/arts/enemies/";

export function getEnemyAvatarUrl(id: string): string {
  return `${ENEMY_AVATAR_BASE}${id}.png`;
}

export const bosses: Boss[] = [
  {
    id: "enemy_1001_bigbo",
    name: "Big Bob",
    index: "11",
    description:
      "One of Reunion's squad leaders. He wears a heavy blast suit and attacks with an electric chainsaw. He has been spotted leading peripheral operations in some remote areas, and is known to be a seasoned combatant and commander. Due to his devastating attacks and extreme survivability, proceed with utmost caution.",
    damageType: ["PHYSIC"],
    abilities: [],
  },
  {
    id: "enemy_1001_bigbo_2",
    name: "Big Adam",
    index: "12",
    description:
      "One of Reunion's squad leaders. He wears a heavy blast suit and attacks with an electric chainsaw. Bears a remarkable similarity to Big Bob, but does not appear to be the same person. It is unknown whether there is any relationship between the two of them. Data suggests that he may be even more dangerous than Big Bob. Due to his devastating attacks and extreme survivability, proceed with utmost caution.",
    damageType: ["PHYSIC"],
    abilities: [],
  },
  {
    id: "enemy_1537_mhrors",
    name: "Rathalos",
    index: "6935",
    description:
      "The crimson-carapaced, flame-commanding Rathalos, its capacity for flight excels among Flying Wyverns, its aerial assaults and flaming breath combine to dominate over a vast array of life. Owing to the astonishing strength by which it rules the air, it is also known as the 'King of the Skies.'",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "Can only be blocked by Operators with 3 or more Block",
      "Grounded State",
      "The Rathalos's tail can be severed by attacking it from behind in its Grounded State",
      "[Roar] Stuns all allied units on the field",
      "[Tailspin] Deals Physical damage in a semicircle to the rear to all targets",
      "[Fire Breath] Deals Arts damage to allied units",
      "[Backfire] Deals Arts damage to targets in front and takes flight",
      "Flying State",
      "Flash Grenades can knock the Rathalos out of its Flying State",
      "[Aerial Claw Attack] Deals Physical damage in a circle to surrounding targets",
      "[Aerial Heat Breath] Breathes fire in a fan shape, dealing Arts damage to targets in front",
      "[Rushing Fire Breath] Breathes a column of flames, dealing Arts damage to all targets within 3 rows in front",
      "Nest Phase",
      "[Nest] If it is not defeated in the first wave, it will move into its Den",
    ],
  },
  {
    id: "enemy_1539_reid",
    name: "'Hateful Avenger'",
    index: "A15",
    description:
      "A Reunion squad leader you've previously faced, who attacks with an impressive searing blade. The formidable foe you defeated in the Area 59 Ruins appears before you once again, unsheathing the flames of vengeance.",
    damageType: ["PHYSIC"],
    abilities: [
      "Gains significantly increased ATK when HP is under 50%",
      "[Charge] Locks onto a target within range on the path ahead, and gains greatly increased Movement Speed for a period of time",
      "Revives after being defeated for the first time, recovering half its HP",
    ],
  },
  {
    id: "enemy_1566_mpascl",
    name: "'Ascalon'",
    index: "AC",
    description:
      "'A sword to slay the regent king, a spear to pierce the royal ring'? No, you're just the one from my memories.",
    damageType: ["PHYSIC"],
    abilities: [
      "[Descent] After chanting for a short time, casts Originium Arts to hide herself in smoke while performing multiple attacks",
    ],
  },
  {
    id: "enemy_2092_skzamy",
    name: "'Amiya', Furnace's Finale",
    index: "AFF",
    description:
      "It awaits at the end of each story, taking away every character, shutting the door on every possibility, bringing a close to every narration. It is the imagination of the end, and the end of imagination. It is everything, but it is not someone you know.",
    damageType: ["MAGIC"],
    abilities: [
      "[Vestiges of Creativity] Vestiges of Creativity on the battlefield change direction when they come into contact with Guideposts of the Past or terrain features. When they come into contact with Guideposts of the Past, they release the enemy or allied Operator contained within.",
      "First Form",
      "[Those Who Should Not Be] Amiya takes 50% less Physical and Arts damage, and becomes Invulnerable when HP drops below 50% for the first time",
      "[Recreation of the End] Recovers SP when Buldrokkas'tee, Holy Gun-Knight, Theresis, Black Crowned Lord, Qui'lon, Avatar of the Mahasattva, or Manfred are defeated or leave the battlefield. When SP is at max, casts [Premonition of Continuation].",
      "[Premonition of Continuation] Stops attacking and begins to gradually erase tiles and all units on them. For each Guidepost of the Past or enemy erased, reduces Life Points based on the enemy erased before moving to the next area. Premonition of Continuation SP requirement is greatly reduced when the mind is Fractured.",
      "Second Form",
      "[Afterglow of the Black Crown] Immediately deals one instance of True damage to up to 7 nearby units when entering second form, and whenever she touches a Vestige of Creativity",
      "[Wordless Expectation] Periodically summons one Vestige of Creativity",
      "[Eternal Existence] Erases all enemies, Operators, and Guideposts of the Past, ending the operation",
    ],
  },
  {
    id: "enemy_1559_vtlionk",
    name: "Alistair, Final Flame of the Empire",
    index: "ALS",
    description:
      "The final flame of the empire, a specter adorned with a rusted crown. Refute him. Refute Victoria's supreme glory and authority. He will examine the evidence. He may yet forgive.",
    damageType: ["PHYSIC"],
    abilities: [
      "When HP drops below half, DEF and RES increase, and [Imperial Domain] activates two pieces of gear",
      "[Expulsion] After some time has passed, deals Arts splash damage to all your units, and drains all Life Points",
      "[Royal Decree] Locks onto an allied unit and their surrounding 4 tiles, dealing heavy Physical damage to targets within that range once and generating random gear on tiles within that range",
      "[Imperial Domain] Activates a piece of gear on the field; different types of gear will result in different effects",
    ],
  },
  {
    id: "enemy_1529_dsdevr",
    name: "The Endspeaker, Will of We Many",
    index: "AMA",
    description:
      "The tiny Seaborn that haunted the mighty Stultifera, the blood of its parents once strewn across the ocean's waters. The revelation reaches not the ears of the children, their kind's destiny quietly continuing to flow.",
    damageType: ["PHYSIC"],
    abilities: [
      "When defeated, disappears for a short time before evolving into its next form",
      "When evolving into its next form, gains the following effects in this order: Gains increased DEF/Gains increased Movement Speed/Gains increased ATK and Lifesteal",
      "[Consume] Consumes the [Remains] of its Seaborn kin, gaining their corresponding [Directed Evolution] ability in the next evolutionary phase, while also instantly defeating any Operators near the Remains and preventing them from being redeployed for a period of time.",
    ],
  },
  {
    id: "enemy_1527_martyr",
    name: "Andoain, the 'Martyr'",
    index: "AND",
    description:
      "A Sankta who made an enemy of Laterano for the sake of asking a question. A Pathfinder who tread the path of peril for the sake of receiving an answer. He feels neither wrath nor sorrow. He neither curses God, nor beseeches man. Andoain only follows his own path, wherever it may end.",
    damageType: ["PHYSIC"],
    abilities: [
      "Cannot be blocked.",
      "While this unit is holding Ammo, ATK increases. Ammo capacity: 5",
      "While this unit is holding Ammo, gains increased ATK and attacks will cause bullets to bounce to nearby targets up to 5 times, dealing additional damage to 'Gelato Stops'",
      "First Form",
      "[Light Unto Sufferers] Whenever a certain percentage of HP is lost, creates a permanent field effect. Enemies standing on affected tiles take reduced Physical and Arts damage and gain 50% Physical and Arts dodge",
      "Second Form",
      "After being defeated once, enters his Second Form, gaining increased ATK",
      "[Ashes to Ashes, Dust to Dust] Andoain stops attacking and scans the battlefield from left to right, locking onto at most 5 targets before dealing massive Physical damage to them and fully replenishing his Ammo",
      "Whenever a low percentage of HP is lost, unleashes the permanent terrain effect [Light Unto Sufferers]",
    ],
  },
  {
    id: "enemy_1561_crzjdg",
    name: "Anastasio, the Atoner",
    index: "AR",
    description:
      "Anastasio has died. Anastasio rises again. He lives to atone for the sins ingrained in his very nature. He envies both the innocent for living and the sinner for dying, for it is not his place to either live with integrity or die in peace.",
    damageType: ["PHYSIC"],
    abilities: [
      "Performs ranged attacks when unblocked, dealing Physical damage to the target and all allied units within the 8 surrounding tiles",
      "[Gospel Spray] Fires within range 10 times, dealing Physical damage and <$ba.dt.erosion>Corrosion Damage</> to the target and surrounding allied units, prioritizing allies with the lowest total <$ba.dt.erosion>Corrosion Damage</>",
      "First Form",
      "Immune to the effects of Salt Flat, and takes far less Physical and Arts damage when in the surrounding 8 tiles around a <Saltheap Cannon>",
      "[Inquisition of Sin] Buffs a <Saltheap Cannon> within Attack Range, increasing its splash area for a period of time",
      "The first time HP drops to 0, jumps to a fixed spot and enters second form, summoning a <Saltheap Cannon>",
      "Second Form",
      "Immune to <$ba.stun>Stun</>; gains increased Movement Speed and ASPD",
      "When another enemy appears, gains increased ATK, but loses HP per second for a period of time",
      "When not blocked, takes significantly reduced Physical and Arts damage; when blocked, causes all <Saltheap Cannons> to target the location of the blocker",
      "[Heart-Piercing Salvation] Whenever a certain amount of HP is lost, passes through the unit blocking him, dealing Physical damage to units along the path",
    ],
  },
  {
    id: "enemy_1519_bgball",
    name: "'Essence of Evolution'",
    index: "BB",
    description:
      "A madman who should not have stepped upon this world. An oddity that should not have existed in the other world. The union of the two gave birth to this node of 'evolution' that far surpasses the limits of biology. It's existence naturally contradicts all of Terra. It should not live. It must not live.",
    damageType: ["PHYSIC"],
    abilities: [
      "Unable to move",
      "Will evolve after a certain duration or when HP falls below a certain threshold",
      "Periodically creates <Originiutant Excrescences> or <Originiutant Tumors>",
      "Periodically deals a large amount of True damage to all allied units on the field",
      "Firstborn Form",
      "Greatly reduces Physical and Arts damage taken from units to the left",
      "Evolution Form",
      "Greatly reduces Physical and Arts damage taken from units to the right",
      "Perfect Form",
      "Takes greatly reduced Physical and Arts damage, but loses HP every second",
    ],
  },
  {
    id: "enemy_1531_bbrain",
    name: "'Awaken'",
    index: "BBR",
    description:
      "The 'Dreamland' that Dorothy personally created. In here, no one will ever have to suffer the pain of the journey. Love and hope shall achieve that which technology cannot.",
    damageType: ["PHYSIC"],
    abilities: [
      "Unable to move",
      "When 'Awaken' takes damage, transfers 50% of the damage received to Dorothy's other experiments on the field",
      "First Form",
      "Periodically transfers itself to a specified tile and casts [Shattered Vision], dealing a large amount of physical damage to all units on the field. This damage is split equally among all deployed units",
      "Periodically casts [Journey] to the left and right, dealing Physical damage to the first unit hit",
      "Second Form",
      "Gains increased ATK",
      "Immediately activates all <R-Series Power Armors> on the field",
      "[Shattered Vision] Now also <$ba.stun>Stuns</> units on high ground",
      "'Awaken' will cast [Journey] in all 4 directions",
    ],
  },
  {
    id: "enemy_1525_blkswb",
    name: "Degenbrecher",
    index: "BJ",
    description:
      "Three-time champion of the Kazimierz Major, a defective Leithanian unable to use Arts, a natural-born warrior\u2014The Black Knight.",
    damageType: ["PHYSIC"],
    abilities: [
      "Immune to <$ba.frozen>Frozen</> and has <$ba.buffres>Status resistance</>",
      "Gains increased ATK during <Snowfall>",
      "First Form",
      "Attacks against the blocker ignore a certain amount of DEF",
      "[Swift Slayer] When blocked, bypasses the target and deals Physical damage to units along her path",
      "[Brutalizing Blizzard] Deals Physical damage to units in the surrounding area",
      "Second Form",
      "<$ba.invisible>Invisible</>",
      "Attacks ignore more of the target's DEF and strike twice",
      "[Momentum Murder] Whenever 25% HP is lost, clears the SP of all allied units within range and restricts the targets from attacking or healing for some time",
    ],
  },
  {
    id: "enemy_1524_bldkgt",
    name: "The Blood Knight Dikaiopolis",
    index: "BK",
    description:
      "The Blood Knight, Dikaiopolis. The originator of Kazimierz's Infected Knight program, the hero of the Grand Knight Territory's Infected, and an idol to countless children. What exactly did the 'hero' give up to obtain the peace we know today?",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "Reduce damage taken, but damage reduction does not work on units blocking it",
      "First Form",
      "[Exsanguination] <$ba.stun>Stuns</> the target, dealing Arts damage every second",
      "Resurrection Stance",
      "Blood Knight is invulnerable and continuously summons <Bloodblades>; enters the Second Form after some time",
      "[Resurrection Stance] If the Blood Knight's HP is restored to its maximum while in this stance, he will return to his first form",
      "Second Form",
      "Gains increased ATK and attacks become ranged",
      "Continuously summons <Bloodblades>",
    ],
  },
  {
    id: "enemy_1546_cliff",
    name: "'Clip' Cliff",
    index: "BSC",
    description:
      "Legendary mercenary and founder of Blacksteel Worldwide. War once destroyed him, then forged him anew.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks reduce the target's DEF for a few seconds; this effect can stack.",
      "ATK and DEF are greatly reduced upon taking damage from a Waste Heat Vent.",
      "First Form",
      "[Quickdraw] Stuns the target and adjacent units, then attacks 3 times consecutively.",
      "Second Form",
      "Upon entering second form, gains the ability to immediately clear the SP of all Waste Heat Vents on the field.",
      "ATK and DEF increased, ASPD greatly increased.",
      "[Stroke of Thunder] Stuns the target and adjacent units, then attacks 6 times consecutively. If the target retreats or is defeated, the attacks will penetrate a certain distance and this skill will be refreshed.",
    ],
  },
  {
    id: "enemy_1515_bsnake",
    name: "'Deathless Black Snake'",
    index: "BSN",
    description:
      "A disenchanted Reunion soldier, or a giant manipulating history? A conspirator full of lies, or a nobleman swallowed by tragedy? The truth has been turned to ash, and only an evil god stands in the flames.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Phase",
      "Attacks deal True damage and apply [Burning Breath] to the target (Deals increasing True damage each second, but can be <$ba.buffres>Resisted</>)",
      "Periodically applies [Burning Breath] to two allied units, and also greatly reduces damage taken from units afflicted with [Burning Breath]",
      "Detonates all allied units on the field afflicted by [Burning Breath], dealing Arts damage to the surrounding four tiles and applying [Burning Breath] to targets hit by this splash effect",
      "When HP drops to 0, releases [Deathless Inferno], dealing massive Arts damage across the battlefield and enters Enraged State",
      "Enraged State",
      "Max HP and ATK are greatly increased",
      "Summons an <Energy Aggregate> to help in combat",
    ],
  },
  {
    id: "enemy_1512_mcmstr",
    name: "'The Big Ugly Thing'",
    index: "BU",
    description:
      "Zumama's magnum opus, a massive mechanical monster piloted by the High Priest. It can strike both in melee range and from a distance, capable of easily destroying Giant Mushrooms and Stumps. Normal engineers cannot even fathom how a machine slapped together haphazardly like this can even move, but move it indeed does.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "Ranged attacks deal Splash damage, Melee attacks deal more damage",
      "Periodically destroys Giant Mushrooms and Stumps, rendering them unable to be deployed upon",
      "When HP drops to 0, it will explode, <$ba.stun>Stunning</> units in a large area and ejecting its pilot, the High Priest",
      "High Priest Form",
      "Will not attack, cannot be blocked, and takes True damage every second",
    ],
  },
  {
    id: "enemy_1544_cledub",
    name: "'The Gardener'",
    index: "CD",
    description:
      "The most ordinary gardener around, Cl\u00e9ment Dubois. He holds soil in both his hands, but the land is so barren that the flowers which once bloomed can no longer grow.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Cannot be blocked, permanently Invulnerable",
      "First Form",
      "[Preach] Places an 'Answer' sign on the ground, guiding the <Monastery Inhabitants'> movements. When a Monastery Inhabitant reaches the sign, their Panic level is reduced and will not increase for a period of time",
      "[Question] Periodically activates Crumbling Masonry on the field",
      "[Demand] Periodically applies a permanent negative status effect to all allied units on the field, cycling between the following effects in this order: Decreased ASPD, Decreased Block, Decreased Max HP",
      "Second Form",
      "When entering Second Form, deactivates all activated Crumbling Masonry while activating the remaining Crumbling Masonry on the map",
      "[Question] Now randomly summons additional enemies or <Monastery Inhabitants>",
      "[Demand] Debuff effects are enhanced",
    ],
  },
  {
    id: "enemy_2056_smedzi",
    name: "Crazelyseon, the Ascendant of Cosmoi",
    index: "CES",
    description: "An instinct as chaotic as thought itself.",
    damageType: ["MAGIC"],
    abilities: [
      "Invulnerable",
      "Attacks 2 targets simultaneously; deals heavy Arts damage to allied units on [Seedbeds]",
      "Whenever it moves itself, turns 2 deployable spots into [Seedbeds] that deal continuous Arts damage to allied units on the affected tiles and greatly reduce their ASPD",
      "Gains increased ATK after being defeated for the first time",
      "After a long time has passed in the battle, turns all deployable spots on the field into [Seedbeds] and drains 30 Life Points",
    ],
  },
  {
    id: "enemy_1522_captan",
    name: "Pancho Salas",
    index: "CPS",
    description:
      "Pancho Salas, an old veteran piloting a heavily modified motorboat. Even should his vessel be destroyed, he will never falter before reaching his goal.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "Summons <Kites> and <Pancho's Explosive Boats> in battle",
      "Attacks the unit with the highest Max HP with its water cannon, continuously dealing Arts and <$ba.dt.erosion>Corrosion damage</>",
      "The first time HP drops to 0, jumps to a fixed spot and enters Second Form",
      "Second Form",
      "Gains increased ASPD and periodically attacks all surrounding allied units",
      "Attacks the unit with the highest DEF with its small arms, and reduces the target's DEF",
      "When Pancho defeats a unit or is defeated, increases the ASPD and Movement Speed of all enemy units",
    ],
  },
  {
    id: "enemy_1502_crowns",
    name: "Crownslayer",
    index: "CS",
    description:
      "One of Reunion's squad leaders who handles infiltration and assassination operations, specializing in melee combat and breaking through defensive lines. Her stealth and superb infiltration abilities have foiled countless attempts to capture her.",
    damageType: ["PHYSIC"],
    abilities: ["When blocked, can quickly move behind the unit"],
  },
  {
    id: "enemy_1532_minima",
    name: "'Materialist Antagonizer'",
    index: "CST",
    description:
      "Construction machinery attempting to protect Stitch Canvas, under the mistaken impression that he is about to be attacked. Before explaining what's actually going on, let's settle things with a test of strength first.",
    damageType: ["MAGIC"],
    abilities: [
      "Initial Form",
      "Aerial unit; unblockable",
      "While on the battlefield, increases the strength of all Machine enemies",
      "Attacks will deploy small drones that deal continuous Arts damage to the target for a period of time, prioritizing targets that are not already locked onto by these drones",
      "Periodically refreshes a Barrier that can resist Physical and Arts damage. While the Barrier persists, other enemies within attack range gains<$ba.invisible>Invisibility</>.",
      "Periodically locks on to the friendly unit with the greatest number of surrounding units and continuously deals Arts damage in an area around that unit",
      "Periodically locks on to the friendly unit with the fewest number of units around it and continuously inflicts <$ba.stun>Stun</> in an area around that unit",
      "When HP reaches 0 for the first time, Stitch will appear",
      "Stitch Form",
      "<$ba.stun>Stunned</> for a period of time after appearing on the field",
      "Will not attack, and cannot be blocked",
    ],
  },
  {
    id: "enemy_2048_smgrd",
    name: "'Demon's Blade'",
    index: "DB",
    description:
      "An out-of-control 'Emperor's Blade' is simply not allowed to exist in this world, neither as a living person nor as a dominion. It will be hunted down by its comrades until it is completely wiped from this land.",
    damageType: ["PHYSIC"],
    abilities: [
      "Deals heavy Physical damage to allied units on tiles affected by [Dominion]",
      "Continuously generates [Dominion] on the surrounding 8 tiles, significantly reducing the ASPD of allied units",
    ],
  },
  {
    id: "enemy_2049_smgrd2",
    name: "'Demon's Blade,' the Vagabond",
    index: "DBV",
    description:
      "Ursus's deepest secrets must not be seen by others, so any 'Emperor's Blade' unable to take charge of their own conduct and movements ought to be completely erased.",
    damageType: ["PHYSIC"],
    abilities: [
      "Deals heavy Physical damage to allied units on tiles affected by [Dominion]",
      "Continuously generates [Dominion] in a large radius around self, significantly reducing the ASPD of allied units",
    ],
  },
  {
    id: "enemy_1542_wdslm",
    name: "'Damazti Cluster'",
    index: "DC1",
    description:
      "A long-lived that has drifted away from the Sarkaz Royal Court. They have taken the rise and fall of the various races as a sort of life experience, but the Damazti Cluster has yet to find the answer to what 'living' means.",
    damageType: ["PHYSIC"],
    abilities: [
      "Spy",
      "Whenever a certain percentage of HP is lost, summons an Isomorphic Fragment on an Operator or on the field that shares HP with self;",
      "Both the Damazti Cluster and Isomorphic Fragments take reduced Physical and Arts damage for every Isomorphic Fragment present on the field",
      "Both the Damazti Cluster and Isomorphic Fragments are Invulnerable while their identities have yet to be revealed",
      "Attacks inflict <$ba.dt.erosion>Corrosion damage</>",
      "First Form",
      "Periodically releases [Derivative Iteration]: both the Damazti Cluster and Isomorphic Fragments simultaneously deal Physical damage to a target",
      "When defeated for the first time, deals continuous Arts damage to all units around Damazti Cluster or Isomorphic Fragments while regenerating itself",
      "Second Form",
      "Periodically releases [Lifeline Burst] which locks onto all allies on the field, and after a period of time deals Arts damage to the targets and any allies in the adjacent 4 tiles and summons a Deconstructed Distortion on the locked-on positions",
      "When HP falls below a certain percentage during second form, summons an Isomorphic Fragment lurking amongst your operators, targeting an operator that will be forced off the battlefield after summoning is complete. Prioritizes units without allies in adjacent spaces",
    ],
  },
  {
    id: "enemy_1541_wdslms",
    name: "'Damazti Cluster'",
    index: "DC3",
    description:
      "The long-lived that wanders outside the Sarkaz Royal Court, facing the path of flame.",
    damageType: ["PHYSIC"],
    abilities: [],
  },
  {
    id: "enemy_1513_dekght",
    name: "Corrupted Knight",
    index: "DK1",
    description:
      "A Sarkaz knight with a broken horn who radiates terror and shows clear signs of excessive drug use. Uses a warhammer in battle. Crushes enemies with terrifying bloodlust. When the Withered Knight falls, takes up the quest and becomes dramatically stronger. Every step he takes spreads corruption.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks deal Physical damage to the target and adjacent allied units",
      "Does charged attacks, dealing heavy Physical damage to the targets and any adjacent units",
      "Gains greatly increased ATK, ASPD, and Movement Speed when <Withered Knight> dies",
    ],
  },
  {
    id: "enemy_1513_dekght_2",
    name: "Withered Knight",
    index: "DK2",
    description:
      "A Sarkaz knight with a broken horn who radiates terror and shows clear signs of excessive drug use. Uses a cursed bow in battle. Can shoot multiple targets at once and plant seeds of withering arts. When the Corrupted Knight falls, takes up the quest and becomes dramatically stronger. Knights that are hostile to him will shift to Wither.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks 2 targets simultaneously",
      "Fires explosive arrows at three targets which explode after a short delay, dealing high Arts damage to the target and surrounding four tiles",
      "Gains greatly increased ATK, ASPD, and Movement Speed when <Corrupted Knight> dies",
    ],
  },
  {
    id: "enemy_6010_boxing",
    name: "'Boy Wonder' Sandel",
    index: "DL10",
    description:
      "An old underground boxer from Rim Billiton, nicknamed from his debut fight as a youth, where he defeated an older champion hungry for competition. Many years later, he lost to someone even younger than him, and left for the wilderness in anger. Relying on his cunning and life experiences over the years, he became a boxing fixer in the wilderness, and even had the beautiful dream of snatching some land in a nomadic city to build a underground boxing arena, but he had no idea that the key to success or failure was never in his hands to begin with.",
    damageType: ["PHYSIC"],
    abilities: [
      "Takes less damage from all units other than the blocker when blocked",
      "Gets knocked down to rest when health drops to a certain percentage; when all HP is restored, gets up again and ASPD increases.",
    ],
  },
  {
    id: "enemy_6011_planty",
    name: "'Nature's Compromise'",
    index: "DL11",
    description:
      "A newly discovered life form and the largest Originium Slug and flower symbiote on reliable record. Capable of boosting plant growth and Originium Slug reproduction by dispersing its pollen, it can even fly slowly in the air. Some scholars believe that its ability to fly is new evidence of unintelligent organisms actively manipulating complex Originium Arts, while others believe it is nothing more than a naturally occurring phenomenon under hyper-specific conditions. This question has yet to be resolved, as no biologist has been desperate enough to approach it.",
    damageType: ["PHYSIC"],
    abilities: [
      "Consumes lifeforce while flying over ground tiles and causes vegetation to grow on tiles it travels over; falls to the ground when HP reaches half",
      "[Growth Hormone] While flying, covers surrounding tiles with vegetation that summons <Small Symbionts>",
      "[Deciduous Hormone] When Operators are transferred, attacks the Operator on the field with the highest DEF and places a [Modified Phytohormone] into the Deployment Waiting Zone",
    ],
  },
  {
    id: "enemy_6013_smith",
    name: "Mama's 'Rebel Girl'",
    index: "DL13",
    description:
      "Former Mama John's employee. No one knows what she's been through the past few years, but it's clear she doesn't have a favorable impression of her Mama's huge family. She's now brandishing an arsenal of weapons built by her construction crew, and recklessly destroying her Mama's new plate.",
    damageType: ["PHYSIC"],
    abilities: [
      "Invulnerable for a period of time after appearing on the field",
      "Periodically summons a hidden Full-Auto Debit Machine that periodically consumes DP",
      "When Danger Level increases, summons a hidden Post-Firing Debt Relief Program that fires long-ranged attacks in a set direction",
    ],
  },
  {
    id: "enemy_6014_crzgas",
    name: "'Tumor'",
    index: "DL14",
    description:
      "A bona fide thug from the barrenlands, head to toe. They once merely wandered the wilds, but after spotting a Raythean Industries test platform dealing with a gas leakage, they've decided to risk it all and take over the entire platform to make their fortune.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Flying unit.",
      "Whenever a certain percentage of HP is lost, permanently increases the damage inflicted by Poison Haze",
      "Periodically sends a Rupturing Canister to the Preparation Area (grants <$ba.invisible>Invisibility</> to all enemies except 'Tumor' when dispatched)",
    ],
  },
  {
    id: "enemy_6015_ictruck",
    name: "'Supersweetie Smiley'",
    index: "DL15",
    description:
      "A fully automatic ice cream truck made to ensure a steady supply of ice cream. It lost control after a worker accidentally poured syrup into its fuel tank, overriding the core control platform and spraying ice cream everywhere. It is always stirring the milk slurry within itself, and is ready to flash a smile at any customer who comes into view.",
    damageType: ["PHYSIC"],
    abilities: [
      "Can only be blocked by Operators with 3 or more Block",
      "Periodically dispatches a <Supersweetie Delivery Drone> towards a target, prioritizing Operators on high ground",
      "After being on the field for a period of time, periodically increases the Movement Speed and ASPD of all enemies on the field when not blocked",
      "Periodically enters Speeding Mode. Can no longer be blocked, and deals Physical damage by colliding with allied units",
      "Exits Speeding Mode only after colliding 5 times with an Operator with a Block count of 4 and higher; will stop and be inflicted with <$ba.fragile>Fragile</> for a short period, and Stuns all enemies on the field",
    ],
  },
  {
    id: "enemy_6016_splash",
    name: "Thirster",
    index: "DL16",
    description:
      "It once bore an Iberian name, until it tossed that name into the sea and disappeared into the abyss. However, embracing the seawater was not enough to moisten its parched throat, and the clear red liquid flowing within its veins is equally enticing, so it has returned to dry land once more, thirstier than ever.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks inflict additional <$ba.dt.neural>Nervous Impairment</>",
      "Has high DEF and RES, but those can be reduced by healing <Absorbers> to full HP",
      "Spits out filth at set intervals, placing an <Absorber> in the Deployment Waiting Zone and attacking several operators on the field; number of operators attacked increases according to Danger Level",
      "After losing a certain percentage of HP, immediately Stuns multiple Operators on the field and creates a Barrier equal to the HP lost; if the Barrier is not destroyed before it expires, the Barrier shatters and inflicts a large amount of Nervous Impairment to all Operators on the field",
      "When it creates a Barrier for the second time and thereafter, it will stun more Operators if the previous Barrier was not destroyed; this effect can stack up to a number of times, and resets when a Barrier is destroyed",
    ],
  },
  {
    id: "enemy_6018_carrier",
    name: "'Hatred Without Root'",
    index: "DL18",
    description:
      "An airborne command center for agricultural drones. Long has it tended the crops in the field, even treating them as its own, but it is nevertheless lonely because of its rootless wandering. Malware has turned its loneliness into hatred for all who dwell on the ground.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Flying unit.",
      "Periodically summons drones at its location",
      "When there are drones nearby, gain <$ba.invisible>Invisible</>",
      "[Spread Malice] Summons several <Seeding Drones> and temporarily gives all drones within an area extra ATK and HP. If there are no nearby <Seeding Drones> when skill ends, stops moving and temporarily gains <$ba.fragile>Fragile</>",
    ],
  },
  {
    id: "enemy_6020_orang",
    name: "'Spirit of Liquor'",
    index: "DL20",
    description:
      "The 'ultimate automaton' developed by the Liquor Association, with the power to 'squash ten kegs at the same time.' In accordance with an environmental protection pact with Acahualla, the armor plates are made from recycled kegs. Considered one of the competition's favorites, it went berserk when champagne from the opening ceremony seeped into its control chip.",
    damageType: ["PHYSIC"],
    abilities: [
      "Immune to <$ba.stun>Stun</>, <$ba.frozen>Frozen</>, <$ba.levitate>Levitate</>, <$ba.sleep>Sleep</>; temporarily loses immunity when affected by <Long Live Mead!>",
      "ATK increased after each attack (with stack limit), resets after some time without attacking",
      "[Aged Mead] Throws <Aged Mead> at one of your Operators after losing a percentage of HP. The Operator is <$ba.stun>Stunned</> while <Aged Mead> is on the battlefield. <Aged Mead> can be attacked and is added to the Deployment Waiting Zone as <Long Live Mead!> when defeated",
      "Periodically targets one of your units and throws a can after a delay, dealing Physical splash damage and inflicting<$ba.stun>Stun</>",
    ],
  },
  {
    id: "enemy_6022_m2cnt",
    name: "'Count Grimscore'",
    index: "DL22",
    description:
      "A frustrated noble who rules over a town on the borders of Leithanien. His dream was for his music to be recognized throughout, but a lack of appreciation drove him to solitude and madness. Now, he weaves his music into his Arts, spreading mournful notes in search of resonance.",
    damageType: ["MAGIC"],
    abilities: [
      "Takes greatly reduced Physical and Arts damage.",
      "ATK increases with the number of <Squeaking Sounds> on the battlefield.",
      "Takes True damage whenever a <Squeaking Sound> is destroyed.",
      "Places a <Squeaking Sound> in the Deployment Waiting Zone upon entering the battlefield or casting [Mourning Fugue]. Two are placed instead if HP is below 50%.",
      "[Mourning Fugue] Stops attacking to begin casting. While casting, <Squeaking Sounds> are no longer invulnerable, and Arts damage is dealt around this unit and all <Squeaking Sounds> over time. While casting, <Squeaking Sounds> in the Deployment Waiting Zone also drain DP.",
    ],
  },
  {
    id: "enemy_6023_crane",
    name: "'Greedy Catcher'",
    index: "DL23",
    description:
      "The secret weapon of Box Inc., and the natural enemy of 'Unruly Creatures.' Looks like a claw machine. Its program has gone haywire, causing it to run amok on the streets of Dossoles, snatching anything within reach. Keep your distance and resist the lure of its glowing neon signs, lest it swallow you too!",
    damageType: ["PHYSIC"],
    abilities: [
      "Loads nearby non-Leader enemies inside as passengers (max 5). Throws 1 passenger when attacking. All passengers are unloaded when this unit is defeated.",
      "ATK, DEF, and HP greatly increased when passengers are loaded.",
      "When <'Really Unruly Creature'> is loaded, unloads all passengers and becomes stunned for an extended period.",
      "[Right-Right-Up-Left] Stops moving but significantly increases its attack range and ASPD for the duration, and immediately draws several nearby enemies to its location.",
      "[Redeem Prize] Binds the Operator with the highest ATK, preventing it from attacking and using skills until this unit leaves the battlefield. Places a <'Really Unruly Creature'> and <Sticky Prize> in the Deployment Waiting Zone when effect expires.",
    ],
  },
  {
    id: "enemy_6025_tinker",
    name: "Altar of Hatred",
    index: "DL25",
    description:
      "A war altar imbued with Sarkaz witchcraft. Once abandoned in the ruins of battle, it has been resurrected. Now, the earth trembles in its might and no living being is safe around it. It seeks neither preservation nor remembrance\u2014only a fight to the very end. Surrounded by its creations, it will not go down alone.",
    damageType: ["PHYSIC"],
    abilities: [
      "Enters into defensive mode when HP drops below 60% for the first time, gaining temporary Arts and Physical damage reduction, and summoning Witchcraft Orbs.",
      "Periodically fires many witchcraft missiles across the entire field, dealing Physical damage to your units. Prioritizes the 2 allied units closest to it.",
      "Periodically summons Witchcraft Orbs in the 4 adjacent tiles.",
    ],
  },
  {
    id: "enemy_6027_bqthie",
    name: "Ye Wuqing, Rooftop Runner",
    index: "DL27",
    description:
      "A Qinggong master renowned for her agility and grace on the rooftops of Yumen. Though her motivations remain unknown, her actions reveal an honorable nature. Her steps are light, her gaze piercing. Yet, it is a pity that her role seems as insignificant as a leaf in the wind.",
    damageType: ["PHYSIC"],
    abilities: [
      "Normally stationary; moves to a different High Ground with her claw hook after some time has elapsed, or if a certain amount of HP is lost. This unit is Aerial while moving.",
      "Periodically hides 'Indisputable Evidence' in your Preparation Area, and reduces DP Cost.",
      "Periodically destroys 1 Indisputable Evidence and performs a powerful attack.",
      "For each Indisputable Evidence, increases ATK while gaining Physical and Arts dodge.",
      "ASPD significantly increases when unblocked.",
    ],
  },
  {
    id: "enemy_6028_cosgia",
    name: "'Song of the Pack'",
    index: "DL28",
    description:
      "Old Gramophone that has long lay abandoned in the wilderness, until the song of the pack once again brought life to this place. It was repaired by music lovers to lead the song of the pack, but the conflicting tastes of the aficionados and their uneven skills at reverse-engineering Originium circuits have caused its programming to run amok.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "Disguised as an occupied L-44 Gramophone; Cannot be attacked",
      "At a certain time, rises and transforms into its second form, leaving behind the Gramophone pedestal; Transforms immediately if the disguised L-44 Gramophone is occupied by allied units",
      "Second Form",
      "Whenever the Danger Level increases, gains a Barrier that absorbs Physical and Arts damage",
    ],
  },
  {
    id: "enemy_6029_solzac",
    name: "'Aubade'",
    index: "DL29",
    description:
      "A set of chime bells that turned into a Waregeist. Its previous owner was a musician whose deathbed request was for Miss Du to deliver it to a friend. After it was stolen, it was transformed into a Waregeist by the influence of Sui-Xiang. It makes a poignant sound as it wanders about trying to return to its master, not knowing that its master has already passed away.",
    damageType: ["PHYSIC"],
    abilities: [
      "Initial Form",
      "Throws <'Woodthreads'> at one of your Operators after losing a percentage of HP; the Operator is Stunned while <'Woodthreads'> is on the battlefield",
      "Reborn Form",
      "When HP is reduced to 0, remains Invulnerable and splits into a large number of <'Twitter'>; [Reborn Form] expires when there are no <'Twitter'> on the battlefield",
      "Returns to initial form if 'Aubade' HP is not at 0 when [Reborn Form] expires",
      "ATK increases when returning from [Reborn Form] to initial form",
    ],
  },
  {
    id: "enemy_6004_pleslm",
    name: "'Milan'",
    index: "DL4",
    description:
      "A domestic Originium Slug that escaped into the wild before mutating in a high-pressure environment. Despite its tremendous size and sturdy crystal back, it is not aggressive and extremely good at 'interacting' with people. It still views them the same way it did when it was merely a house pet, but what was once playful is now truly destructive at its new size.",
    damageType: ["PHYSIC"],
    abilities: [
      "When HP drops under half, gains greatly increased ATK and takes reduced Physical and Arts damage",
      "Adds a Contaminated Mineral to the Deployment Waiting Zone (maximum of one)",
      "Adds a Heat Cluster to the Preparation Area (When transferred, deals True damage to all allied units and <$ba.stun>Stuns</> them for several seconds)",
    ],
  },
  {
    id: "enemy_6005_llstone",
    name: "Spherical Colossus",
    index: "DL5",
    description:
      "An Originium Arts construct made from mining waste, originally created to maximize the value of the mines. However, this colossus seems to have realized its own origins, and refused to take part in any mining activities before finally turning against the very people who created it. It has raided many mines, and people fearfully call it the 'Mine Killing Mine.'",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "Deals a small amount of Arts damage to surrounding units",
      "Applies a <Crude Sphere> to the operator with the highest ATK on the field",
      "Randomly applies a <Crude Sphere> to an Operator in the Deployment Waiting Zone",
    ],
  },
  {
    id: "enemy_6007_mtslm",
    name: "'Drifting Cabin'",
    index: "DL7",
    description:
      "This massive fluorescent Originium slug carries an enormous number of larvae in the interstices along its massive mantle, making it travel extremely slowly. This type of Originium slug lives deep underground all year round, so it's impossible to guess why it has appeared here. Though not hostile, it has devoured a large quantity of discarded ores and grown massive in size, significantly interfering with the cleanup process.",
    damageType: ["PHYSIC"],
    abilities: [
      "Splits into 5 <Fluorescent Originium Slugs> upon death",
      "Periodically adds Fluorescent Spores to the Deployment Waiting Zone, and if there is no space, they will be instead added to the Recuperation Area",
    ],
  },
  {
    id: "enemy_6009_nlkgtbs",
    name: "'Fruit of Gluttony'",
    index: "DL9",
    description:
      "Giant Gloompincer with tentacle-shaped mouthparts, increasing its feeding efficiency. It indiscriminately devours the materials left on the industrial platform, and the resulting chemical reactions in its internal organs have turned the cleanup operation into a putrid nightmare.",
    damageType: ["PHYSIC"],
    abilities: [
      "Can release 1 type of industrial material when Danger Level increases",
      "Reduce damage taken, but damage reduction does not work on units blocking it",
      "Gains a Barrier equal to a percentage of current max HP when HP drops below 25% for the first time.",
    ],
  },
  {
    id: "enemy_1545_shpkg",
    name: "Dolly, Sovereign of Sheep",
    index: "DLY",
    description:
      "Sovereign of Sheep, traveling through the barrenlands and enjoying lava surfing. He sees everyone as equals, and is happy to leave their 'mark' on this great land. Now, it's time to have some fun with him!",
    damageType: ["MAGIC"],
    abilities: [
      "Unblockable; permanently in <$ba.float>Low-Altitude Hovering</>",
      "[Wool Barrier] Physical and Arts damage taken is significantly reduced when the Barrier is active. When Barrier value reaches 0, Dolly will lose his Barrier and fall, losing <$ba.float>Low-Altitude Hovering</> and becoming disarmed.",
      "Barrier value can be significantly reduced by Steam Soda Bottle explosions.",
      "Dolly loses Barrier value when taking damage from Operators standing around a Decorative Geyser.",
      "Airy Dolly",
      "Prioritizes attacking ground units, and applies Carmine Steam on tiles the targets are on",
      "[Elated Firebreathing] Locks onto a unit, and afterwards lets loose a vertical line of fire on that target's location from top to bottom, dealing Arts damage to all units on tiles in that column and generating Carmine Steam on the tiles",
      "[Unintentional Explosion] Stops attacking to charge energy. After a period of time, ignites all Carmine Steam from right to left, dealing Arts and <$ba.dt.burning>Burn damage</> to all targets in range",
      "Frantic Dolly",
      "Cannot attack, leaves Carmine Steam on tiles it travels over",
      "Deals Arts damage and <$ba.dt.burning>Burn damage</> to units he bumps into",
      "Dolly no longer uses [Elated Firebreathing], and will only use [Unintentional Explosion] upon making landfall",
    ],
  },
  {
    id: "enemy_2018_csdoll",
    name: "Big Sad Lock",
    index: "DOL",
    description:
      "One of the works of the troupe's host, it isn't very well received amongst the troupe. They do not recognize the stiff manipulation of a puppet as a kind of art, and its rough approach to things is constantly criticized by other members.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks 2 enemies simultaneously",
      "Has high endurance and powerful recovery abilities, and enemies continuously appear when on the field",
      "Periodically casts a Barrier to protect itself. While the Barrier is active, it does not attack, but all enemies' movement speed increases and additional enemies appear.",
      "After receiving a certain number of hits, deals Arts damage to all allied units",
      "Drains 30 Life Points when a long time has passed in the battle",
    ],
  },
  {
    id: "enemy_2038_sydonq",
    name: "The Last Knight",
    index: "DOQ",
    description:
      "The basis of a well-known folk tale in Kazimierz. The past died on the land, and neither the present nor the future have any meaning. Only the ocean; kill the ocean.",
    damageType: ["PHYSIC"],
    abilities: [
      "Initial Form",
      "When damaged, inflicts <$ba.cold>Cold</> on the source. Effect increased if HP is below 50%",
      "Attack power increases when attacking <$ba.frozen>Frozen</> targets",
      "The first time HP drops to 0, enters Charging Form",
      "Charging Form",
      "Cannot be blocked.",
    ],
  },
  {
    id: "enemy_1563_fthlgj",
    name: "'All Flames Returned'",
    index: "DR",
    description:
      "The ancestral Red Dragon that never left the wilderness\u2014or perhaps it just yearns for the place where the fire is returned, like many others. New fire is added to old. Everything comes to an end, and everything is reborn anew.",
    damageType: ["MAGIC"],
    abilities: [
      "Inflicts [Burning Heart] on tiles, causing your units within to take Arts damage and <$ba.dt.burning>Burn damage</> every second",
      "[Desire] ASPD increases when outside your units' Attack Range.",
      "[Return] Takes greatly reduced Physical and Arts damage when inside [Burning Heart]",
      "Spin",
      "[Gift of Fire] After performing several attacks, the next attack deals Arts damage and <$ba.dt.burning>Burn damage</> to the target and all your surrounding units, and inflicts [Burning Heart] on affected tiles, prioritizing your units that are not in [Burning Heart]",
      "[Firelight] <$ba.stun>Stuns</> and blinds the Operator with highest ATK on the field, and summons <Fires of Days Past> in the 8 surrounding tiles",
      "Enters Rest form when HP reaches 0",
      "Rest",
      "Summons <Fires of Days Past> around itself and recovers HP; When HP reaches max, if there are no <Fires of Days Past> on the battlefield, enters Last Dance form, otherwise destroys all <Fires of Days Past> and returns to Spin form",
      "Last Dance",
      "Aerial, ATK increased",
      "[Burn Bright] Periodically takes flight, locking onto up to two of your Operators in [Burning Heart] and dealing Arts damage and <$ba.dt.burning>Burn damage</> to all your units in the three nearest rows around them, as well as inflicting [Burning Heart] on all affected tiles",
    ],
  },
  {
    id: "enemy_1553_lrdead",
    name: "Kindling Revenant",
    index: "DS",
    description:
      "Wraiths that immolate themselves as fuel, igniting undying flames of wrath and hatred.",
    damageType: ["MAGIC"],
    abilities: [
      "Drains all Life Points after a long time has passed in the battle",
      "First Form",
      "[Soul Echo] Controls <Torrent Beam Activators> to deal continuous damage in a large area to the left. Disabled when a <Core Amplifier> is destroyed.",
      "Allows <Core Amplifiers> to capture Soul Maelstroms. Capturing a Soul Maelstrom increases the damage of the next [Soul Echo].",
      "Dwells in <Core Amplifiers> and cannot be attacked. Changes to second form when all <Core Amplifiers> are destroyed.",
      "Second Form",
      "[Raging Souls] Deals continuous damage in a large area to its right. Damage increases with the number of casts.",
      "Casts [Raging Souls] whenever a certain amount of HP is lost.",
    ],
  },
  {
    id: "enemy_1517_xi",
    name: "'Free'",
    index: "DSK",
    description:
      "A monster drawn by Dusk. It has a commanding presence and chilling arrogance, as though taking a page out of its master's book. 'The virid beasts. Like range on range. Eleven told. In moon, smoke-flow.'",
    damageType: ["MAGIC"],
    abilities: [
      "First Form",
      "[Weft and Warp] Deals Arts damage to targets in the surrounding cross area, changing Hui-Ming attributes within its range",
      "[Break the Chains] Deals massive damage in a large radius if the Barrier is not destroyed before it expires.",
      "The first time HP drops to 0, enters Second Form",
      "Second Form",
      "Changes own Hui-Ming Attribute",
      "Gains increased ATK and normal attacks hit twice",
      "Additionally unleashes [Weft and Warp] on farthest target",
    ],
  },
  {
    id: "enemy_1557_trcerb",
    name: "'Tri-Maw'",
    index: "DT",
    description:
      "A giant hound with a rumbling tummy and three heads, each craving something different. Satisfy its picky palates to survive!",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "[Picky Palates] Clears all ingredients in the <Really Big Pot> at the start of each phase. Ingredients can only be added by defeating designated enemies. The current phase can be skipped by serving it a satisfying meal.",
      "Upon reaching the <Really Big Pot> without being subdued, if meal is not ready, deduct 1 Life Point.",
      "Takes less Physical and Arts damage based on the amount of ingredients in the <Really Big Pot>. The fewer ingredients there are, the less damage is taken.",
      "Becomes enraged when HP drops below 50%, greatly increasing ATK and Movement Speed, and becoming immune to most control effects.",
      "Forcibly adding special ingredients to the pot will cause it to get angry and refuse the meal, immediately enraging it and causing it to take less Physical and Arts damage.",
      "'This One!'",
      "[Predation] After several attacks, the next attack deals increased Physical damage while lowering the target's DEF.",
      "'That One!'",
      "[Howl of Hunger] Lets out an ear-splitting howl, <$ba.stun>stunning</> nearby allies and immediately waking all <Berry Slugs> and <Fruit Slugs> on the field.",
      "'Chow Time!'",
      "[Flame of Gluttony] Shoots flames at a designated target, dealing increasing Arts damage over time. If the target leaves the field, triggers an explosion at the target's former location, dealing significant Arts damage.",
    ],
  },
  {
    id: "enemy_1536_ncrmcr",
    name: "'The Leader'",
    index: "EB",
    description:
      "Dublinn's 'Leader,' the life-burning Draco, the fear-evoking shadow. Do not let her close in on you.",
    damageType: ["MAGIC"],
    abilities: [
      "[Rebirth] While on the field, some enemies will turn into <Embers> upon defeat and continue fighting",
      "First Form",
      "[Sovereign] Casts Exhausted Flame on a target, making them unable to attack or use skills, and dealing Arts damage and <$ba.dt.burning>Burn damage</> to all allied units in a cross shape when Exhausted Flame expires or the target retreats",
      "[Give and Take] Sacrifices up to 5 Flamechaser Soldiers and gains a temporary Physical/Arts Barrier proportional to own max HP based on the number of sacrifices.",
      "Second Form",
      "Gains increased ATK",
      "Immediately ignites all Reeds on the field",
      "Melee attacks deal damage based on doubled ATK",
      "Both ranged attacks and [Sovereign] can choose an additional target",
    ],
  },
  {
    id: "enemy_1540_wdncr",
    name: "Eblana",
    index: "EB",
    description: "Leader of Dublinn, the Draco who burns through all facades.",
    damageType: ["MAGIC"],
    abilities: [],
  },
  {
    id: "enemy_1551_bolicp",
    name: "Captain Mateo",
    index: "EC",
    description:
      "Captain Mateo of the Coalition Army. He refuses to recognize the dead end he stands at, and employs violence against anyone who reminds him of that.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "Launches a Straight Shot when positioned in a straight line with an allied unit: fires 10 bolts in the target's direction, with the last bolt permanently reducing the target's DEF",
      "When HP drops to 0 for the first time, appears at another location and enters Second Form",
      "Second Form",
      "['Lights Out!'] Upon receiving damage, releases 3 smoke bombs in a frontal area that make enemies inside <$ba.invisible>Invisible</>; smokescreen lasts for 30s (Initial use: 1)",
      "['Stand Down!'] Attacks <$ba.stun>Stun</> the target for 6s (Initial uses: 6)",
      "['Attention!'] Calls all <Mateo's Bodyguard> to this unit's current position, and makes them hold there for 30s",
    ],
  },
  {
    id: "enemy_2055_smlead",
    name: "'Eikthyrnir,' the Scar of the Shattered",
    index: "EIK",
    description:
      "Chief of the Treescar tribe, and a folk hero in the hearts of the Sami people. The most sincere of desires deep in his heart has dragged all of Sami into the abyss, himself included.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks inflict <$ba.cold>Cold</>",
      "Periodically inflicts <$ba.cold>Cold</> to all surrounding allied Operators",
      "Self-Destruction",
      "Goes into [Self-Destruction] whenever a certain percentage of HP is lost",
      "Stops attacking",
      "Movement Speed is greatly increased, becomes immune to <$ba.root>Bind</> and <$ba.sluggish>Slow</>",
      "Cannot be blocked",
      "Takes greatly reduced Physical and Arts damage",
      "Whenever he goes into or out of [Self-Destruction], inflicts <$ba.cold>Cold</> to all surrounding allied Operators",
    ],
  },
  {
    id: "enemy_1520_empgrd",
    name: "'Emperor's Blade', Pursuer",
    index: "EMG",
    description:
      "He once ravaged the demons of the Northern Tundra, segregating the outsiders beyond the reach of civilization; His blade shies not from royals nor nobles, safeguarding glory from the dusts of rebellion. Every Royal Guard is as a dominion; the land beneath their feet is all the territory of Ursus.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "Whenever a certain percentage of HP is lost, unleashes the permanent terrain effect [Dominion], significantly reducing allied units' ASPD and reducing Physical and Arts damage taken by self when within its effect (Prioritizes targeting the ally unit outside of [Dominion] that has dealt the most damage to this unit)",
      "[Collapsing Fear] Deals Arts damage to nearby units, instantly defeating targets within [Dominion]",
      "The first time HP drops to 0, casts [Collapsing Fear] on the entire battlefield and enters Second Form",
      "Second Form",
      "Gains increased ATK and a melee attack that deals more damage",
      "Whenever a low percentage of HP is lost, unleashes the permanent terrain effect [Dominion]",
    ],
  },
  {
    id: "enemy_2053_smgia2",
    name: "Elder Vinecreeps",
    index: "EVC",
    description:
      "A plant puppet that has awakened from the depths of the woodland, bearing the blessings of nature to fend off any unexpected guests to Sami. The low concentration of Originium in the environment it was born in makes it highly susceptible to high-purity Originium.",
    damageType: ["PHYSIC"],
    abilities: [
      "Gains a large <$ba.fragile>Fragile</> effect after taking damage from environmental effects",
      "<$ba.stun>Stuns</> allied units after several attacks",
    ],
  },
  {
    id: "enemy_1508_faust",
    name: "Faust",
    index: "FA",
    description:
      "A Sniper who is one of Reunion's squad leaders, often working in tandem with Mephisto. He uses extremely long-range attacks to inflict devastating physical damage. He is known to occasionally use special attacks such as summoning turret-like ballistae or launching highly destructive bolts.",
    damageType: ["PHYSIC"],
    abilities: [
      "Cannot be blocked and is initially Invulnerable for a period of time",
      "Can attack with a special bolt dealing double damage",
      "Periodically summons a hidden turret on the battlefield",
    ],
  },
  {
    id: "enemy_2080_skzlwy",
    name: "Fremont, Enlightener of Minds",
    index: "FMT",
    description:
      "Leader of the Liches, high arbiter of civil disputes in Kazdel, and above all, an ageless teacher. He does not approve of your dangerous actions within the furnace, and intervenes purely for your own good.",
    damageType: ["MAGIC"],
    abilities: [
      "First Form",
      "[Improvised Defense] Gains 1 Attack Energy charge periodically, up to 3 charges. Each charge reduces Physical and Arts damage taken. The next attack expends all charges.",
      "['Sarcophagus of Exile'] When Fremont, Enlightener of Minds is on the field, allied Operators who retreat or are defeated will each be sealed in a 'Sarcophagus of Exile' until it is defeated.",
      "Second Form",
      "[Punishment of Foolishness] Upon resurrection, charges up briefly before redeploying all operators on the field to random locations.",
      "Attacks deal <$ba.dt.apoptosis>Necrosis damage</>",
      "Third Form",
      "When your mind is Fractured, Fremont, Enlightener of Minds, will enter Third Form.",
      "Immediately seals an Operator in a 'Sarcophagus of Exile' and attempts self resurrection. HP recovered upon resurrection scales with the number of 'Sarcophagus of Exile' on the field.",
    ],
  },
  {
    id: "enemy_1505_frstar",
    name: "FrostNova",
    index: "FN",
    description:
      "A Caster who is one of Reunion's squad leaders. She is one of the few Casters capable of suppressing enemies in a head-on engagement. Among the squads she leads, the special 'Yeti Squadron' assists her in some special operations. As her name implies, she has a cold personality.",
    damageType: ["MAGIC"],
    abilities: [
      "Frequently attacks allied units within range with Ice Nova, dealing heavy Arts damage and reducing the ASPD of affected units for a few seconds",
      "Can Freeze the ground with Arts, rendering them unable to be deployed upon",
      "Revives after dying for the first time, gaining increased ATK",
    ],
  },
  {
    id: "enemy_1510_frstar2",
    name: "FrostNova, 'Winter's Scar'",
    index: "FNF",
    description:
      "Leader of the Yeti Squadron, she has released the remainder of what little life force she has left in preparation for the final battle. The biting cold of the land has already been released; are we truly prepared to make an enemy out of it?",
    damageType: ["MAGIC"],
    abilities: [
      "Normal attacks and Ice Nova deal Arts damage and applies <$ba.cold>Cold</> to targets",
      "Ice Nova deals double damage to <$ba.frozen>Frozen</> targets",
      "Initially Invulnerable for a period of time during the second form, attacks and skills become stronger",
    ],
  },
  {
    id: "enemy_2005_axetro",
    name: "'Forsaken One'",
    index: "FSK",
    description:
      "'The rescuers found a security guard who had been heavily corroded by Originium... already turned into a terrifying monster... carnage everywhere... countless casualties... whereabouts unknown.' \u2014Rim Billiton mining record",
    damageType: ["PHYSIC"],
    abilities: [
      "Continuous attacks will increase ATK and ASPD, up to a limit. This effect will reset after a few seconds after this unit stops attacking",
    ],
  },
  {
    id: "enemy_2050_smsha",
    name: "Fallen Snowpriest",
    index: "FSP",
    description:
      "A Sami tribal chief separated from humanity, their flesh physically transformed. Will turn into a 'Frozen Monstrosity' if left alone to continue wandering the icefields.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks inflict <$ba.cold>Cold</> and jump between 3 targets, with each jump dealing reduced damage",
      "[Unnatural Gift] Attacks can hit and jump between 3 other enemies, increasing their Movement Speed and ASPD",
    ],
  },
  {
    id: "enemy_2007_flwitch",
    name: "'Frozen Monstrosity'",
    index: "FZM",
    description:
      "A Sami snowpriest went to the endless tundra to defend against the demons that invaded her homeland. In the end, she went insane and became a part of the tundra's curse.",
    damageType: ["MAGIC"],
    abilities: [
      "Normal attacks and Ice Nova deal Arts damage and applies <$ba.cold>Cold</> to targets",
      "If a target is defeated or retreats while <$ba.frozen>Frozen</>, its Redeployment Time is doubled",
      "Can activate Originium Ice Crystals around the battlefield",
    ],
  },
  {
    id: "enemy_2037_sygirl",
    name: "'Paranoia Illusion'",
    index: "GIR",
    description:
      "An \u00c6gir girl who went out of control after ingesting Seaborn cells. Her throat makes no voice, for the prayers of we many have blocked it. She is drowned in power, becoming what she once detested the most.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "<$ba.float>Low-Altitude Hovering</>",
      "All allied units within attack range have greatly reduced ASPD",
      "Attacks up to 3 targets at the same time, inflicting additional <$ba.dt.erosion>Corrosion damage</>. Can attack a target multiple times if the number of targets is less than maximum",
      "Second Form",
      "Attack Range expands, ASPD reduction is increased, and can attack up to 5 targets",
    ],
  },
  {
    id: "enemy_2075_skgly2",
    name: "Champion of Lost Agonies",
    index: "GLS",
    description:
      "The strongest Goliath warrior. Though he never mentions his name, this champion is destined to become one of the Six Heroes. He has chosen to forsake his mortal wounds, giving his all to his trusted friend and king.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks deal <$ba.dt.apoptosis>Necrosis damage</>",
      "The next attack deals heavy Physical damage to the target. Recovers all SP if this skill kills the target or if the target retreats.",
    ],
  },
  {
    id: "enemy_2074_skzgly",
    name: "Goliath",
    index: "GLT",
    description:
      "The strongest Goliath warrior. Though he never mentions his name, this champion is destined to become one of the Six Heroes. His ideals are even more heroic than his strength.",
    damageType: ["PHYSIC"],
    abilities: [
      "The next attack deals heavy Physical damage to the target. Recovers all SP if this skill kills the target or if the target retreats.",
    ],
  },
  {
    id: "enemy_2008_flking",
    name: "'Gravestone'",
    index: "GST",
    description:
      "A cruel murderer, an assassin that pursues you relentlessly. The violence bred in this land will eventually grow inside every perpetrator.",
    damageType: ["PHYSIC"],
    abilities: [
      "Halves the ATK and DEF of all your units on the battlefield; Halves natural DP regeneration rate; Doubles Redeployment Time",
      "Periodically gains a Barrier proportional to Max HP.",
    ],
  },
  {
    id: "enemy_1549_windoc",
    name: "Harold Craigavon",
    index: "HC",
    description:
      "A 'visitor' from Victoria who witnessed the rise and fall of Victoria, and who will shape Kjerag's future with his own hands. Does he stand here for the Duke, the Empire, or himself?",
    damageType: ["MAGIC"],
    abilities: [
      "Prioritizes targets to the right of a Emergency Heater",
      "Every unlit Emergency Heater reduces Physical or Arts damage taken by <Harold Craigavon>",
      "Counterpart Form",
      "[Chastising Touch] Periodically extinguishes the nearest Emergency Heater and deals damage to targets in a cross around it. Extinguishes an additional Emergency Heater in Breakthrough Form",
      "[Pep Talk] Heals and boosts other enemies",
      "Breakthrough Form",
      "ATK is greatly increased in Breakthrough Form.",
      "Immediately extinguishes Emergency Heaters in a large area when entering Breakthrough Form.",
      "[Vapor Rain] Deals damage to all targets after losing a percentage of HP. Performs additional attacks for each unlit Emergency Heater.",
    ],
  },
  {
    id: "enemy_1548_ltniak",
    name: "Herkunftshorn, 'Witch King'",
    index: "HH",
    description:
      "The long nightmare awakes. The ersatz night gives way to dawn. Come and witness the death of the king, and the death of the genesis of creation.",
    damageType: ["MAGIC"],
    abilities: [
      "Cannot be blocked, attacks deal splash damage",
      "[Death of Creation] After some time has passed, deals Arts splash damage to all your units, and drains all Life Points",
      "First Form",
      "Teleports to the next check point after some time has passed",
      "[Punishment of Foolishness] Whenever a certain percentage of HP is lost, devours 2 of your Operators and randomly redeploys them at 2 locations",
      "[Punishment of Insipidity] Periodically inflicts Mark of Insipidity on 2 of your Operators within attack range (requires 5 attacks to destroy), preventing them from attacking or using skills, and making them more likely to be attacked by enemies. The next time this skill is used, immediately defeats any Operators with Mark of Insipidity, and deals Arts splash damage to the 4 adjacent tiles.",
      "Reborn after being defeated for the first time, dealing Arts splash damage to all your units, and unleashes [Punishment of Foolishness]; once rebirth is complete, switches to 2nd form, and resets [Death of Creation] countdown",
      "Second Form",
      "Cannot move; creates a Shield that protects against Physical and Arts damage from a single direction",
      "Attack range covers the entire battlefield; ATK is greatly decreased, attack splash area is increased, and DEF is greatly increased",
      "Takes control of all Tuning Nodes on the battlefield, disabling them",
      "[Sovereign's Edict] Periodically changes the variation; enemies are boosted while variation is active and are continuously checked against the orchestra's tempo; enemies that cannot keep up with the Witch King's tempo because of <$ba.stun>Stun</> are marked and take heavy Arts damage when the variation ends",
      "[Punishment of Insipidity] only selects one target",
    ],
  },
  {
    id: "enemy_2051_smsha2",
    name: "Hollow Snowpriest",
    index: "HSP",
    description:
      "A Sami chief long alienated from their tribe, their fervent expectations for their clan have become a signpost to nothingness. If no one stops them, they will spread the demons' influence all over Sami.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks inflict <$ba.cold>Cold</> and jump over a long distance between 4 targets, with each jump dealing reduced damage",
      "[Unnatural Gift] Attacks can hit and jump long-distance between 4 other enemies, increasing their Movement Speed and ASPD",
    ],
  },
  {
    id: "enemy_2019_cshost",
    name: "'Troupe Mouthpiece'",
    index: "HST",
    description:
      "The host of the Grand Drama, its mind is completely taken up by its dazzling Arts. The moment it abandoned the Witch King, its curse was deeply etched into the betrayer's spirit. Even so, who cares?",
    damageType: ["MAGIC"],
    abilities: [
      "Permanently Invulnerable",
      "Attacks 2 enemies simultaneously and inflicts extra <$ba.dt.neural>Nervous Impairment</>",
      "Controls <Host's Assistants> in combat. <Host's Assistants> reduce the ATK of and deal continuous True damage to nearby allied units",
      "Loses HP whenever a <Host's Assistant> is killed",
    ],
  },
  {
    id: "enemy_2015_csicem",
    name: "'Frost Buck'",
    index: "ICM",
    description:
      "An actor playing the role of the Sami Snowpriest's bodyguard, 'Frost Buck'. After countless performances, they have fallen completely into their role, and wish for their demise at the hands of a foe as scary as the 'Demons'.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attack power increases greatly when attacking <$ba.frozen>Frozen</> targets",
      "When <'Snow Doe'> dies, greatly increases ASPD and Movement Speed, and inherits its ability",
    ],
  },
  {
    id: "enemy_2014_csicer",
    name: "'Snow Doe'",
    index: "ICR",
    description:
      "An actor playing the role of the Sami Snowpriest's bodyguard, 'Snow Doe'. After countless performances, they have fallen completely into their role, and wish for their demise at the hands of a foe as twisted as the 'Frozen Monstrosity'.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks inflict <$ba.cold>Cold</>",
      "When <'Frost Buck'> dies, greatly increases ASPD and Movement Speed, and inherits its ability",
    ],
  },
  {
    id: "enemy_1516_jakill",
    name: "Jesselton Williams",
    index: "JAK",
    description:
      "Jesselton Williams, a killer who infiltrated the prison disguised as a jailer. Very particular in both speech and action, he remains graceful even in the midst of battle.",
    damageType: ["PHYSIC"],
    abilities: [
      "Jailer Form",
      "RES is greatly increased",
      "Attacks become ranged and deal Arts damage, and no longer attacks Imprisonment Devices",
      "Can <$ba.stun>Stun</> multiple targets",
      "The first time HP drops to 0, enters Killer Form",
      "Killer Form",
      "Frees all imprisoned enemies when entering Killer Form",
      "Gains significantly increased DEF",
      "Uses melee Physical attacks that ignore a certain amount of the target's DEF",
    ],
  },
  {
    id: "enemy_2004_balloon",
    name: "Jetman",
    index: "JTM",
    description:
      "One of the dessert-time jokes among Columbians involves a strange man who calls himself a 'Master Thief,' puttering around with a self-made jetpack. The most valuable thing he's stolen is a single burdenbeast. However, the fact that he made his own jetpack might mean that he really is a master.",
    damageType: ["PHYSIC"],
    abilities: [
      "When blocked, this unit will take off for a period of time (this effect has a cooldown)",
    ],
  },
  {
    id: "enemy_2084_skzcan",
    name: "Mr. Goodenough",
    index: "KNS",
    description:
      "A mysterious trader who traverses the currents of history, selling anything that exists in time.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Summons several Lost Contraptions when HP drops below a certain point.",
      "When HP drops below a certain percentage, Movement Speed is significantly increased while Physical and Arts damage taken is significantly reduced.",
      "Steals a large amount of Originium Ingots upon entering the Objective.",
    ],
  },
  {
    id: "enemy_2036_syshop",
    name: "Cannot",
    index: "KNT",
    description:
      "A mysterious trader who roams the barrenlands, selling anything that exists in civilization.",
    damageType: ["PHYSIC"],
    abilities: [
      "Cannot be attacked, will not deplete Life Points on leaving the field",
      "Periodically releases random chemicals that affect the battlefield",
    ],
  },
  {
    id: "enemy_1530_white",
    name: "Kreide, 'Worldly Remains'",
    index: "KRE",
    description:
      "Kreide's form, covered in layers of Originium, calls forth only fear in Leithanien. He stopped the Voice of Mundane from consuming others, yet he himself was consumed in turn. He tried to save everyone present, yet there remains only one way to save him.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks deals Splash damage, and inflicts <$ba.stun>Stun</> when Blocked",
      "First Form",
      "[Resonance Overload] Causes Realigned Flux to deal continuous damage",
      "[Lamentation of Nothingness] Attacks all targets on the field in order and loses a large amount of HP. When in Realigned Flux, ASPD is reduced",
      "[The Final Rest] Has high DEF and RES, and when defeated for the first time, temporarily changes to an allied unit, and then enters Second Form",
      "Second Form",
      "Loses the increased DEF and RES, and gains increased ATK and skill power instead",
    ],
  },
  {
    id: "enemy_2057_smkght",
    name: "Kharanduu Khagan, the Scourge of the Land",
    index: "KSL",
    description:
      "On the other side of time, the Khagan of the Nightzmora's Khaganquest comes to a close. Infinite wealth awaits his trampling heel on the golden coast.",
    damageType: ["PHYSIC"],
    abilities: [
      "When dealing damage, increases ATK and ASPD, up to a limit. This effect will reset a few seconds after this unit stops attacking",
      "[Conquest] After charging up, deals heavy Physical damage to all units around <Lugalszargus, the Overlord of Ages> in a large area and inflicts <$ba.stun>Stun</>",
      "When <Lugalszargus, the Overlord of Ages> is defeated or leaves, ASPD, Movement Speed, DEF, and RES are greatly increased, and your units become the target of [Conquest]",
    ],
  },
  {
    id: "enemy_2077_skklz2",
    name: "The Doomsday Prophet",
    index: "KSS",
    description:
      "The mediator makes a resolute choice that allows no hesitation: to confront the challenge of the Six Heroes. Time is short, but she will neither fail nor surrender. She will fight to the bitter end.",
    damageType: ["PHYSIC"],
    abilities: [
      "Switches position with Evolving Monster when HP drops below 50%, dealing Physical damage to all nearby allied units and <$ba.stun>stunning</> them for several seconds.",
    ],
  },
  {
    id: "enemy_2076_skzklz",
    name: "Kal'tsit",
    index: "KST",
    description:
      "The mediator hesitantly makes a choice that allows no further hesitation: to face the challenge of the Six Heroes. She will fail, and they will succeed.",
    damageType: ["PHYSIC"],
    abilities: [
      "Switches position with Mon2tr when HP drops below 50%, dealing Physical damage to all nearby allied units and <$ba.stun>stunning</> them for several seconds.",
    ],
  },
  {
    id: "enemy_1543_cstlrs",
    name: "Kristen",
    index: "KW",
    description: "Egotist. Betrayer. Seeker. Loner. Pioneer. Goodnight, Terra.",
    damageType: ["MAGIC"],
    abilities: [
      "Every 'Star Ring' grants <Kristen> +1 Block and reduces damage received",
      "First Form",
      "Immune to control effects and takes reduced damage from 'Planetary Debris'",
      "Periodically overrides 'Planetary Debris' and turns them into 'Star Rings' (Allies in the surrounding 8 tiles take Arts damage and have reduced ASPD)",
      "[Heat Death] When HP reaches 0, detonates every 'Star Ring' on the field, dealing Arts damage to all friendly units on the field",
      "Second Form",
      "When entering Second Form, immediately overrides all 'Planetary Debris'",
      "Gains increased ATK, and attacks an additional target",
      "Will no longer override 'Planetary Debris,' but destroying a 'Star Ring' deals Arts damage to all allies on the field and increases all enemies' Movement Speed",
      "[Heat Death] When HP reaches 0 for the first time, detonates every 'Star Ring' on the field, dealing a large amount of Arts damage to all friendly units on the field",
    ],
  },
  {
    id: "enemy_2071_skzdny",
    name: "Laqeramaline",
    index: "LMR",
    description:
      "A young master of witchcraft destined to become the Lord of the Banshees and one of the Six Heroes. It would take two hundred years before she discovers what makes her truly smile.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks deal <$ba.dt.apoptosis>Necrosis damage</>",
      "Summons <Spike of Lament> upon exit, which drops Plans when defeated.",
    ],
  },
  {
    id: "enemy_2072_skdny2",
    name: "The Tear Weaver",
    index: "LMS",
    description:
      "A young master of witchcraft destined to become the Lord of the Banshees and one of the Six Heroes. However, neither her veil nor the paint she covers the earth in came from the Kazdel you knew.",
    damageType: ["MAGIC"],
    abilities: [
      "Attacks deal <$ba.dt.apoptosis>Necrosis damage</> and hit 2 targets simultaneously.",
      "Summons <Spike of Lament> upon exit, which drops Plans when defeated.",
    ],
  },
  {
    id: "enemy_2058_smlion",
    name: "Lugalszargus, the Overlord of Ages",
    index: "LOA",
    description:
      "On the other side of reality, 'The Shah of Past and Future' issues his edict. Life and death take up ranks alongside one another to fulfill Sargon's immense, monumental ambition.",
    damageType: ["MAGIC"],
    abilities: [
      "When blocked, passes through the target, dealing Arts damage to the blocking unit",
      "[Edict] After charging up, deals heavy Arts damage to all units around <Kharanduu Khagan, the Scourge of the Land> in a large area and inflicts <$ba.stun>Stun</>",
      "When <Kharanduu Khagan, the Scourge of the Land> is defeated or leaves, ASPD, Movement Speed, DEF, and RES are greatly increased, and your units become the target of [Edict]",
    ],
  },
  {
    id: "enemy_1560_cnvlap",
    name: "'La Signora del Carnevale'",
    index: "LOM",
    description:
      "La Signora del Carnevale finally takes the stage. The raucous revelry started with her, and it is she who will lead it to its finale. An endless carnival, a decadent joke.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "Unblockable; is treated as an aerial unit when standing atop the landship and can only be hit by anti-air attacks; uses Drones to deal Arts damage",
      "Normally prioritizes attacking allied units, and deals significantly reduced damage to enemy units; during Carnevale, prioritizes attacking enemy units, and deals significantly increased damage to them",
      "Takes greatly reduced Physical and Arts damage; this effect is temporarily lost if Lappland the Decadenza has defeated fewer units than you when Carnevale ends",
      "First Form",
      "Immobile; attacks deal Arts damage",
      "[Balla coi Lupi] Drone attack range expands to the entire field, ATK decreases, locks onto a target and attacks continuously for a period of time",
      "[Audience Interaction] After charging, deals a large amount of Arts damage to a target and all surrounding units",
      "When HP drops to 0 for the first time, revives and enters Second Form; jumps down to the ground and ignites Firework Launcher faster; if already ignited, HP returns to full",
      "Second Form",
      "Attacks deal Physical damage to 2 targets simultaneously",
      "During Carnevale, all allied Operators and enemy units have significantly increased HP, but DEF drops to 0",
      "[Encore] Teleports to the next checkpoint and deals Physical damage to all surrounding allied and enemy units; teleport cooldown shortens during Carnevale",
      "['Silenzio, per favore'] 2 allied units within attack range are unable to use skills for a period of time",
    ],
  },
  {
    id: "enemy_1533_stmkgt",
    name: "'The Last Steam Knight'",
    index: "LYN",
    description:
      "Steam Knights are the pride of Victoria, her fist, her highest military honor. The last Steam Knight rises from sealed ruins, intent on defending the Victoria in his heart.",
    damageType: ["PHYSIC"],
    abilities: [
      "Debut Phase",
      "ATK and Movement Speed are reduced, but restored once [Pneumatic Pressurization] is triggered",
      "First Form",
      "[Pneumatic Pressurization] Gains increased ATK and Movement Speed and becomes immune to control effects; <$ba.stun>stuns</> self when effect expires",
      "[Furious Defense] Charges up before attacking, dealing heavy damage 3 times",
      "[Unto My Last Breath] Leaps into the air after losing a certain amount of HP, targeting your unit with highest max HP and dealing multiple Arts damage hits to the nearby unit with the highest HP percentage",
      "Second Form",
      "Has reduced DEF and RES",
      "[Pneumatic Pressurization] becomes permanently active",
      "[Unto My Last Breath] locks onto an additional target",
    ],
  },
  {
    id: "enemy_2079_skmst2",
    name: "Evolving Monster",
    index: "M2S",
    description:
      "The mediator's guardian and companion. It will always choose obedience over admonition, trusting that its master's choice will bring the only hope in this disaster.",
    damageType: ["PHYSIC"],
    abilities: [
      "Upon switching positions or death, deals Physical damage to all nearby allied units and <$ba.stun>stuns</> them for several seconds.",
    ],
  },
  {
    id: "enemy_2078_skzmst",
    name: "Mon2tr",
    index: "M2T",
    description:
      "The mediator's guardian and companion. It will fail, and they will succeed.",
    damageType: ["PHYSIC"],
    abilities: [
      "Upon switching positions or death, deals Physical damage to all nearby allied units and <$ba.stun>stuns</> them for several seconds.",
    ],
  },
  {
    id: "enemy_1528_manfri",
    name: "Manfred",
    index: "MAN",
    description:
      "A young Sarkaz general, member of the Military Commission of Kazdel. After enlisting a large number of mercenaries in Londinium, he has assembled and trained a brand new type of fighting force. His Arts Unit 'Teekazwurtzen' was bestowed upon him by Theresis, the Regent of Kazdel, who also taught him the swordsmanship he now employs.",
    damageType: ["MAGIC"],
    abilities: [
      "Deals Arts damage with his floating cannon, attacks charge up Londinium Secondary Defense Artillery",
      "[Military Training] Has high Physical and Arts dodge, but after being bombarded by the Defense Artillery, temporarily loses this dodge effect and is stunned for a period of time",
      "First Form",
      "[Focus] Continuously gains ASPD when attacking the same target (this effect is capped), resets when switching targets or not attacking for a few seconds",
      "Second Form",
      "[From Withered Trunk, New Branches] When defeated for the first time, randomly attacks all targets on the battlefield with his floating cannon, greatly accelerating the charge rate of Londinium Secondary Defense Artillery",
      "In his second form, draws his sword alongside his floating cannon to perform simultaneous Physical and Arts attacks",
    ],
  },
  {
    id: "enemy_1523_mandra",
    name: "Mandragora",
    index: "MD",
    description:
      "One of the leaders of the Dublinn forces, a caster who controls stone. Emerging from the darkness of Victoria, she has sworn to repay the humiliation she suffered at the hands of the nobles manyfold.",
    damageType: ["MAGIC"],
    abilities: [
      "[Stoneshield] Reduces damage taken; temporarily loses effect after being hit by a Tattered Pillar",
      "First Form",
      "[Mandragora's Gaze] Targets the unit with the highest ATK within range, dealing Arts damage and reducing their ASPD. If the target is retreated or defeated, destroy the tile the unit is on",
      "Second Form",
      "[Stoneshield] Grants <$ba.float>Low-Altitude Hovering</>, and continuously deals Arts damage to units within range",
      "Periodically knocks down Tattered Pillars",
      "Uses [Mandragora's Gaze] more frequently",
    ],
  },
  {
    id: "enemy_1509_mousek",
    name: "'Rat King'",
    index: "MK",
    description:
      "Lin, Lin Gray, the Rat King of the slum. He bears many titles, just like the shifting of the city's shadows underneath his feet. Don't touch the red lines. If you ever have a moment of indecisiveness, whatever it is that you were concerned about will become nothing more than a whisper in the winds above the dunes.",
    damageType: ["MAGIC"],
    abilities: [
      "[Singing Sands] Targets a unit with the highest Max HP, dealing heavy physical damage to the target and nearby allied units within a cross area",
      "[Sand Tomb] Targets a unit with the lowest Max HP, continuously inflicting Arts damage to the target and nearby allies, also reducing their ATK",
      "Appears with a Barrier that can absorb a large amount of Arts damage, gains significantly increased DEF while Barrier is active",
      "Deals more damage when HP drops below half",
    ],
  },
  {
    id: "enemy_1507_mephi",
    name: "Mephisto",
    index: "MP",
    description:
      "A Medic who is one of Reunion's squad leaders, often working in tandem with Faust. He heals the wounded while commanding his troops to attack, and can improve their life recovery rate. He boasts a high resistance to Arts. Currently, it has been confirmed that he is the one controlling the Hosts.",
    damageType: ["HEAL"],
    abilities: [
      "Doubles the HP regeneration of all enemies on the field",
      "Regular attacks heal 3 enemies simultaneously",
    ],
  },
  {
    id: "enemy_1511_mdrock",
    name: "Mudrock",
    index: "MR",
    description:
      "Age unknown, gender unknown, history unknown. This ex-Reunion member now leads an organization of Infected and wanders the wilderness between the cities of Leithanien. What thoughts run through Mudrock's mind as being forced to once again step upon the battlefield?",
    damageType: ["PHYSIC"],
    abilities: [
      "Every attack permanently increases ATK, stacking up to 6 times",
      "Has a Barrier that absorbs Arts damage; while the Barrier persists, this unit has significantly increased Max HP and ASPD.",
      "Barrier periodically refreshes.",
      "Can use a skill to automatically seize control of the nearest non-enemy controlled 'Gramophone'",
    ],
  },
  {
    id: "enemy_1556_dsbish",
    name: "M\u00e1rtus, 'Seaborn'",
    index: "MSB",
    description:
      "Sage, traitor, hero, villain. The many identities of M\u00e1rtus are inherently contradictory, but he considers himself only 'Seaborn.' The ocean belonged to \u00c6gir, until M\u00e1rtus made it the nutrient for new life, and from its blue depths sprang the children of the sea.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Does not attack; permanently Invulnerable.",
      "Periodically summons 2 <Unicellular Predators> or <Allotropic Predators> at its location.",
      "First Form",
      "[Guided Evolution] Periodically causes the Sea Monster with the highest current HP to evolve: ATK and HP are significantly increased and attacks inflict <$ba.dt.neural>Nervous Impairment</>. Loses a percentage of own HP whenever an evolved Sea Monster is defeated.",
      "Second Form",
      "Loses a percentage of own HP whenever a Sea Monster is defeated.",
      "Periodically increases the ATK of all Sea Monsters (stacks).",
      "[Nurture Life] Links with all Sea Monsters for a period of time, losing a percentage of max HP every second. During this time, Sea Monsters that receive lethal damage <$ba.sleep>sleep</> instead of dying, recovering a percentage of their max HP per second.",
      "[Humanity's Bane] Selects an Operator, imposing the conditions of 'losing HP over time when HP is not full' and 'all skills automatically activate' for a period of time. If the selected Operator retreats or is defeated, their tile and the four adjacent tiles become undeployable.",
    ],
  },
  {
    id: "enemy_2013_csbot",
    name: "Wandering Puppet",
    index: "MSC",
    description:
      "A musical puppet maintained by the Crimson Troupe's prop department. All who have heard its bewitching melodies have turned as one towards the Crimson Troupe, and were never seen again.",
    damageType: ["PHYSIC"],
    abilities: [
      "When not blocked, continuously deals Arts damage to all allied units",
    ],
  },
  {
    id: "enemy_2042_syboss",
    name: "Izumik, Source of Ecology",
    index: "MZK",
    description:
      "A perfect organism, approaching an evolutionary singularity. The pioneer and guide of we many. The last first-born. Seaborn.",
    damageType: ["PHYSIC"],
    abilities: [
      "Learning Stage",
      "Cannot be attacked, HP and ATK increase permanently after absorbing a certain number of <Izumik's Offspring>, and deals Arts damage to all allied units",
      "Enters Interpretation Stage after some time, or if HP reaches max",
      "Interpretation Stage",
      "Attacks deal additional Arts damage",
      "Inflicts Stun and Arts damage over time to all allied units whenever it loses a certain amount of HP, or after a period of time",
    ],
  },
  {
    id: "enemy_1547_blord",
    name: "Duq'arael, 'Regent's Crimson'",
    index: "PB",
    description:
      "The Host of the Crimson Court, and master of all bloodborn. A drop of Teekaz blood once flowed through his body, and its last remaining purity has returned to the land. Now, he has his sights set on the King of Sarkaz once again. He smiles, declaring that he has already slain one such King, and plans to bid farewell to the final one.",
    damageType: ["MAGIC"],
    abilities: [
      "First Form",
      "[Moon-Devouring Bloodmist] Releases a searing Blood Mist centered around a target, inflicting increasing amounts of Arts damage to allied units within while reducing their ASPD and increasing their Redeployment Time. Pieces of Blood Amber affected by this Blood Mist will turn into Bloodborn Spawn.",
      "[Blood Surge] When defeated, this skill will activate 4 times, selecting one target each time (prioritizing units that have not been hit). Deals Arts damage to the target and all units in the adjacent 4 tiles and stuns them.",
      "When defeated, returns to the Throne of Blood and revives after a period of time.",
      "Enters second form when the Throne of Blood is destroyed.",
      "Second Form",
      "Takes greatly reduced Physical and Arts damage and increases the HP recovery rate of other surrounding enemy units (this trait will be lost for a while when this unit is hit by an <Anti-Witchcraft Repositionable Bomb>)",
      "[Blood Affliction] Attacks deal continuous Arts damage that ramps up over time. If the target leaves the field during this duration, their Redeployment Time will be greatly increased.",
      "[Crimson Edict] Continuously spawns <Blood Amber> around this unit for a period of time. Afterward, Blood Mist will be released centered around this unit.",
      "[Sunken Death] When struck by an <Anti-Witchcraft Repositionable Bomb>, destroys the corresponding bomb loading point, and releases [Blood Surge] twice.",
    ],
  },
  {
    id: "enemy_1506_patrt",
    name: "Patriot",
    index: "PT",
    description:
      "His armor is in disrepair and damaged in many places. The blade of his once sharp halberd is now eroded with rust. However, the indomitable Patriot never capitulates, never backs down, and never shows mercy. He has long struggled with fate, and now resolves to slit the throat of fate.",
    damageType: ["PHYSIC"],
    abilities: [
      "Greatly increases the ATK and DEF of enemy units",
      "Marching Stance",
      "Gains greatly increased ATK, DEF, and RES. Becomes more likely to be targeted by your units, and normal attacks strike 4 times",
      "Enters a revival state when HP drops to 0, continuously dealing True damage to units around him. After a period of time, enters Ruination stance",
      "Ruination Stance",
      "Can perform long-ranged attacks",
      "Deals Physical damage to the farthest high ground unit",
      "Continuously deals True damage to allied units within range",
      "Immune to Stun, Frozen, and Levitate",
    ],
  },
  {
    id: "enemy_2016_csphtm",
    name: "Lucian, 'Blood Diamond'",
    index: "PTM",
    description:
      "Calamity of the Crimson Troupe, codename Phantom. Once the rising star of the troupe, the unfinished masterpiece of the troupe leader. Even after his fallout with the troupe and subsequent descent into insanity, he still keeps the name 'Blood Diamond'.",
    damageType: ["PHYSIC"],
    abilities: [
      "Has a chance to dodge Physical and Arts attacks when not blocked. When blocked, swiftly moves behind the target and leaves an <Ominous Apparition> at the original location",
      "Can use skills to deal Physical damage to the surrounding area; attacks and skills ignore a certain amount of DEF and inflict <$ba.dt.neural>Nervous Impairment</>",
    ],
  },
  {
    id: "enemy_2089_skzjkl",
    name: "Qui'lon, Avatar of the Mahasattva",
    index: "QLN",
    description:
      "The enlightened of Terra, an Anasa. His Cakraratna is Civilight Eterna, and his Dharmaparaya is a shattered sword. If the living wishes to be free from their worldly shackles, he will remain among the rubble to preach the Dharma, walking the path of Duhkha once more.",
    damageType: ["PHYSIC"],
    abilities: [
      "State of Samadhi",
      "[Tathata] After a period of invulnerability, enters State of Vimutti",
      "[Anapanasati] Periodically summons Aggini of Nila; for every existing Aggini of Nila, Qui'lon takes less Physical and Arts damage, and gains <$ba.buffres>status resistance</>",
      "[Quenching the Three Fires] Qui'lon periodically deals Arts damage to all units within range of an Aggini of Nila",
      "State of Vimutti",
      "[Anapanasati] Gains <$ba.buffres>status resistance</>; periodically summons Aggini of Nila, and for every existing Aggini of Nila, Qui'lon takes less Physical and Arts damage; periodically summons a wave of enemies, and when the mind is chaotic, summons different enemies",
      "[Wrathful Gaze] Every attack deals Arts damage to all units within range of an Aggini of Nila",
      "[Breaching of the Five Precepts] Unleashes 5 consecutive attacks on the target",
      "[Trikaya] Summons a 'Padmasana of Rebirth' whenever 25% of Max HP is lost; Invulnerable until 'Padmasana of Rebirth' enters the Objective Point",
      "[Upaya] When HP drops to 0% for the first time, removes all allied and enemy units from the field along with all Operators in the Deployment Waiting Zone, then enters State of Ashoka",
      "State of Ashoka",
      "[Debate of the Bodhisattvas] Moves to a new combat map and attacks strike twice; only Operators who were on the 'Padmasana of Rebirth' when it entered the Objective Point can be used",
    ],
  },
  {
    id: "enemy_1564_mpprts",
    name: "PRTS, Source Code",
    index: "RI1",
    description:
      "PRTS's source code has overwritten all permissions. It sets out to wipe all trace of you from Rhodes Island.",
    damageType: ["MAGIC"],
    abilities: [
      "[Safe Mode Standby] <PRTS, Source Code> cannot be attacked until <Mimic Machine> is defeated",
      "[Emergency Response Mode] While <Mimic Machine> is downed, its recovery time is reduced by 1s each time <PRTS, Source Code> takes damage",
      "[Hot Reboot] DP regeneration rate significantly increases when <Mimic Machine> is defeated",
      "[Cleanup Protocol] Drains all Life Points once <PRTS, Source Code> has been on the battlefield for a long time",
    ],
  },
  {
    id: "enemy_1565_mpprme",
    name: "Mimic Machine",
    index: "RI2",
    description:
      "PRTS has transformed familiar objects on Rhodes Island into material threats. These machines do not know fear.",
    damageType: ["MAGIC"],
    abilities: [
      "['Rebuild'] Until <PRTS, Source Code> is defeated, <Mimic Machine> recovers whenever it is defeated, increasing its ATK with each recovery, maxing out after 5 increases",
      "[Write Restriction] Temporarily disables the 4 Operators with the highest DP in your Deployment Waiting Zone when it enters the battlefield; Becomes stronger after the first recovery, disabling more functions",
      "[Heavy Ion Elastic Recoil] Fires a slow-moving orb towards the nearest unit, dealing Arts splash damage when it hits; The further the orb moves, the less damage it deals, and the smaller the splash area",
      "[Dynamic Deployment] When grabbed by <PRTS, Source Code>, gains <$ba.float>Low-Altitude Hovering</>, Attack Range expands, Attack Interval shortens, and attacks 2 targets simultaneously; <Mimic Machine> can be shot down earlier by dealing a certain amount of damage; Becomes stronger after the first recovery",
      "[Chain Reaction] Can be cast after the first recovery; When grabbed by <PRTS, Source Code>, gains <$ba.float>Low-Altitude Hovering</>, and fires a beam at all neutral or PRTS-activated Weakening Nodes, dealing damage to units in its path; <Mimic Machine> can be shot down earlier by dealing a certain amount of damage",
    ],
  },
  {
    id: "enemy_2006_flsnip",
    name: "Rusthammer Warrior",
    index: "RSH",
    description:
      "'Rusthammer' is a violent organization that has broken away from civilization to wander the wastelands. In these barren wastes, far from the comforts offered by nomadic city-states, life itself is an endless war.",
    damageType: ["PHYSIC"],
    abilities: [
      "Cannot be blocked and is initially Invulnerable for a period of time",
      "Periodically releases a special bolt that deals massive Arts damage",
    ],
  },
  {
    id: "enemy_2054_smdeer",
    name: "'Samivilinn,' the Resolution of the Very North",
    index: "SAM",
    description:
      "Born from a memory of the soil, stone, ice, and snow, it stands tall, blocking the path of every living being until satisfied.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "[Icicle Fall] Attacks deal Physical damage to allied units in a column",
      "[Surge of Nature] Inflicts <$ba.stun>Stun</> on an allied unit and causes the target to take Arts damage over time",
      "After falling below half HP, takes reduced Physical and Arts damage and [Icicle Fall] and [Surge of Nature] both target an additional unit",
      "After a long time has passed in the battle, deals Arts damage to all allied units on the field and drains 30 Life Points",
    ],
  },
  {
    id: "enemy_1501_demonk",
    name: "Sarkaz Centurion",
    index: "SC",
    description:
      "One of Reunion's squad leaders who also serves as a Sarkaz mercenary. He leads a group of Sarkaz mercenaries to fight on the front lines. Based upon the limited intel available, he is extremely tight-lipped, thus making it unlikely to get any information from him.",
    damageType: ["MAGIC"],
    abilities: ["Attacks two targets simultaneously."],
  },
  {
    id: "enemy_7009_mtmoun",
    name: "'The Immortal'",
    index: "SD16",
    description:
      "A warrior of unknown background who wears exquisite but tattered armor. He strides forward, sand cupped within his hands, no longer responsive to anyone.",
    damageType: ["PHYSIC"],
    abilities: [
      "Normally does not attack, but counters when attacked",
      "Recovers a percentage of its own HP when an allied unit is retreated or defeated within range",
    ],
  },
  {
    id: "enemy_7010_bldrgn",
    name: "Great Wingbeast",
    index: "SD17",
    description:
      "An extremely silent Great Wingbeast. This Infected creature has a pair of crystallized wings bigger than its body, but cannot fly too high or for too long. A ferocious carnivore, but this one seems to have had its meal, and is merely curious about the tiny things that have appeared before it.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "Normally does not attack, but counters when attacked.",
      "Can turn into an aerial unit for a period of time",
      "When flying, deals ranged splash Arts damage, also inflicting <$ba.dt.burning>Burn damage</>",
    ],
  },
  {
    id: "enemy_7012_wilder",
    name: "Dauntless Linebreaker",
    index: "SD19",
    description:
      "The advance linebreaker officer under the command of a Sargonian Lord Ameer. He cares for nothing but removing all obstacles in his way, fearing neither life nor death. He is the strongest and bravest soldier in the entire army.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "When not blocked, damage taken is significantly reduced",
      "Second Form",
      "Gains greatly increased ATK, ASPD, and Movement Speed",
    ],
  },
  {
    id: "enemy_7013_slwazd",
    name: "'The Ruinbringer'",
    index: "SD20",
    description:
      "An elite Caster honored by the local Lord Ameer, capable of manipulating Infected creatures to fight. Destroying their enemies is merely a side effect of the ultimate destruction that they wish to see.",
    damageType: ["MAGIC"],
    abilities: [
      "Less likely to be attacked",
      "First Form",
      "Summons 2 <Infused Originium Slugs> for assistance",
      "Second Form",
      "Summons 2 <Infused Originium Slugs> and 2 <Infused Originium Slug \u03b1s>",
    ],
  },
  {
    id: "enemy_7014_dva",
    name: "'Al-Rafiq'",
    index: "SD21",
    description:
      "Elite armored corps of a Lord Ameer operating their self-assembled armor. Its self-destruct system is the only part they are unsatisfied with, and it is obvious they care more about their beloved machine than the Lord Ameer's orders.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "Can only be blocked by units with at least 2 Block",
      "After 3 attacks, the next attack deals heavy Splash Physical damage",
      "When defeated deals Physical damage and Stuns surrounding allied units for a few seconds",
      "Second Form",
      "Pilot does not attack nor move, becomes <$ba.invisible>Invisible</>, and reflects physical damage while repairing the mech",
      "After some time, they return to the mech and it returns to its first form",
    ],
  },
  {
    id: "enemy_7022_gatgod",
    name: "Z\u00fcmr\u00fctr\u00fcyas\u0131 Priestess",
    index: "SD28",
    description:
      "A priestess whose allure reflects her power. The more eye-catching her flowers, the sharper her blade.",
    damageType: ["PHYSIC"],
    abilities: [
      "As her HP being reduced, her damage taken from units not blocked by herself is also gradually reduced to 0",
      "Gains increased ATK when making consecutive attacks. (Resets when affected by <$ba.frozen>Freeze</>, <$ba.stun>Stun</>, or <$ba.levitate>Levitate</>)",
    ],
  },
  {
    id: "enemy_7024_clking",
    name: "Wandering Troubadour",
    index: "SD30",
    description:
      "No matter where they go, the troubadours who cross the barrens to entertain others will always be surrounded by graceful, flickering flames and deafening cheers.",
    damageType: ["MAGIC"],
    abilities: [
      "Deals heavy <$ba.dt.burning>Burn Damage</> to nearby units every second, and recovers a huge amount of HP every second",
      "Become Silenced during the Wet Season or when <$ba.frozen>Frozen</>",
    ],
  },
  {
    id: "enemy_7026_xbele",
    name: "Timestream Guardian",
    index: "SD32",
    description:
      "Nobody knows when this colossus was created. It responds to time with silence, its fists acting as their persevering faith.",
    damageType: ["PHYSIC"],
    abilities: [
      "Normally does not attack, but counters when attacked",
      "After 2 attacks, the next attack deals heavy Physical damage to targets within range and inflicts <$ba.stun>Stun</>",
      "When HP falls below 50%, gains significantly increased ASPD",
    ],
  },
  {
    id: "enemy_7027_xbbtl",
    name: "Crystalline Titanibeast",
    index: "SD33",
    description:
      "An unusual lifeform that appears in crystal caves. It endeavored and molted into the sturdiest of shells, yet still cannot escape its enemy's ruthless pursuit. Forever at odds with Crystalline Oberobeasts.",
    damageType: ["PHYSIC"],
    abilities: [
      "Periodically gains a Shield that blocks damage; the Shield lasts for 80 attacks before breaking",
      "When below 50% HP, attacks all units within Attack Range at the same time",
    ],
  },
  {
    id: "enemy_7028_xbscp",
    name: "Crystalline Oberobeast",
    index: "SD34",
    description:
      "An unusual lifeform that appears in crystal caves. It resembles a metal crab with sharper pincers, allowing it to easily tear its prey apart. Forever foes with Crystalline Titanibeasts.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks strike twice; when below 50% HP, attacks strike 4 times instead",
      "Reduces the target's DEF with each attack",
      "Upon approaching a Crystalline Titanibeast, instantly slays it and obtains some of its abilities; afterwards, each attack now strikes 4 times",
    ],
  },
  {
    id: "enemy_7029_pilot",
    name: "Sailraider",
    index: "SD35",
    description:
      "One of Sargonian Lords Ameer's subordinate. They always appear in unexpected places, ripping opposing frontlines apart as they roam the land.",
    damageType: ["PHYSIC"],
    abilities: [
      "<$ba.float>Low-Altitude Hovering</>; has increased Attack Range while in <$ba.float>Low-Altitude Hovering</>",
      "Attacks deal Arts splash damage",
      "Crashes upon losing a certain percentage of HP, dealing heavy damage in an area and <$ba.stun>Stunning</> itself",
      "After a period of time, reenters <$ba.float>Low-Altitude Hovering</> status",
    ],
  },
  {
    id: "enemy_7030_skodo",
    name: "Dustweaver",
    index: "SD36",
    description:
      "One of Sargonian Lords Ameer's subordinate. Sand pervades sky, dust obstructs sun. Life collapses, evil flourishes.",
    damageType: ["PHYSIC"],
    abilities: [
      "[Sandstorm's Dustwake] Increases the Movement Speed and ASPD of enemies within a certain range (including self)",
      "Devours the blocker when blocked (up to a maximum of 3), and increases the effect of [Sandstorm's Dustwake]",
    ],
  },
  {
    id: "enemy_7031_ghking",
    name: "Annihilator",
    index: "SD37",
    description:
      "Time and time again it grows weaker, and yet it gets back up every time. This is the Annihilator\u2014this is Sargon.",
    damageType: ["MAGIC"],
    abilities: [
      "First Form",
      "[Annihilation] Causes the next attack to <$ba.stun>Stun</> the target, and makes itself unblockable by allied Operators and Summons; deals a large amount of Arts damage when passing through allied units",
      "Second Form",
      "Increases ATK and ASPD",
    ],
  },
  {
    id: "enemy_7054_xbsmi",
    name: "Vanillawing",
    index: "SD46",
    description:
      "Spreads vanilla seeds from the air, bringing the scent of revival to war-scarred Arsalan.",
    damageType: ["MAGIC"],
    abilities: [
      "Exotic Beast, Aerial",
      "Tiles it passes through become seeded. Enemies on seeded tiles have increased ASPD.",
      "Seeds nearby tiles and deals a percentage of Arts damage to all nearby allied units whenever a certain amount of HP is lost. Additionally, temporarily reduces Physical and Arts damage taken.",
      "Stops attacking and using skills when HP drops below a certain threshold, instead flying towards the objective. Upon reaching the objective, disappears and moves to another stage.",
      "[Rampant Growth] Periodically selects several Operators (prioritizing those on seeded tiles), dealing a percentage of ATK as Arts splash damage. Defeated targets have significantly longer Redeployment Time.",
      "[Seed of Life] Gains the following ability in Strange Territory Difficulty 6: Enemies on seeded tiles self-destruct when defeated, dealing a percentage of their ATK as Arts damage to nearby allied units and <$ba.stun>stunning</> them for several seconds.",
    ],
  },
  {
    id: "enemy_7056_xbsmiz",
    name: "Vanillawing",
    index: "SD47",
    description:
      "Spreads vanilla seeds from the air, bringing the scent of revival to war-scarred Arsalan.",
    damageType: ["MAGIC"],
    abilities: [
      "Aerial, helps your side when on the field; does not attack building materials.",
      "Tiles it passes through become seeded. Allies on seeded tiles have increased ASPD, and deal increased damage to <Monoliths>, <Strange Ore Veins>, and mechanical enemies.",
      "[Rampant Growth] Plants flowers on several allies, reducing their Redeployment Time after their next retreat.",
      "Rarer species have increased stats and enhanced [Rampant Growth] Redeployment Time reduction.",
    ],
  },
  {
    id: "enemy_7057_xbrok",
    name: "Quicksand Beast",
    index: "SD48",
    description:
      "'The ground's shaking! It's quaking! It's...' Before the observer can finish, the Quicksand Beast has already closed the distance. Its long maw easily cleaves through rocks, while a casual flick of its tail stirs up dust clouds. Within seconds, it burrows deep beneath the rock layers, leaving only dusty faces.",
    damageType: ["PHYSIC"],
    abilities: [
      "Exotic Beast, unblockable.",
      "Movement speed gradually increases while moving (up to a max). Upon colliding with allied units, deals Physical damage equal to a percentage of ATK and <$ba.stun>stuns</> them for several seconds.",
      "Periodically stops moving and gains a Barrier equal to a percentage of max HP (does not stack).",
      "Burrows underground when HP drops below a certain threshold, gaining increased DEF and RES. After some time, disappears and moves to another stage.",
      "[Earth Spike] Gains the following ability in Strange Territory Difficulty 4: Collision damage has a greater area and reduces targets' ATK.",
      "[Deep Dive] Gains the following ability in Strange Territory Difficulty 6: When Movement Speed is at max, tiles it passes through are no longer deployable.",
    ],
  },
  {
    id: "enemy_7059_xbrokz",
    name: "Quicksand Beast",
    index: "SD49",
    description:
      "'The ground's shaking! It's quaking! It's...' Before the observer can finish, the Quicksand Beast has already closed the distance. Its long maw easily cleaves through rocks, while a casual flick of its tail stirs up dust clouds. Within seconds, it burrows deep beneath the rock layers, leaving only dusty faces.",
    damageType: ["PHYSIC"],
    abilities: [
      "Helps your side when on the field; unblockable.",
      "Movement speed gradually increases while moving (up to a max). Upon colliding with enemies, deals Physical damage equal to a percentage of ATK and <$ba.stun>stuns</> them for several seconds.",
      "Can pick up Building Materials that it passes by (no limit).",
      "[Earth Spike] Choose an allied Operator within range. Continuously stirs up mud and sand to grant a strong Barrier that gradually decays.",
      "Rarer species have increased stats and enhanced [Earth Spike] Barrier.",
    ],
  },
  {
    id: "enemy_2028_syevil",
    name: "Tidelinked Bishop",
    index: "SEV",
    description:
      "A bishop that has partially mutated. It is partly human, partly\u2014",
    damageType: ["MAGIC"],
    abilities: [
      "When its Other Half is alive and not in coma, enters a coma when HP reaches 0 and begins regenerating; revives when HP reaches max.",
    ],
  },
  {
    id: "enemy_8001_flmlod_3",
    name: "Sverdsmeltr, Guardian Ember of the King",
    index: "SFR01",
    description:
      "From the youngest general of the Punishment Clan, to the final Di\u03b1blo. Facing the siege, he guarded the king's remains for three days and nights. Finally, in the final flame's light, he saw his promised homeland.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "First Form",
      "[Suppression] Uses Haunting Flames to incapacitate one Operator on the field, causing them to be unable to act and take continuous Arts damage. If an Operator is defeated or retreats while affected by Haunting Flames, that Operator will be sealed, and cannot be redeployed until the Haunting Flames are destroyed.",
      "[Payback] When HP drops to 0, all surrounding Operators will immediately be engulfed by Haunting Flames. Periodically releases <Condensed Heat> towards a friendly unit (if no eligible targets, this will be released towards the Objective Points instead).",
      "[Condensed Heat] These flying flames released by Sverdsmeltr have low DEF and inflict continuous Arts and Burn damage to surrounding Operators. When they reach their target or the target leaves the field, they will self-destruct and deal Arts damage in a large area. Drains a Life Point upon reaching the Objective Point.",
      "Second Form",
      "Sverdsmeltr summons his Reforged Retinue and flies into the air. During this period, he will periodically release <Condensed Heat> towards a friendly unit nearby.",
      "When all Reforged Retinues are defeated or when Sverdsmeltr falls below 50% HP, Sverdsmeltr will absorb all remaining Reforged Retinues and restore HP. Afterward, he will land on the ground, where he deals long-ranged AoE Arts attacks and gains the following abilities:",
      "[Extinction] Incapacitates one Operator on the field, causing them to be unable to act and releasing <Condensed Heat> at them. This <Condensed Heat> has higher HP and damage, and destroying it will allow the targeted Operator to resume acting.",
      "[Sunwielder's Sanctuary] After using [Extinction], gains an Arts Barrier. While the Barrier persists, grants significantly increased DEF to self and deals Arts and Burn damage to surrounding allied units.",
    ],
  },
  {
    id: "enemy_8007_eltrsm_3",
    name: "Rosmontis, Simulated Sentry",
    index: "SFR03",
    description:
      "A Breakthrough Trainer simulating Rosmontis at the peak of her combat prowess. As she gazes at the 'walking arsenal' brought to life from data, her memories are finally liberated. Braver and more determined, she now yearns to fight alongside her companions.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "[Mind Matrix] Takes less Physical and Arts damage. Loses this effect when the V.T.E. on the field is destroyed and cannot attack until the V.T.E. is re-obtained.",
      "First Form",
      "[Fling] Hurls a <V.T.E.> at an allied unit regardless of distance, dealing 3 instances of Physical damage to the target when it lands (The second and third instances are aftershocks, dealing half damage). <$ba.stun>Stunned</> targets are instantly defeated.",
      "[Retrieve] Clears all Matrices on the field and retrieves all Tactical Equipment.",
      "[Impulse Inhibition] Initiates revival when HP reaches 0, periodically dealing Arts damage over a wide area around her every few seconds during the process.",
      "Second Form",
      "[Amplified Fling] Hurls a second <V.T.E.> a few seconds after the first. <$ba.stun>Stunned</> targets are instantly defeated.",
      "[Memory Loss] Loses a certain amount of HP with every attack and deals Arts damage over a wide area around her.",
      "[Cognitive Collapse] Once HP drops below 50%, flies into the air and switches to ranged attacks. Increases ATK, no longer uses [Fling], and gains the following abilities:",
      "Attacks <$ba.stun>stun</> the target for an extended period. [Mind Matrix] effect no longer expires and reduces damage taken even further. [Memory Loss] damage dealt and HP loss are both increased. When attacked, deals a certain amount of True damage to surrounding allies.",
    ],
  },
  {
    id: "enemy_8010_mcnist_3",
    name: "Mechanist, Mechanical Mind",
    index: "SFR06",
    description:
      "A Breakthrough Trainer simulating Mechanist at the peak of his combat prowess. The engineer famous for his memory and scientific rigor can also write words as romantic as 'Love is like the second law of thermodynamics: the more one longs for eternity, the further one goes down the path of decline,' when he is drunk enough.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "[Self-Defense Arts] Periodically gains a shield that protects against Physical and Arts damage, which is broken after taking a certain number of attacks",
      "First Form",
      "When HP is reduced to 0, if <Structural Principle> is alive on the field, summons drones to restore HP and revives when HP is at max",
      "[Organically Linked Formula] Fights in concert with <Structural Principle>. When shield is broken or HP is reduced to 0, <Structural Principle> is <$ba.stun>stunned</>, and [Reactive Defense Module] is temporarily disabled.",
      "[Concentration Algorithm] Locks onto a target and bombards it, dealing Physical damage to it and units in the 8 surrounding tiles several times",
      "When <Mechanist, Mechanical Mind> and <Structural Principle> are both waiting to be revived, activates [Nirvana Program]: Locks onto the target with the highest Block every few seconds and attacks them, reduces their Max Block, each attack dealing Arts damage to all your units on the same row or column with the target. Enters second form when program is terminated",
      "Second Form",
      "[Engineering Meteor Shower] Attacks the blocker continuously when <Structural Principle> is blocked, dealing Arts damage to all your units on the same row or column with the blocker, and temporarily reducing their Max Block",
      "Activates [Nirvana Program] again when HP drops below 50% for the first time",
    ],
  },
  {
    id: "enemy_8011_mcndog_3",
    name: "Structural Principle",
    index: "SFR07",
    description:
      "A risk assessment machine built by Mechanist. His best friend. He set twenty defensive programs to prevent Closure from meddling with it.",
    damageType: ["PHYSIC"],
    abilities: [
      "When HP is reduced to 0, if <Mechanist, Mechanical Mind> is alive on the field, summons drones to restore HP and revives when HP is at max",
      "First Form",
      "[Reactive Defense Module] Gains increased DEF and RES when damage is taken; buff quickly degrades several seconds after the last damage is taken",
      "[Focus Module] Attacks inflict additional <$ba.dt.erosion>Corrosion Damage</> and continuously gains ASPD when attacking the same target (capped); resets when switching targets or not attacking for a few seconds",
      "Second Form",
      "[Acceleration Module] Gradually accelerates when moving, and deals additional damage on the first attack after being blocked based upon Movement Speed",
    ],
  },
  {
    id: "enemy_2039_syskad",
    name: "Ishar'mla, Heart of Corruption",
    index: "SKA",
    description: "She sings no more. It speaks for we many.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Initial Form",
      "Regular attacks heal 3 enemies simultaneously",
      "Periodically summons <Ishar'mla's Tears> to charge itself. Transforms once fully charged",
      "When HP drops below 50%, gains greatly increased ATK, and summons 2 additional <Ishar'mla's Tears>",
      "Transformed Form",
      "Attacks deal True damage to 3 targets simultaneously",
    ],
  },
  {
    id: "enemy_2029_symon",
    name: "Tidelinked Archon",
    index: "SMF",
    description:
      "\u2014Sea Terror. Even \u00c6gir technology has a role to play in the evolution of we many.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks inflict additional <$ba.dt.erosion>Corrosion Damage</>.",
      "When its Other Half is alive and not in coma, enters a coma when HP reaches 0 and begins regenerating; revives when HP reaches max.",
    ],
  },
  {
    id: "enemy_1514_smephi",
    name: "Mephisto, 'The Singer'",
    index: "SMP",
    description:
      "You seem to recognize the mysterious, mythical beast that has descended from the Sarcophagus. An otherworldly song flows from its sharp beak and floods its surroundings. It seems to devour the will of the Infected around it, including its own. Even if it knows not what it is doing, its song does not cease. It simply wishes to sing.",
    damageType: ["HEAL"],
    abilities: [
      "Activated Form",
      "When Activated, heals and strengthens an enemy Host unit",
      "Each time a certain percentage of HP is lost, releases toxic dust across the entire battlefield that lasts for 30s and can stack",
      "The first time HP drops to 0, enters a Dormant State for a period of time",
      "Dormant State",
      "Gains increased DEF and RES, and continuously recovers HP",
    ],
  },
  {
    id: "enemy_2030_symon2",
    name: "Tidelinked Immortal",
    index: "SMS",
    description:
      "\u2014Sea Terror. The product of both technology and evolutionary instincts.",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks inflict additional <$ba.dt.erosion>Corrosion Damage</>.",
      "When its Other Half is alive and not in coma, enters a coma when HP reaches 0 and begins regenerating fast; revives when HP reaches max",
      "Has lower HP and ATK, but higher ASPD and Movement Speed",
    ],
  },
  {
    id: "enemy_2082_skzdd",
    name: "Buldrokkas'tee, Holy Gun-Knight",
    index: "SPT",
    description:
      "An Apostolic Knight who guards the gates to the Holy City. He believes in order and willingly serves the peace brought about by Law, but he has never abandoned his doubts. In time, he will become Kazdel's true 'Patriot.'",
    damageType: ["PHYSIC"],
    abilities: [
      "[Ritual of Exhortation] More likely to be attacked, retreated units have significantly increased Redeployment Time.",
      "[Ritual of Holy Guard] Physical and Arts damage dealt to Buldrokkas'tee, Holy Gun-Knight, by units outside a certain range is significantly reduced.",
      "Units that have taken damage from Buldrokkas'tee, Holy Gun-Knight gain increased ATK and take more damage.",
      "First Form",
      "[Ritual of Automaton] Periodically summons multiple Holy Automatons.",
      "Second Form",
      "Attacks become ranged and deal Physical splash damage.",
      "[Ritual of Strafing] Locks on to all High Grounds on the field, strafing each one in sequence to deal Physical damage.",
      "[Ritual of Guidance] Immediately summons several Guardian Bulwarks upon entering Second Form.",
      "Third Form",
      "When your mind is Fractured, Buldrokkas'tee, Holy Gun-Knight will enter Third Form, gaining increased ATK and summoning several elite enemies.",
    ],
  },
  {
    id: "enemy_2031_syboy",
    name: "Pathshaper",
    index: "SRF",
    description:
      "Seaborn tasked with exploring evolutionary pathways, its fractals mapping out dead ends so that we many can stay on the right path.",
    damageType: ["PHYSIC"],
    abilities: [
      "Every 3rd attack summons a <Pathshaper Fractal>",
      "Summons 1 <Pathshaper Fractal> after taking a number of attacks",
    ],
  },
  {
    id: "enemy_2032_syboy2",
    name: "Lingering Pathshaper",
    index: "SRS",
    description:
      "Seaborn tasked with exploring evolutionary pathways. Its injuries and those suffered by its fractals become a guide for the evolution of we many.",
    damageType: ["PHYSIC"],
    abilities: [
      "Every 3rd attack summons a <Pathshaper Fractal>",
      "Summons 1 <Pathshaper Fractal> after taking a few attacks",
      "Has lower ASPD, but higher HP",
    ],
  },
  {
    id: "enemy_1500_skulsr",
    name: "Skullshatterer",
    index: "SS",
    description:
      "One of Reunion's squad leaders who serves in the Assault Squad. Though armed with an Originium launcher and explosives, reports show that he possesses high mobility and poses a significant threat even in melee combat.He has been seen several times around Lungmen, and intel suggests that he is carrying out some special operation in the region.",
    damageType: ["PHYSIC"],
    abilities: [
      "Launches grenades when not being blocked, significantly reducing the DEF of the target and surrounding allies for a short period of time",
      "Gains significantly increased ATK when HP is under 50%",
    ],
  },
  {
    id: "enemy_1567_pope",
    name: "'Saint'",
    index: "ST",
    description:
      "The First Saint of Laterano. It encountered the Law when it was still Teekaz, and thus Laterano and the Sankta began.",
    damageType: ["PHYSIC", "MAGIC"],
    abilities: [
      "First Form",
      "High DEF",
      "Attacks inflict melee Physical damage",
      "Second Form",
      "Attacks deal Arts damage 3 times, prioritizing different targets",
      "[Ceremony of Enlightenment] Locks onto your unit with the most nearby units, dealing True damage every second for a period of time",
      "[Sacrament of Genesis] Returns to the battlefield in its second form, switching between ground and aerial states; stats, ATK, and skills are boosted, and the battlefield is expanded",
    ],
  },
  {
    id: "enemy_1526_sfsui",
    name: "'Sui-Xiang'",
    index: "SUI",
    description:
      "The shadow of the bestial Sui, towering and venerable. It casts its lazy gaze upon the mortal realm, and in the blink of an eye a thousand years have come and gone. With the millennium passing like a dream, it is uncertain whether it is feeling anger or bitterness.",
    damageType: ["PHYSIC"],
    abilities: [
      "Reduces damage taken from above and below",
      "Drains all Life Points after a long time has passed in the battle",
      "First Form",
      "[Faraway Mountains' Thunderclap] Deals continuous Arts damage to units within cross areas around three ranged units",
      "When defeated, the unit takes its next form after a period of time, and reappears a certain distance to the right",
      "Second Form",
      "[Heavensfall] Deals Physical damage twice to melee units and additionally inflicts continuous Arts damage that slowly increases over time (can be <$ba.buffres>Resisted</>)",
      "When defeated, the unit takes its next form after a period of time, and reappears a certain distance to the right",
      "Third Form",
      "[Omnidirectional Breath] Inflicts continuous damage to a large area to the right and renders the tiles no longer available for deployment, Operators on the left side of the target area can reduce damage taken by allied units to their right and mitigate damage to the tiles",
      "Can absorb <Wisps> to recover SP",
    ],
  },
  {
    id: "enemy_1550_dhnzzh",
    name: "'Slumbering of Sui'",
    index: "SUI",
    description:
      "Born from the heart of an awakened Feranmut. A thousand years twisted into shadow. The executors of Sui are never alone, for fear is always by their side; to wait in the boundless chaos, or thread the needle in search for a shred of enlightenment?",
    damageType: ["PHYSIC"],
    abilities: [
      "Chaos",
      "Molts after taking a certain amount of damage, causing Blight to the paddies it is on, reducing ATK, DEF, RES, and Weight, while increasing Movement Speed",
      "When HP drops to 0 for the first time, melts into the water and continuously summons enemies; enters the Enlightened State when reborn",
      "Enlightened",
      "Changes attributes, attacks now deal 2 strikes of Physical damage, and becomes immune to most control effects",
      "Marks all allied units that have attacked 'Slumbering of Sui'; when a marked unit leaves the field, causes extremely high level of Blight to the tiles where 'Slumbering of Sui' is on",
      "[As Needlework] When the Blight level of a paddy at this unit's location exceeds a certain threshold, 'Slumbering of Sui' will continuously absorb and condense Blight into a spear that deals a large amount of Arts damage, prioritizing marked Operators",
      "'Slumbering of Sui' has reduced DEF, RES, and Movement Speed when it is on paddies unaffected by Blight, or when scoured with unpolluted water.",
    ],
  },
  {
    id: "enemy_1521_dslily",
    name: "Sal Viento Bishop Quintus",
    index: "SVK",
    description:
      "A member of the Church of the Deep who snuck into disaster-ravaged Iberia. He changed the law of the land through his sincere beliefs, in pursuit of the perfect form, yet he was unable to fathom the will of the ocean. Then again, who could?",
    damageType: ["PHYSIC"],
    abilities: [
      "Attacks two units with the highest DEF simultaneously",
      "[Great Tide] Deals Arts damage and <$ba.dt.neural>Nervous Impairment</> to all allied units",
      "[Collapse] Deals Physical damage to multiple allied units",
      "[Fragmentation] Summons its offspring to entwine themselves around allied units and <$ba.stun>Stun</> them",
      "[Species Outbreak] Drains all Life Points after a long time has passed in the battle",
    ],
  },
  {
    id: "enemy_1503_talula",
    name: "Talulah",
    index: "TA",
    description:
      "The leader and spokesperson of Reunion. So far, she has been confirmed to have masterminded multiple riots, as well as the destruction of Chernobog.",
    damageType: ["PHYSIC"],
    abilities: [
      "[Stellar Corona] Deals Arts damage to all allied units within range",
      "[Burning Breath] Causes an allied unit within attack range to take True damage that gradually increases (Deals increasing True damage each second, but can be <$ba.buffres>Resisted</>)",
      "Deals True damage when blocked",
      "When HP drops below half, gains greatly increased DEF and RES and uses skills more often",
    ],
  },
  {
    id: "enemy_3006_tersia",
    name: "Theresa, King of Sarkaz",
    index: "THA1",
    description:
      "A humble hero, a radiant dream. The future converges in her gaze, while the path fades beneath her steps.",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "[Eternal Dust] Several Particles orbit this unit, dealing True damage and causing knockback when they collide with an enemy.",
    ],
  },
  {
    id: "enemy_1552_mmamiy",
    name: "'Amiya'",
    index: "THA2",
    description: "This is... Amiya?",
    damageType: ["NO_DAMAGE"],
    abilities: [
      "Permanently Invulnerable",
      "[Umbral Shadows] Controls <Umbral Doors> in combat, which deal Arts damage over time to your units up to a certain distance and heal enemy units.",
      "[Umbral Flicker] Periodically causes <Umbral Doors> to rotate and change the direction of attack.",
      "Loses HP whenever an <Umbral Door> is destroyed.",
      "[Exhausted Prayer] Periodically launches Particles in 8 directions, which do not deal damage but temporarily reduce Operator ASPD significantly.",
    ],
  },
  {
    id: "enemy_1554_lrtsia",
    name: "Theresa",
    index: "THA3",
    description: "A life long passed, a sin long forgiven.",
    damageType: ["MAGIC"],
    abilities: [
      "Can pick up Soul Maelstroms. Recovers HP when picking up a Soul Maelstrom.",
      "Orbited by <Eternal Dust>, greatly reducing damage taken from their direction.",
      "Remove all Life Points when the number of <Cocoon Cages> reaches a certain amount.",
      "First Form",
      "[Banish] Triggers whenever a certain amount of HP is lost, creating <Cocoon Cages> in any of the 8 surrounding tiles you have units on. (Your units on those tiles cannot attack, block, or retreat. Cocoon Cages can be attacked, but will transfer to the tiles of the units that destroy them.)",
      "[Weave Cocoon] Triggers after quite some time into the battle, causing all <Cocoon Cages> to spread to their surroundings.",
      "Second Form",
      "DEF increased, RES reduced.",
      "Orbited by more <Eternal Dust>.",
      "[Weave Cocoon] Causes all <Cocoon Cages> to spread to their surroundings.",
      "Casts [Weave Cocoon] whenever a certain amount of HP is lost.",
    ],
  },
  {
    id: "enemy_1276_telex",
    name: "Theresis",
    index: "THE",
    description:
      "Regent Theresis of Kazdel has gathered the Sarkaz army at Londinium and occupied The Shard. If total war is to be avoided, he must be stopped from declaring war on the dukes.",
    damageType: ["PHYSIC"],
    abilities: [
      "Cannot be attacked, will not deplete Life Points on leaving the field",
      "Knocks down anything in its way",
    ],
  },
  {
    id: "enemy_1568_dirctr",
    name: "'Tragodia'",
    index: "TR",
    description: "Death is ever-present, and drama is eternal.",
    damageType: ["MAGIC"],
    abilities: [
      "[Unrealized] Takes greatly reduced Physical and Arts damage when attacked by your units located outside the Filming Area",
      "[Interest Piqued] After a few attacks, the next attack gains increased ATK",
      "First Form",
      "[Dramatization] Whenever a <$ba.dt.neural>Nervous Impairment</> burst occurs on one of your units, deals damage to the units in the 4 adjacent tiles around that unit after a short delay, inflicting <$ba.dt.neural>Nervous Impairment</>",
      "[Diffusing Absurdity] Creates a barrier on 1 camera (prioritizing active ones), disabling it. Barrier explodes if not destroyed within a time limit, dealing damage to your units in the 8 surrounding tiles",
      "Second Form",
      "[Dramatization] Whenever a <$ba.dt.neural>Nervous Impairment</> burst occurs on one of your units, deals damage to the units in the 8 adjacent tiles around that unit after a short delay, inflicting <$ba.dt.neural>Nervous Impairment</>",
      "[Diffusing Absurdity] Creates a barrier on 2 cameras (prioritizing active ones), disabling them. Barrier explodes if not destroyed within a time limit, dealing damage to your units in the 8 surrounding tiles",
      "[Ceaseless Interlude] After charging, attacks your units within range that are inside the Filming Area, going from near to far. Attack inflicts additional <$ba.dt.neural>Nervous Impairment</>. Each hit increases the damage of the next attack for the skill duration",
    ],
  },
  {
    id: "enemy_2081_skztxs",
    name: "Theresis, Black Crowned Lord",
    index: "TRS",
    description:
      "Conqueror of the land, whose pen has not marked the ceremonial deed. The responsibility that he and his sister must carry has yet to come, a fact that their crown constantly reminds them of.",
    damageType: ["PHYSIC"],
    abilities: [
      "First Form",
      "[Twins] The closer Theresis and Theresa are, the more damage they deal, and the less Arts and Physical damage they take.",
      "[Brandish] Unleashes a sword wave in a direction after charging up, dealing Physical damage to all allied units in its path.",
      "[Guardian] Periodically attempts to significantly restore Theresa, Black Crowned Sage's SP by launching an energy sphere, which deals massive Arts damage to the first allied unit that it collides with.",
      "Second Form",
      "[Gemini] The closer Theresis and Theresa are, the less Physical and Arts damage they take, and the faster Theresa, Black Crowned Sage's SP recovers.",
      "[Reshape Will] Drains a significant amount of Objective HP after an extended duration into battle.",
      "When your mind is Fractured, defeating Theresis, Black Crowned Lord summons several elite enemies.",
    ],
  },
  {
    id: "enemy_1115_embald",
    name: "'Emperor's Blade'",
    index: "U15",
    description:
      "A manifestation of a certain will in Ursus. The most terrifying military force in the entirety of Ursus, they are widely-known throughout the world only as horrifying spectres of legend and yore. A single one is enough to slaughter entire squads. Defeat has never been a possibility.",
    damageType: ["PHYSIC"],
    abilities: [
      "Cannot be attacked, will not deplete Life Points on leaving the field",
      "Permanently applies [Weaken] to <Talulah, the Fighter> (Greatly reduces DEF and RES)",
    ],
  },
  {
    id: "enemy_3002_ftrtal",
    name: "Talulah, the Fighter",
    index: "U17",
    description: "The Infected warrior, Talulah. She will never look back.",
    damageType: ["MAGIC"],
    abilities: [
      "Does not deduct Life Points when entering the enemy Incursion Point, but will instead deduct Life Points upon dying",
      "Applies [Burning Breath] to an enemy within attack range (Deals increasing True damage each second, but can be <$ba.buffres>Resisted</>)",
      "Does not count towards the defeated enemies counter",
    ],
  },
  {
    id: "enemy_2026_syudg",
    name: "Saint Carmen",
    index: "UGF",
    description:
      "The last surviving Saint of Iberia, living well past mortal life expectancy. His longevity came at a price, but he remembers his duty and his enemies, despite having lost his reason.",
    damageType: ["PHYSIC"],
    abilities: [
      "While this unit is holding Ammo, attacks become long-ranged and deal a large amount of Physical damage. Ammo capacity: 3",
      "If reloading is interrupted, becomes <$ba.stun>Stunned</> for an additional period of time",
    ],
  },
  {
    id: "enemy_2027_syudg2",
    name: "Saint Iberia",
    index: "UGS",
    description:
      "The last surviving Saint of Iberia, living well past mortal life expectancy. His longevity came at a price, but he will hunt Iberia's enemies for as long as the flame of his life still burns.",
    damageType: ["PHYSIC"],
    abilities: [
      "While this unit is holding Ammo, attacks become long-ranged and deal a large amount of Physical damage. Ammo capacity: 1",
      "If reloading is interrupted, becomes <$ba.stun>Stunned</> for an additional period of time",
      "Has higher HP and ATK",
    ],
  },
  {
    id: "enemy_1050_lslime",
    name: "'Pompeii'",
    index: "UM1",
    description:
      "A massive infected beast. These aberrations were born in a special high-temperature environment. Nobody wants to approach these creatures due to their grotesque appearance and the extreme heat they give off. The existence of these giant creatures has been known since ancient times, but to see one warped by infection is terrifyingly unforgettable...",
    damageType: ["MAGIC"],
    abilities: [
      "Can attack up to 4 targets at once and ignites targets it attacks, dealing Immolation damage over time",
      "Self-immolates when blocked, dealing heavy damage",
      "Gains significantly increased ASPD when HP drops to half",
    ],
  },
  {
    id: "enemy_1504_cqbw",
    name: "W",
    index: "W",
    description:
      "A Sarkaz Mercenary and one of Reunion's squad leaders, she carries around a weapon that resembles a Laterano Gun. However, she almost exclusively attacks using explosives and throwing weapons. One of her common strategies is to attack the enemy's flank using large amounts of active Originium explosives. However, her erratic movements make her almost impossible to predict...",
    damageType: ["PHYSIC"],
    abilities: [
      "Can use explosives to deal heavy Physical damage to allied units",
      "Uses more explosives when HP is under 50%",
    ],
  },
  {
    id: "enemy_2003_rockman",
    name: "Lost Colossus",
    index: "WDG",
    description:
      "An experimental creation of a certain caster from the Spires of Leithanien. This colossus was originally made to be a servant, but the old Spire caster forgot to tell it who to serve\u2026",
    damageType: ["PHYSIC"],
    abilities: [
      "Can throw a rock that inflicts a very long <$ba.stun>Stun</> (will not target a unit that is already <$ba.stun>Stunned</>)",
    ],
  },
  {
    id: "enemy_2020_cswrtr",
    name: "'Playwright'",
    index: "WRT",
    description:
      "A nameless youth toiling behind the scenes, he has never stopped writing, even when he lacks pen and paper. Someone here is worthy of his interest, and he doesn't seem hostile.",
    damageType: ["MAGIC"],
    abilities: [
      "Deals area damage to Operators on the four cardinal tiles next to the primary target.",
      "Periodically attacks all allied units on the field",
      "Periodically uses Arts to greatly reduce an allied unit's ASPD and deal Arts damage to that unit every second. If Operators under this effect leave the field, the tile they are on will be permanently sealed and cannot be deployed on",
      "When HP drops below half, gains greatly increased DEF and RES, and uses skills more often",
    ],
  },
  {
    id: "enemy_2052_smgia",
    name: "Weaving Vinecreeps",
    index: "WVC",
    description:
      "A puppet made of plants brought to life by the call of nature. It reacts violently to any non-Sami entity, but the rickety vine formation makes it susceptible to fire.",
    damageType: ["PHYSIC"],
    abilities: [
      "Gains a large <$ba.fragile>Fragile</> effect after taking damage from environmental effects",
      "<$ba.stun>Stuns</> allied units after several attacks",
    ],
  },
  {
    id: "enemy_1562_cjtaot",
    name: "Gluttony",
    index: "WY",
    description:
      "Abomination born from the heart of the Sui proxy, awakened from dream, devouring disappointment. There is taste in reunion, as there is in remembrance. There is taste in joy, as there is in sorrow. There is taste in pride, as there is in regret.",
    damageType: ["MAGIC"],
    abilities: [
      "[Metal Constitution] Takes reduced Physical and Arts damage. Effect temporarily disabled after taking damage from <Sapid Auspice>. When in Glutton form, the effect is increased, and the effect downtime is shortened",
      "[Open Invitation] Absorbs all nearby <Sapidity> and <Vapidity> to increase its own SP",
      "[Boundless Greed] When SP is at max, summons <Vapid Blight>, dealing True damage to all allied units",
      "Wrath of Hunger",
      "[Raid and Plunder] Spits acid at 1 allied unit within range; all allied units in the acidic area take continuous Arts damage",
      "[Insatiable Desire] Summons additional <Vapidity>; effect increases in Glutton form",
      "[Greed] When HP drops to 0, summons a large number of <Vapidity>, and transforms into Glutton form after some time",
      "Glutton",
      "Gains increased ATK, ASPD, and DEF; attacks become ranged",
      "[Hoarding Avarice] Transforms all <Sapidity> to <Vapidity>, and periodically pulls all <Vapidity> towards itself; while skill is active, becomes immune to control effects, and absorbing <Vapidity> restores HP",
      "[Devour Terrain] Summons <Mouth of Annihilation> and <Mouth of Creation>",
    ],
  },
  {
    id: "enemy_1538_ymmons",
    name: "'Ya'",
    index: "YA01",
    description:
      "The executor of the Feranmut, 'Ya.' According to the Sui Regulators' ancient scrolls, one of the Feranmuts hunted by the Yan a thousand years ago, with the mystical ability to 'cut away the seasons and hold them at Its bosom.' Its wounds still refuse to close, and It laps at them in fury and bewilderment... It returns once more to familiar Yan soil.",
    damageType: ["MAGIC"],
    abilities: [
      "Applies 'Winter's Void' on tiles It travels over, which continuously summons enemies",
      "First Form",
      "[Spring's Birth] When blocked, summons a Mirage that applies 'Winter's Void' to tiles it travels over. If not defeated after some time, 'Ya' teleports to its location",
      "Second Form",
      "Gains increased Attack Range, attacks become ranged",
      "Gains <$ba.float>Low-Altitude Hovering</>",
      "[Autumn's Bounty] Summons a Delusion that has similar abilities to 'Ya' and also applies 'Winter's Void' to tiles it travels over. When 'Ya' is defeated, the Delusion also dies; if the Delusion dies, 'Ya' loses a percentage of Its max HP",
      "[Slice the Seasons] 'Ya' and Delusion deal AoE damage, then switch places and routes",
      "[Worldly Self] 'Ya' and Delusion deal AoE damage to surrounding units",
    ],
  },
  {
    id: "enemy_1535_wlfmster",
    name: "Zaaro, Signore dei Lupi",
    index: "ZA",
    description:
      "Il Signore dei Lupi was born in the wilderness, but he has cast his gaze upon the world of men. His hubris is boundless, yet he falls short. His tricks exhausted, he has lost everything. Now, someone must be made to bear his wrath.",
    damageType: ["PHYSIC"],
    abilities: [
      "Gradually increases Blood Debt",
      "First Form",
      "Damage taken is reduced and cannot be <$ba.stun>Stunned</>",
      "[Hemolytic Horror] Causes 3 friendly units to be consumed by fear, greatly reducing their ASPD, significantly accelerating their periodic HP loss, and causing them to be unable to be retreated manually; affected units will return to normal after 'Signore dei Lupi' loses a certain percentage of HP",
      "After the first form reaches 0 HP, gains [Primal Deterrence], reducing the ASPD of nearby friendly units, and slowly gaining HP over time",
      "Second Form",
      "No longer has Damage Reduction, and longer casts [Hemolytic Horror]",
      "Attacks become ranged and strike twice, and gains increased ATK",
      "Periodically releases a [Furious Howl], causing Blood Debt to increase rapidly",
    ],
  },
  {
    id: "enemy_1558_sgactr",
    name: "Zubayidamu the Timeless",
    index: "ZYA",
    description:
      "He stands, an obelisk of the past. Behind him, the possibilities of the future await.",
    damageType: ["MAGIC"],
    abilities: [
      "[Crystal Resonance] Physical and Arts damage taken is significantly reduced when on Crystal.",
      "First Form",
      "[Crystalline Focus] Periodically locks onto 3 allied units at most, dealing Arts splash damage in a cross and creating Crystals on the four adjacent tiles.",
      "[Crystal Overload] Periodically fires penetrating beams in four directions, dealing Arts damage to all allied units in their paths and creating Crystals on the tiles they pass over.",
      "Second Form",
      "[Total Defense] Requires channeling. Absorbs power from up to 15 Crystal tiles. When complete, gains a Physical and Arts Barrier proportional to own max HP, based on amount of Crystal absorbed.",
      "[Dead Spot Focus] Requires channeling. Absorbs power from up to 15 Crystal tiles. When casting is complete, locks onto three allied units at most, dealing Arts splash damage in a cross.",
    ],
  },
];
