export const SAMPLE_DATA_B = {
  company: {
    name: "Innovative Solutions Inc.",
    founded: 2008,
    active: true,
    description:
      "Innovative Solutions Inc. began as a small startup in a converted warehouse space in San Francisco's Mission District. Three college friends—Maya, Raj, and Devon—combined their expertise in machine learning, user experience design, and business development to create what they hoped would become a revolutionary tech company. Their first year was marked by late nights, endless cups of coffee, and the constant uncertainty that comes with bootstrapping a business. By their second year, they had secured their first major client, a healthcare provider looking to optimize patient scheduling. This early success provided them not only with much-needed revenue but also with valuable insights into enterprise needs. Today, the company stands as a testament to perseverance, innovation, and the power of diverse thinking in technology development. Their original mission—to make cutting-edge technology accessible and useful for businesses of all sizes—remains at the core of everything they do.",
    foundingStory:
      "On a rainy Tuesday in February 2008, three friends met at a small coffee shop on Valencia Street. The conversation that began as casual catch-up quickly evolved into an animated discussion about the gaps they each observed in their respective industries. Maya sketched algorithms on napkins, Raj outlined user flows on his tablet, and Devon calculated potential market opportunities on the back of a receipt. By the time the café was closing, Innovative Solutions had been conceptualized. Within a week, they had pooled their savings, signed a lease on a small office space, and begun their journey into entrepreneurship. The early days were characterized by bootstrapping ingenuity—furniture salvaged from classifieds, computers built from component parts, and marketing done through personal networks and cold calls. Their first breakthrough came six months later when a local healthcare provider took a chance on their scheduling optimization algorithm, which reduced patient wait times by 37% in its first quarter of implementation.",
    headquarters: {
      city: "San Francisco",
      state: "California",
      zipCode: 94105,
      buildingHistory:
        "The headquarters building, affectionately known as 'The Cube' among employees, has a storied past. Originally constructed in 1923 as a printing factory, the building survived the 1989 Loma Prieta earthquake despite significant damage to surrounding structures. In the early 2000s, it was repurposed as a tech incubator space before Innovative Solutions acquired it in 2015. The renovation preserved many original elements—exposed brick walls, cast-iron support columns, and freight elevators converted to modern use—while integrating state-of-the-art technology infrastructure. The rooftop garden, added during the renovation, now serves as both a relaxation space for employees and a site for the company's urban agriculture initiative, which supplies the in-house café with seasonal produce.",
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      hasParking: false,
    },
    departments: [
      {
        id: 1,
        name: "Engineering",
        headCount: 78,
        projects: ["Alpha", "Beta", "Gamma"],
        budget: 1250000.5,
        isHiring: true,
        manager: null,
      },
      {
        id: 2,
        name: "Marketing",
        headCount: 45,
        projects: [],
        budget: 875000.25,
        isHiring: false,
        departmentHistory:
          "The Marketing department has undergone a remarkable transformation since its inception. What began as a two-person team working from a corner of the engineering floor has evolved into a powerhouse of creative and analytical talent. In the early days, marketing efforts were primarily focused on direct outreach and trade show appearances, with limited success. The turning point came in 2014 when the company hired Alex Johnson, a former tech journalist with a keen understanding of both technology narratives and market positioning. Under Alex's leadership, the department pioneered an approach they called 'Education-First Marketing,' which prioritized helping potential customers understand complex technological concepts before attempting to sell solutions. This strategy led to the development of the company's widely acclaimed 'Tech Simplified' webinar series, which not only generated leads but established Innovative Solutions as a thought leader in the industry. The department's growth accelerated following a successful rebranding initiative in 2018, which included a complete visual identity overhaul and the launch of the company's award-winning 'Innovation for All' campaign. Today, the Marketing department integrates cutting-edge data analytics with creative storytelling to create highly targeted campaigns that consistently outperform industry benchmarks for engagement and conversion.",
        manager: {
          name: "Alex Johnson",
          id: "MK-452",
          yearsWithCompany: 5,
          personalBio:
            "Alex Johnson joined Innovative Solutions after a decade as a technology journalist, where they developed a reputation for making complex technical concepts accessible to mainstream audiences. Growing up in rural Montana with limited internet access, Alex developed a deep appreciation for clear communication about technology and its potential to transform lives. Their background includes an undergraduate degree in Computer Science and a Master's in Digital Media from Northwestern University. Before joining the tech journalism world, Alex spent three years in the Peace Corps implementing basic computer literacy programs in rural schools across Central America. This experience shaped their belief that technology should be accessible to everyone, not just those with specialized training or education. At Innovative Solutions, Alex has championed inclusive marketing approaches that avoid jargon and speak to the actual problems businesses face rather than focusing solely on technical specifications. Outside of work, Alex is an avid rock climber, amateur radio operator, and volunteers teaching digital literacy classes for seniors at the local community center. They live in Oakland with their partner Jamie and two rescue dogs, Binary and Pixel.",
          skills: [
            "Content Strategy",
            "Digital Marketing",
            "Analytics",
            "Crisis Communication",
            "Public Speaking",
            "Data Visualization",
            "Community Building",
            "Technical Simplification",
          ],
          contact: {
            email: "alex.j@example.com",
            phone: "",
            preferredContact: "email",
          },
        },
      },
      {
        id: 3,
        name: "HR",
        headCount: 12,
        projects: ["Recruitment Drive", "Employee Wellness"],
        budget: 350000,
        isHiring: false,
        manager: {
          name: "Taylor Smith",
          id: "HR-118",
          yearsWithCompany: 7,
          skills: ["Recruitment", "Conflict Resolution", "Training"],
          contact: {
            email: "t.smith@example.com",
            phone: "555-1234",
            preferredContact: "phone",
          },
        },
      },
    ],
    financials: {
      revenue: {
        "2022": 12500000,
        "2023": 15750000,
        "2024": 18900000,
      },
      expenses: {
        "2022": 9800000,
        "2023": 12100000,
        "2024": 14500000,
      },
      profitable: true,
      lastAudit: "2024-06-15",
      taxRate: 0.28,
      investmentRounds: [
        {
          series: "A",
          year: 2010,
          amount: 2000000,
          investors: ["Venture Capital Fund X", "Angel Investor Y"],
          valuation: 8000000,
        },
        {
          series: "B",
          year: 2015,
          amount: 7500000,
          investors: ["Growth Fund Z", "Tech Investments LLC"],
          valuation: 30000000,
        },
      ],
    },
    products: {
      flagship: {
        name: "InnovatePro",
        version: 4.2,
        releaseDate: "2023-09-12",
        productStory:
          "InnovatePro began as a side project during the company's annual 'Innovation Week' in 2016. A small team of five developers, led by senior engineer Priya Sharma, identified a consistent pain point across their enterprise clients: the difficulty of integrating disparate data systems without specialized knowledge. Over three sleepless nights fueled by pizza and determination, they built the first prototype of what would become the company's most successful product. The initial version, then called 'ConnectAll,' was little more than a proof of concept, but when demonstrated to the executive team, it received immediate approval for further development. The product evolved through extensive beta testing with select clients, each iteration refining both the underlying technology and the user experience. By version 2.0, renamed 'InnovatePro' to align with broader company branding, the software had developed a loyal following among IT administrators for its intuitive interface and robust performance. The current version represents years of continuous improvement, incorporating machine learning capabilities that allow the system to predict and suggest optimal configurations based on usage patterns. The product's success has far exceeded initial projections, accounting for over 60% of the company's current revenue and serving as the foundation for an entire ecosystem of complementary tools and services. Perhaps most remarkably, three of the original five team members who created that first prototype continue to work on the product, maintaining its core vision while embracing emerging technologies and evolving market needs.",
        features: [
          "AI Integration",
          "Cloud Backup",
          "Real-time Analytics",
          "Custom Workflow Automation",
          "Advanced Security Protocols",
          "Multi-platform Synchronization",
          "Predictive Resource Allocation",
          "Regulatory Compliance Framework",
          "Interactive Data Visualization",
          "Natural Language Query Processing",
        ],
        featureSpotlight:
          "The Natural Language Query Processing feature of InnovatePro represents one of the most significant technological breakthroughs in the product's history. The genesis of this feature came from observing non-technical executives struggling to extract meaningful insights from their data without relying on data science teams. The development team spent eighteen months refining algorithms that could interpret conversational questions and translate them into precise database queries. Early versions struggled with industry-specific terminology and contextual nuances, but through machine learning training on millions of example queries, the system gradually became more sophisticated. Today, users can ask questions like 'Show me sales performance for the Northeast region over the last three quarters, compared to the same period last year, excluding promotional events' and receive accurate, visually compelling results within seconds. This capability has democratized data access across organizations, allowing decision-makers at all levels to engage directly with their information resources without technical intermediaries. Customer feedback indicates this single feature has reduced the time from question to insight by an average of 74%, fundamentally transforming how many businesses approach decision-making processes.",
        pricing: {
          basic: 99.99,
          pro: 199.99,
          enterprise: 499.99,
        },
        pricingStrategy:
          "The tiered pricing model for InnovatePro emerged after extensive market research and customer interviews conducted throughout 2021. Initial pricing was flat-rate, which internal analysis revealed was simultaneously pricing out smaller businesses while undervaluing the product for enterprise users who were receiving exponentially more value. The product team worked closely with finance, sales, and customer success departments to design a model that would be both accessible to small and medium businesses while also capturing appropriate value from large-scale implementations. The basic tier was specifically calibrated to serve as an entry point for growing businesses, offering core functionality without overwhelming users with advanced features they might not initially need. The pro tier targets established mid-market companies requiring more sophisticated capabilities and integration options. The enterprise tier includes not only full product functionality but also dedicated support resources, custom implementation assistance, and priority feature development consideration. This model has proven remarkably successful, with clear upgrade paths that correspond to natural business growth stages. Analysis of customer behavior shows healthy conversion rates between tiers as businesses expand their operations and require more advanced capabilities, with 37% of basic subscribers eventually upgrading to pro or enterprise within 24 months of initial subscription.",
        discontinued: false,
      },
      legacy: [
        {
          name: "InnovateBasic",
          version: 2.0,
          releaseDate: "2015-03-18",
          features: ["Basic Analytics", "Local Storage"],
          activeUsers: 0,
          discontinued: true,
          supportEndDate: "2020-12-31",
        },
        {
          name: "InnovateConnect",
          version: 1.5,
          releaseDate: "2012-11-05",
          features: ["Connectivity", "Simple UI"],
          activeUsers: 0,
          discontinued: true,
          supportEndDate: "2018-06-30",
        },
      ],
    },
    locations: [
      {
        type: "headquarters",
        address: "123 Innovation Way",
        employees: 135,
        opened: "2010-05-15",
      },
      {
        type: "branch",
        address: "456 Tech Boulevard",
        employees: 85,
        opened: "2016-09-22",
      },
      {
        type: "remote",
        employees: 42,
        countries: ["Canada", "Germany", "Australia", "Japan"],
        established: "2020-03-01",
      },
    ],
    certifications: ["ISO 9001", "ISO 27001", null, "SOC 2"],
    socialMedia: {
      twitter: "@innovativesolutions",
      facebook: "facebook.com/innovativesolutions",
      linkedin: "linkedin.com/company/innovative-solutions-inc",
      instagram: null,
    },
    board: [
      {
        name: "Dr. Emma Chen",
        position: "Chairperson",
        since: 2015,
        biography:
          "Dr. Emma Chen's journey to becoming Chairperson of Innovative Solutions represents an intersection of academic excellence and entrepreneurial vision. Born to immigrant parents who operated a small electronics repair shop in Queens, New York, Emma displayed an early aptitude for both science and business. By age twelve, she was not only repairing computers alongside her parents but also developing a neighborhood tech support service operated by herself and friends. After graduating as valedictorian of her high school, she attended MIT on a full scholarship, where she completed dual degrees in Computer Science and Cognitive Science, followed by a PhD in Human-Computer Interaction. Her doctoral research on adaptive interfaces for diverse cognitive styles caught the attention of several major tech companies, but Emma chose to pursue a faculty position at Stanford, where she established the groundbreaking Laboratory for Technological Accessibility and Inclusion. During her academic career, she published over 50 peer-reviewed papers, secured seven patents, and advised 23 PhD students who now hold leadership positions across the technology sector. Her transition to the corporate world began as a consultant for Innovative Solutions in 2012, where her insights on user experience for enterprise software significantly influenced the company's product development direction. Recognizing her unique combination of technical expertise, business acumen, and leadership ability, the board invited her to join as a director in 2014 and unanimously elected her as Chairperson the following year. Under her guidance, the company has tripled its revenue, expanded into international markets, and significantly diversified both its product offerings and workforce. Despite her corporate responsibilities, Dr. Chen maintains close ties to academia through guest lectures, research collaborations, and the scholarship foundation she established to support underrepresented students pursuing careers in technology. Her leadership philosophy, often summarized in her frequently quoted principle that 'technology should adapt to humanity, not the other way around,' continues to shape both the culture and strategic direction of Innovative Solutions.",
        committees: ["Executive", "Audit"],
        notable_achievements:
          "Dr. Chen's tenure as Chairperson has been marked by several transformative initiatives that have redefined the company's trajectory. Perhaps most significant was her championing of the 'Horizon Project' in 2017—a high-risk, high-reward R&D initiative that allocated 15% of the company's resources to exploring emerging technologies with no immediate commercial application. This project initially faced skepticism from some board members and shareholders concerned about short-term returns, but Dr. Chen successfully advocated for a longer-term perspective on innovation. The Horizon Project has since yielded three breakthrough technologies that form the foundation of the company's newest product lines, collectively accounting for 28% of current revenue. Another notable achievement was her leadership during the challenging period of 2020, when the global pandemic forced a complete reconsideration of both internal operations and market strategy. Under her guidance, the company not only successfully transitioned to a fully remote work model within two weeks but also rapidly developed and deployed solutions to help their clients manage their own remote transitions. This responsive approach not only maintained business continuity but actually accelerated growth during a period of economic uncertainty. Dr. Chen also spearheaded the company's comprehensive Diversity, Equity, and Inclusion initiative, establishing concrete metrics and accountability mechanisms that have resulted in significant improvements in workforce representation, pay equity, and inclusive product design. Her commitment to transparency in this effort, including regular public reporting of both successes and ongoing challenges, has established Innovative Solutions as an industry leader in building truly diverse and equitable workplaces.",
        external: false,
      },
      {
        name: "Michael Rodriguez",
        position: "Vice Chair",
        since: 2018,
        committees: ["Finance", "Governance"],
        external: true,
        affiliations: ["Rodriguez Holdings", "Tech Industry Association"],
      },
    ],
    partners: {
      strategic: ["TechGiant Corp", "Global Solutions Ltd"],
      resellers: ["Regional Tech Distributors", "Industry Specific Vendors"],
      technology: {
        cloud: "AWS",
        payment: "Stripe",
        analytics: "Mixpanel",
        crm: "Salesforce",
      },
    },
    pending: {
      acquisitions: [
        {
          targetCompany: "SmallTech Innovations",
          estimatedValue: 5000000,
          status: "due diligence",
          completionDate: null,
          confidential: true,
        },
      ],
      patents: 3,
      lawsuits: 0,
    },
  },
};
