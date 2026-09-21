import BrandName from './BrandName';

const TEAM = [
  {
    name: 'Lihle Tobotshane',
    role: 'Co-Creator, Indlela2Tech',
    photo: '/team/Lihle.png',
    linkedin: 'https://www.linkedin.com/in/lihle-tobotshane-077851227/',
    email: 'tobotshanelihle@gmail.com',
    github: 'https://github.com/LihleTobotshane',
  },
  {
    name: 'Lucia Zinhle Mawoko',
    role: 'Co-Creator, Indlela2Tech',
    photo: '/team/Lucia.png',
    linkedin: 'https://www.linkedin.com/in/zinhle-lucia-a7a991438',
    email: 'zlucia191@gmail.com',
    github: 'https://github.com/zlucia191-arch',
  },
  {
    name: 'Luzuko Jonas',
    role: 'Co-Creator, Indlela2Tech',
    photo: '/team/Luzuko.png',
    linkedin: 'https://za.linkedin.com/in/luzuko-jonas-a03834253',
    email: 'luzukoluz30@gmail.com',
    github: 'https://github.com/luzukoluz30-hub',
  },
  {
    name: 'Ovayo Mzizi',
    role: 'Co-Creator, Indlela2Tech',
    photo: '/team/Ovayo.png',
    linkedin: 'https://www.linkedin.com/in/ovayo-mzizi1010/',
    email: 'msovayomzizi@gmail.com',
    github: 'https://github.com/OvayoMzizi',
  },
];

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function TeamCard({ member }) {
  return (
    <div
      style={{
        border: '2px solid #111111',
        borderTop: '6px solid #FFEE00',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '8px',
      }}
    >
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.name}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #111111',
          }}
        />
      ) : (
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: '#111111',
            color: '#FFC933',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          {initials(member.name)}
        </div>
      )}

      <h3 style={{ margin: 0, fontSize: '17px', fontFamily: "'Space Grotesk', sans-serif" }}>{member.name}</h3>
      <p style={{ margin: 0, fontSize: '13px', color: '#666666', fontWeight: 600 }}>{member.role}</p>
      <p style={{ margin: 0, fontSize: '12.5px', color: '#888888' }}>{member.focus}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', width: '100%' }}>
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '13px', color: '#1a4dbf', textDecoration: 'underline' }}
        >
          LinkedIn
        </a>
        <a
          href={`mailto:${member.email}`}
          style={{ fontSize: '13px', color: '#1a4dbf', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {member.email}
        </a>
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '13px', color: '#1a4dbf', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {member.github.replace('https://', '')}
        </a>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1>
          About <BrandName />
        </h1>
      </header>

      <section
        style={{
          border: '2px solid #111111',
          borderLeft: '6px solid #FFEE00',
          borderRadius: '8px',
          padding: '18px 22px',
          marginBottom: '40px',
        }}
      >
        <p style={{ margin: '0 0 14px 0', fontSize: '15px', lineHeight: 1.7, color: '#333333' }}>
          <strong>Indlela2Tech</strong> was co-created in 2026 by a small team of Hillensberg
          Trust Bursary recipients, as part of the community engagement initiative required
          by the bursary. We wanted to build something genuinely useful for learners coming
          up behind us — a guide to help you discover the Information Systems and
          technology-related qualifications on offer at public universities and TVET
          colleges across South Africa.
        </p>
        <p style={{ margin: '0 0 14px 0', fontSize: '15px', lineHeight: 1.7, color: '#333333' }}>
          This platform is aimed at high school learners exploring their options for life
          after matric — whether you're already in your final year or just starting to
          think ahead in grade 10 or 11. It's never too early to start looking into the
          future, and we hope this gives you a helpful starting point: a place to compare
          institutions, understand entry requirements, and get a feel for what a tech
          career path could actually look like.
        </p>
        <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: '#333333' }}>
          Use this as your starting guide, and head to each institution's official website
          for the latest application dates, fees, and full course details before you apply.
          If this helped you, please share it with a friend, a classmate, or your school —
          the more learners who get to explore their options early, the better.
        </p>
      </section>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>The Team</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {TEAM.map((member) => (
          <TeamCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}
