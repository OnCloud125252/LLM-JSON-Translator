export const SAMPLE_DATA_C = {
  worldName: "Eldoria",
  creationYear: 2025,
  active: true,
  cosmology: {
    planes: [
      {
        name: "Material Realm",
        type: "primary",
        habitable: true,
        description:
          "The Material Realm of Eldoria is a vast continent surrounded by unexplored oceans. Unlike most fantasy worlds, Eldoria exhibits unusual physical properties where certain laws of nature fluctuate based on lunar cycles and ley line convergences. The skies of Eldoria feature three moons – Lunara, Celeste, and Umbra – each exerting different magical influences on the world below. The ancient scholars theorize that Eldoria itself might be sentient in some incomprehensible way, as geographical features have been known to subtly shift over generations, with mountain passes appearing where none existed before, rivers occasionally flowing upstream for brief periods, and forests that seem to relocate when no one is watching them directly. The most peculiar phenomenon occurs during the Concordance, a rare astronomical event when all three moons align, causing temporary suspensions of certain natural laws throughout the realm. During these periods, which last approximately three days, the boundaries between thought and reality become permeable, sometimes allowing pure ideas to manifest physically. The last Concordance occurred 127 years ago, resulting in the creation of the Whispering Spires, a mountain range that appeared overnight and is said to echo fragments of thoughts from all who have ever lived in Eldoria.",
        primaryElements: ["Earth", "Water", "Fire", "Air", "Aether"],
        timeFlow: 1.0,
      },
      {
        name: "Fae Wyld",
        type: "parallel",
        habitable: true,
        description:
          "The Fae Wyld exists as a shimmering reflection of the Material Realm, visible only through peripheral vision or to those with fae ancestry. Within the Wyld, colors possess tastes, music manifests as visible patterns in the air, and emotions can crystallize into physical objects if felt intensely enough. Time flows unpredictably here—a visitor might experience what feels like hours only to return and find years have passed in the Material Realm, or vice versa. The geography loosely corresponds to Eldoria's Material Realm but twisted into impossible configurations; waterfalls might flow upward, forests could grow beneath lakes, and buildings sometimes rearrange their interiors when no one is looking. Every natural object in the Fae Wyld possesses some degree of sentience, though their concept of existence bears little resemblance to mortal understanding. The most dangerous aspect of the Fae Wyld is its tendency to reshape visitors according to their innermost nature—the longer one stays, the more one's physical form begins to reflect their true self, for better or worse.",
        primaryElements: ["Dream", "Chaos", "Memory", "Desire"],
        timeFlow: null,
      },
      {
        name: "Void Between",
        type: "transitive",
        habitable: false,
        description:
          "The Void Between defies conventional description, as it exists as an absence rather than a presence. Those rare individuals who have glimpsed it and retained their sanity describe it not as a physical space but as the conceptual gap separating defined realities. Within the Void, conventional physics cease to apply; distance becomes meaningless, as two points can be simultaneously infinitely apart and occupying the same space. Matter entering the Void doesn't disintegrate but rather becomes untethered from its defining properties, potentially reforming as something entirely different upon exit. The Void is neither dark nor light but somehow both and neither simultaneously. The most disturbing aspect, according to scholars who study planar cosmology, is that the Void appears to be expanding, very gradually eroding the boundaries between established planes. Ancient texts refer to entities that supposedly dwell within the Void—beings of pure conceptual existence that perceive the multiverse as humans might perceive a simple drawing.",
        primaryElements: ["Entropy", "Possibility"],
        timeFlow: -1,
      },
    ],
    origin: {
      creationMyth:
        "Before the Beginning, there was only the Primordial Dream—a sea of pure potential without form or constraint. Within this endless possibility, consciousness arose, though whether it was one mind or many remains unknown. This awareness began to contemplate structure, and in that contemplation, distinction first emerged. As concepts separated from one another, reality crystallized like frost patterns across still water. The first distinction created Light and Dark; the second formed Matter and Void; the third established Time and Space. Each successive distinction added complexity and definition to what would become Eldoria. Yet the creation was imperfect. In the final moment of world-forming, a discord arose within the creating consciousness—some say due to doubt, others claim it was intentional—and this disharmony introduced entropy and change into what would have been an eternal, static perfection. This 'Fortunate Flaw,' as it came to be known, ensured that Eldoria would forever remain dynamic, unpredictable, and capable of generating novelty beyond even what its creator(s) had envisioned. The moons formed from tears shed at the beauty and tragedy of imperfection, and from the first creative uncertainty came Free Will, the final and most consequential gift to all beings of consciousness.",
      cosmicAge: 15287,
      creatorDeities: [
        {
          name: "Nyx",
          domain: "Primordial Night",
          status: "dormant",
          manifestations: 3,
          worshippers: 1242,
        },
        {
          name: "Helios",
          domain: "Cosmic Light",
          status: "active",
          manifestations: 28,
          worshippers: 240350,
        },
        {
          name: "Chronos",
          domain: "Eternal Time",
          status: "disputed",
          manifestations: null,
          worshippers: 0,
        },
      ],
    },
  },
  magicSystem: {
    name: "The Resonant Harmony",
    fundamentalProperty:
      "All magic in Eldoria stems from the manipulation of cosmic frequencies that underlie reality itself. Practitioners don't 'cast spells' in the traditional sense but rather learn to attune their consciousness to specific resonant patterns that can then be amplified, dampened, or modulated to produce effects in the physical world. The most basic magical education begins with teaching students to perceive these otherwise invisible frequencies through meditation and sensory exercises.",
    limitations: [
      "Conservation of Resonance: Magic cannot create or destroy resonant energy, only transform it",
      "Harmonic Interference: Multiple magical effects in proximity can create unpredictable resonance patterns",
      "Dissonance Backlash: Failed magical attempts create dissonant frequencies that can harm the practitioner",
      "Attunement Limitation: Most individuals can only attune to a limited spectrum of frequencies",
    ],
    disciplines: {
      Harmonics: {
        description:
          "Harmonics is considered the purest form of resonance manipulation, focusing on creating perfect mathematical relationships between frequencies to produce specific, controlled effects. Harmonic practitioners are recognizable by the tuning forks, singing bowls, and other acoustically precise instruments they carry. Advanced harmonicists can create effects that seem miraculous to observers—walking on water by matching their body's resonance to its surface tension, passing through solid walls by finding the counter-resonance that temporarily nullifies molecular cohesion, or healing injuries by restoring the body's natural frequency patterns disrupted by trauma. The most powerful harmonic techniques involve multiple practitioners working in concert to create complex, interwoven frequency patterns that would be impossible for a single individual to maintain. The Grand Harmony of Aethrelion, recorded in historical texts, describes seven master harmonicists who worked together to temporarily suspend gravity throughout an entire city, allowing its citizens to evacuate by simply floating away from an incoming tsunami. Despite its precision and power, Harmonics requires extensive mathematical calculation and preparation, making it less suitable for spontaneous applications compared to other disciplines.",
        difficulty: 9.7,
        books: [
          "Principles of Resonant Mathematics",
          "The Harmonicist's Handbook",
          "Frequency Mapping for Beginners",
        ],
        notable_practitioners: [
          {
            name: "Maestro Cadenza",
            specialization: "Medical Harmonics",
            achievement:
              "Developed resonant therapy for treating previously incurable neurological conditions by realigning dissonant brain wave patterns. Her techniques have successfully treated over three thousand patients who were considered beyond conventional help. The most remarkable case involved restoring full cognitive function to a person who had been catatonic for seventeen years following a traumatic magical accident. Maestro Cadenza's work combines elements of traditional harmonics with innovative approaches to neural resonance mapping, allowing her to create personalized frequency treatments for each patient's unique brain structure and condition. After forty years of practice and research, she recently established the Academy of Therapeutic Resonance, where she trains a select group of apprentices in her methods. Despite numerous offers from wealthy patrons and royal courts across Eldoria, Cadenza maintains that her treatments should be available to all, regardless of social standing or financial means. Her principled stance has made her something of a controversial figure among the traditional arcane establishment, who typically guard their most powerful techniques as closely held secrets.",
            years_practicing: 47,
            alive: true,
          },
        ],
      },
      Discordance: {
        description:
          "Where Harmonics seeks perfect mathematical precision, Discordance embraces chaos and dissonance as tools for magical effect. Discordants learn to create and control unstable frequency patterns that disrupt, destroy, or transform existing resonances in unpredictable ways. This discipline emerged during the Mage Wars as a countermeasure to Harmonic defenses, but has since developed into a sophisticated magical approach in its own right. Discordance practitioners often appear disheveled or chaotic in appearance, with many embracing asymmetrical clothing, jarring color combinations, or even intentionally mismatched equipment. The power of Discordance lies in its unpredictability and adaptability; while a Harmonicist might spend hours calculating precise frequency adjustments to bypass a magical barrier, a skilled Discordant could simply introduce a chaotic element that causes the entire resonant structure to collapse. The destructive potential of Discordance has led to significant restrictions on its teaching and practice in most civilized regions, though proponents argue that chaos is as natural and necessary to reality as order. In recent decades, a movement called 'Balanced Discordance' has emerged, focusing on controlled applications of discordant principles for constructive purposes, such as breaking down pollutants in water supplies or disrupting disease resonances without harming the patient.",
        difficulty: 7.2,
        books: [
          "Chaos Frequencies: A Practical Guide",
          "Discordant Patterns in Nature",
          "The Art of Controlled Disruption",
        ],
        notable_practitioners: [
          {
            name: "Vex Dissonaria",
            specialization: "Battlefield Discordance",
            achievement:
              "During the Siege of Crystalholm, single-handedly collapsed a Harmonic shield maintained by seventeen court mages by introducing a self-propagating dissonance pattern that exploited a minor mathematical error in their calculations. The error—a fractional imprecision in the eighteenth decimal place—would have been inconsequential under normal magical practice, but Vex's technique magnified it exponentially until the entire complex spell structure unraveled catastrophically. While no lives were lost in the shield's collapse, the resulting resonant backlash temporarily nullified all magical energies within a three-mile radius, an effect that persisted for almost seven months. This incident led to the establishment of the Harmonic Precision Protocols now used by all major magical institutions, which require multiple independent verifications of spell calculations before any large-scale working. Vex themselves disappeared shortly after the siege and is rumored to be living under an assumed identity, possibly researching even more potent applications of their disruptive techniques.",
            years_practicing: 23,
            alive: null,
          },
        ],
      },
    },
    magical_creatures: [
      {
        species: "Resonance Sprites",
        sentience: 0.4,
        habitat: ["Ley Line Intersections", "Crystal Formations"],
        description:
          "Resonance Sprites are not truly creatures in the biological sense, but rather semi-autonomous manifestations of frequency patterns that have achieved a primitive form of self-sustainability. Typically appearing as small, luminous distortions in the air that cast prismatic light reflections, Sprites are drawn to areas of active magical practice. They appear to 'feed' on excess resonant energy released during spellcasting, though some researchers suggest this relationship is more symbiotic than parasitic—the Sprites may actually help stabilize magical workings by absorbing potentially disruptive overflow energies. Their lifespan is unpredictable; some dissipate after mere hours while others have been documented persisting for decades. Particularly old Sprites can develop more complex behaviors, occasionally mimicking sounds or simple patterns they've been exposed to repeatedly. The most ancient specimens, rare though they are, have demonstrated rudimentary problem-solving abilities and even apparent emotional responses to familiar practitioners. Despite extensive study, it remains unclear whether Resonance Sprites represent an unintended consequence of magical practice or if they are somehow fundamental to the workings of Eldoria's magical ecosystem. Some theoretical harmonicists propose that Sprites may actually be 'immune cells' of reality itself, emerging naturally to maintain the health of the world's resonant structures.",
        danger_level: 1,
        magical_properties: {
          essence_value: 0,
          harvestable_components: [],
          magical_affinity: ["Wild Magic", "Transmutation"],
        },
      },
      {
        species: "Dissonance Wurm",
        sentience: 0.7,
        habitat: ["Magical Wastelands", "Abandoned Ritual Sites"],
        description:
          "Dissonance Wurms emerge in areas where catastrophic magical accidents or improper spellcraft have left lasting resonant damage to the fabric of reality. These serpentine entities, ranging from the size of a small dog to specimens larger than sea serpents, physically embody the principle of disharmony. Their bodies appear to be composed of solidified discordance—a visual paradox that strains the observer's perception, simultaneously appearing to be multiple incompatible colors and textures. Witnesses report that looking directly at a Wurm for too long causes headaches, nausea, and in extreme cases, temporary synesthesia where sensory inputs become crossed. The most disturbing aspect of Dissonance Wurms is their feeding behavior; they consume harmonious resonance patterns, leaving behind areas of increased magical instability. A region that has hosted a Wurm population for several years typically becomes uninhabitable to most living creatures, as the background dissonance disrupts biological processes at a fundamental level. Plants grow in impossible configurations, animals develop mutations or bizarre behaviors, and long-term human residents experience progressive psychological effects ranging from mild perceptual distortions to complete dissociation from reality. Despite their destructive nature, Dissonance Wurms perform an essential ecological function by preventing damaged magical areas from spreading or worsening. Like fire burns through a forest to prevent disease from spreading, Wurms contain and gradually neutralize areas of dangerous magical contamination, though their cure is often considered as problematic as the disease itself. The Arcane Ecology Conservation Society maintains special teams trained to relocate problematic Wurm populations to designated containment zones where they can fulfill their ecological niche without threatening populated areas.",
        danger_level: 8,
        magical_properties: {
          essence_value: 350,
          harvestable_components: [
            "Paradox Scales",
            "Dissonant Heart",
            "Reality-Warping Venom",
          ],
          magical_affinity: ["Chaos Magic", "Necromancy", "Void Manipulation"],
        },
      },
    ],
  },
  regions: [
    {
      name: "Crystalline Archipelago",
      geography: "Island Chain",
      climate: {
        average_temperature: 24.5,
        precipitation: "Moderate",
        notable_features:
          "Rain that crystallizes upon impact with any surface, forming temporary geometric structures that melt back into water within hours. During the summer solstice, the phenomenon intensifies, sometimes creating entire crystalline landscapes that persist for days before dissolving.",
      },
      history:
        "The Crystalline Archipelago emerged from the ocean approximately 1,300 years ago following a convergence of deep underwater ley lines that triggered massive geological activity. Initially uninhabited due to its constantly shifting geography, the island chain remained a maritime legend until the explorer Cassandra Tidewalker successfully mapped its patterns of change, discovering that the islands followed a predictable cycle of submergence and emergence tied to specific stellar configurations. This breakthrough allowed for the establishment of the first permanent settlement, Tidewatch Harbor, which was constructed using specially designed floating foundations that could adapt to the islands' movements. Over centuries, the archipelago's inhabitants developed unique architectural and agricultural practices designed to work with rather than against the dynamic nature of their home. The native population developed distinct cultural practices centered around the concept of impermanence, with art forms that intentionally incorporated elements of change and dissolution. Their philosophical tradition, known as Flux Wisdom, emphasizes adaptation over resistance and has influenced thought throughout Eldoria. In recent centuries, the archipelago has become renowned for its College of Temporal Harmonics, which attracts scholars interested in studying the unusual temporal anomalies that occasionally manifest in the region, particularly during periods when multiple islands are simultaneously in their emergence phase.",
      population: 47823,
      major_settlements: [
        {
          name: "Tidewatch Harbor",
          population: 12639,
          notable_buildings: [
            {
              name: "The Adapting Cathedral",
              function: "Religious Center",
              architecture:
                "The cathedral represents the pinnacle of adaptive architecture, constructed from specially cultivated living coral and crystal that grows and reshapes itself in response to tidal and lunar influences. The building appears dramatically different depending on when it is viewed; during low tide, it extends upward in soaring spires that can reach heights of over three hundred feet, while at high tide, it compresses and widens, developing intricate external chambers that become accessible only when submerged. The interior space is in constant flux, with corridors that appear and disappear, rooms that expand or contract, and stained glass windows that rearrange their components to depict different religious scenes based on the time of day, season, and specific holy days. Despite its seemingly chaotic nature, the cathedral follows complex mathematical patterns that the priesthood has studied for generations, allowing them to predict its configurations and plan religious ceremonies that incorporate the building's transformations as literal manifestations of their spiritual beliefs about life's constant evolution. The cathedral serves not only as a place of worship but also as a living calendar and astronomical calculator, its various forms precisely tracking celestial movements and marking important dates in the local calendar.",
              age: 342,
              magical_properties: true,
            },
          ],
          government: "Council of Tides",
          economy: [
            "Crystal Harvesting",
            "Temporal Tourism",
            "Adaptive Architecture",
          ],
        },
      ],
      resources: {
        abundant: ["Chronocrystals", "Flux Coral", "Pattern Algae"],
        scarce: ["Stable Land", "Fresh Water", "Building Stone"],
        unique: {
          name: "Synchronicity Sand",
          description:
            "Found only on the northernmost islands of the archipelago, Synchronicity Sand appears ordinary except during specific lunar alignments, when each grain temporarily connects to a corresponding grain elsewhere in the world. Items partially buried in the sand during these alignments can transport matter or information across vast distances if their paired sand location has been properly prepared. The Archipelago's governing Council strictly regulates harvesting and distribution, as uncontrolled use has resulted in several historical incidents of accidental mass teleportation with catastrophic consequences.",
          value: "Priceless",
          controlled_substance: true,
        },
      },
    },
  ],
  historical_events: [
    {
      name: "The Resonance Cascade",
      date: {
        year: 14729,
        season: "Late Autumn",
        cosmic_alignment: "Triple Moon Eclipse",
      },
      participants: [
        "Harmonic Order",
        "Cult of Eternal Discord",
        "Civilian Population of New Thalassia",
      ],
      description:
        "The Resonance Cascade began as an attempted harmonic ritual of unprecedented scale, designed by the combined efforts of seventy-three master harmonicists to stabilize the increasingly erratic weather patterns affecting the coastal city of New Thalassia. For three years prior, the region had suffered progressively worsening storms that defied both natural explanation and magical resolution, later discovered to be the result of subtle sabotage by the then-unknown Cult of Eternal Discord. On the night of the ritual, as the three moons of Eldoria moved into perfect eclipse alignment for the first time in 827 years, the harmonicists arranged themselves at precisely calculated positions throughout the city and began generating a complex resonance pattern designed to ripple outward and restore natural harmony to the surrounding area. Unknown to the participants, cultists had infiltrated their ranks and introduced subtle discordant elements to the ritual components. When the harmonic pattern reached its culmination point, instead of stabilizing as intended, it entered a self-reinforcing feedback loop of escalating power. Witnesses described the air itself becoming visible as resonant patterns manifested physically, buildings vibrating at increasing frequencies, and impossible colors spreading across the sky. Despite desperate attempts by the ritual leaders to abort the working, the cascade had become self-sustaining. In the final moments before catastrophe, Master Harmonicist Elara Truetone reportedly achieved perfect attunement with the cascade itself, briefly gaining control of its full power. Historical accounts claim she used this momentary connection to redirect the cascading energies away from the city's population and into herself, sacrificing her physical form to save thousands. The cascade collapsed, but not before permanently altering the metaphysical properties of the region. To this day, the area once occupied by New Thalassia exists in a state of fluctuating reality, where physical laws operate unpredictably and time flows at inconsistent rates. Despite the dangers, the Resonant Sanctuary established at the site has become an important research center for scholars studying the fundamental properties of magic itself.",
      consequences: [
        "Creation of the Reality Storm Perimeter",
        "Establishment of the Harmonic Review Council",
        "Development of Resonant Dampening Techniques",
      ],
      historical_significance: 9.8,
    },
  ],
  artifacts: {
    major: [
      {
        name: "The Axiom Harp",
        creator: "Unknown; predates recorded history",
        current_location: "Sealed Vault beneath the Grand Conservatory",
        description:
          "The Axiom Harp defies conventional analysis, appearing simultaneously as a musical instrument, a mathematical calculation device, and a cosmological model. Its physical form shifts slightly depending on the viewer's perspective and their understanding of harmonic principles—musicians see an elaborate stringed instrument with impossible string configurations, mathematicians perceive an analog computation device of extraordinary complexity, and philosophers observe a three-dimensional representation of reality's underlying structure. The Harp consists of ninety-three strings made of an unidentifiable metal that maintains perfect tension regardless of environmental conditions. Each string corresponds to what resonance theorists call a 'fundamental axiom'—a basic principle upon which some aspect of reality is constructed. When played correctly (a feat accomplished by only seventeen individuals in recorded history), the Harp can temporarily modify the properties of reality within its area of influence by adjusting these fundamental axioms. The effects range from localized suspension of specific physical laws to the creation of small, temporary pocket dimensions operating under alternative rule sets. The most troubling feature of the Axiom Harp is that comprehensive examination reveals 108 string positions, suggesting that fifteen strings are currently missing or inactive. Theoretical harmonicists speculate that a complete Harp might be capable of rewriting the fundamental properties of Eldoria itself. The instrument is kept under constant guard, with access restricted to specially trained scholars who undergo extensive psychological evaluation and magical binding before being permitted to study it. Even these precautions were implemented only after an incident three centuries ago, when a prodigy named Verin Stringfellow successfully played a previously undocumented sequence that temporarily inverted the flow of time throughout the Grand Conservatory, causing several researchers to age backwards to the point of pre-birth nonexistence before the effect could be countered.",
        powers: [
          "Reality Modification",
          "Axiom Adjustment",
          "Dimensional Manipulation",
        ],
        danger_level: 10,
      },
    ],
    minor: [
      {
        name: "Resonant Tuning Forks",
        creator: "Various Artisans",
        current_location: "Widely Distributed",
        description:
          "These specialized tools serve as the fundamental instruments of harmonicists throughout Eldoria. Unlike ordinary tuning forks, Resonant Forks are calibrated to frequencies that correspond to specific magical effects rather than musical notes. Each fork must be crafted from metal alloys with precise compositional ratios and undergoes extensive attunement processes during which master harmonicists imprint specific frequency patterns into the molecular structure of the metal itself. A standard practitioner's set includes thirteen forks representing the fundamental frequencies, though specialized applications may require expanded sets of up to forty-nine forks for particularly complex workings. When struck and held appropriately, a Resonant Fork produces not only an audible tone but also an invisible wave of magical resonance that can interact with the underlying frequency patterns of reality. Beginning students typically start with simple applications such as using a properly tuned fork to detect hidden magical auras, temporarily stabilize small objects in motion, or create minor light effects. Advanced practitioners can achieve far more dramatic results by using multiple forks in specific sequences or combinations. The quality of a Resonant Fork set often determines the precision and power a harmonicist can achieve, making well-crafted sets highly valued possessions passed down through generations of practitioners. The most coveted forks are those crafted from rare meteoric metals, which are said to naturally resonate with cosmic frequencies difficult to access through standard materials.",
        powers: [
          "Frequency Generation",
          "Resonance Detection",
          "Harmonic Spellcasting",
        ],
        danger_level: 3,
      },
    ],
  },
};
