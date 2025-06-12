import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEdit, FiPlus, FiMapPin, FiFile } from 'react-icons/fi';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 2rem;
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const LeftColumn = styled.div`
  flex: 1;
  min-width: 280px;
`;

const RightColumn = styled.div`
  flex: 2;
  min-width: 320px;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: #e6f0fa; /* Light blue for clarity */
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  position: relative;
`;

const Label = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const EditButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  margin-left: 1rem;
  margin-bottom: 0.5rem;
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const SaveButton = styled.button`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
`;

const CancelButton = styled.button`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 80px;
`;

const ListInput = styled(Input)`
  margin-bottom: 0.5rem;
`;

const ProfilePicWrapper = styled.div`
  width: 180px;
  height: 180px;
  margin: 0 auto 1rem auto;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.black};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePic = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  margin: 0 auto;
`;

const EditIconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 2;
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const AddIconButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const OutlinedList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OutlinedItem = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
  padding: 0.3rem 1rem;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1rem;
`;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const years = Array.from({ length: 60 }, (_, i) => 1980 + i);

// Normalize certificates to objects
function normalizeCertificates(certs) {
  return certs.map(cert =>
    typeof cert === 'string'
      ? {
          title: cert,
          summary: '',
          certificateFileName: '',
          startMonth: '',
          startYear: '',
          endMonth: '',
          endYear: ''
        }
      : {
          title: cert.title || '',
          summary: cert.summary || '',
          certificateFileName: cert.certificateFileName || '',
          startMonth: cert.startMonth || cert.month || '',
          startYear: cert.startYear || cert.year || '',
          endMonth: cert.endMonth || '',
          endYear: cert.endYear || ''
        }
  );
}

const Profile = ({ userRole }) => {
  // Editable state
  const [edit, setEdit] = useState({});
  const [user, setUser] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@email.com',
    phone: '+1234567890',
    profilePic: 'https://via.placeholder.com/100',
    social: {
      linkedin: 'https://linkedin.com/in/janedoe',
      twitter: 'https://twitter.com/janedoe',
      instagram: 'https://instagram.com/janedoe',
      facebook: 'https://facebook.com/janedoe',
    },
    interests: ['Digital Literacy', 'Community Building', 'Language Learning'],
    summary: 'A passionate learner and community builder.',
    experiences: [
      { company: 'Tech Org', role: 'Intern', years: '2022-2023', summary: 'Worked on web development projects.' },
    ],
    education: [
      { school: 'ALU', degree: 'BSc Computer Science', years: '2020-2024' },
    ],
    languages: ['English', 'French'],
    skills: ['React', 'Communication', 'Teamwork'],
    certificates: normalizeCertificates([
      'Digital Literacy Certificate',
      'English Proficiency',
    ]),
    role: userRole,
    country: 'Rwanda',
    city: 'Kigali',
  });
  const [form, setForm] = useState({
    ...user,
    certificates: normalizeCertificates(user.certificates),
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [degreeFiles, setDegreeFiles] = useState({});
  const [certificateFiles, setCertificateFiles] = useState({});

  // Handlers
  const handleEdit = (section) => {
    setEdit({ ...edit, [section]: true });
    setForm(user);
  };
  const handleCancel = (section) => {
    setEdit({ ...edit, [section]: false });
    setForm(user);
  };
  const handleChange = (e, section, idx, subfield) => {
    if (section === 'social') {
      setForm({ ...form, social: { ...form.social, [subfield]: e.target.value } });
    } else if (['experiences', 'education', 'languages', 'skills', 'certificates', 'interests'].includes(section)) {
      const updated = [...form[section]];
      if (subfield) {
        updated[idx][subfield] = e.target.value;
      } else {
        updated[idx] = e.target.value;
      }
      setForm({ ...form, [section]: updated });
    } else {
      setForm({ ...form, [section]: e.target.value });
    }
  };
  const handleSave = (section) => {
    if (section === 'certificates') {
      setUser(prev => ({
        ...prev,
        certificates: normalizeCertificates(form.certificates)
      }));
      setEdit({ ...edit, [section]: false });
      return;
    }
    setUser(prev => ({
      ...prev,
      [section]: form[section]
    }));
    setEdit({ ...edit, [section]: false });
  };
  const handleAddListItem = (section, template) => {
    setForm({ ...form, [section]: [...form[section], template] });
  };
  const handleRemoveListItem = (section, idx) => {
    const updated = [...form[section]];
    updated.splice(idx, 1);
    setForm({ ...form, [section]: updated });
  };

  // Profile picture edit handler
  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
      setForm({ ...form, profilePic: URL.createObjectURL(e.target.files[0]) });
    }
  };
  const handleProfilePicSave = () => {
    setUser({ ...user, profilePic: form.profilePic });
    setEdit({ ...edit, profilePic: false });
    setProfilePicFile(null);
  };
  const handleProfilePicCancel = () => {
    setForm({ ...form, profilePic: user.profilePic });
    setEdit({ ...edit, profilePic: false });
    setProfilePicFile(null);
  };

  const handleDegreeFileChange = (e, idx) => {
    if (e.target.files && e.target.files[0]) {
      setDegreeFiles({ ...degreeFiles, [idx]: e.target.files[0] });
      const updated = [...form.education];
      updated[idx].degreeFileName = e.target.files[0].name;
      setForm({ ...form, education: updated });
    }
  };
  const handleCertificateFileChange = (e, idx) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFiles({ ...certificateFiles, [idx]: e.target.files[0] });
      const updated = [...form.certificates];
      updated[idx].certificateFileName = e.target.files[0].name;
      setForm({ ...form, certificates: updated });
    }
  };

  return (
    <Container>
      <Title>Profile</Title>
      <FlexRow>
        <LeftColumn>
          {/* Profile Picture */}
          <Section>
            <EditIconButton onClick={() => setEdit({ ...edit, profilePic: true })} type="button" aria-label="Edit profile picture"><FiEdit /></EditIconButton>
            <Label>Profile Picture</Label>
            {edit.profilePic ? (
              <>
                <ProfilePicWrapper>
                  <ProfilePic src={form.profilePic} alt="Profile" />
                </ProfilePicWrapper>
                <Input type="file" accept="image/*" onChange={handleProfilePicChange} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiMapPin style={{ color: '#007bff', fontSize: '1.2rem' }} />
                  <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country" style={{ marginBottom: 0 }} />
                  <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" style={{ marginBottom: 0 }} />
                </div>
                <SaveButton onClick={handleProfilePicSave}>Save</SaveButton>
                <CancelButton onClick={handleProfilePicCancel}>Cancel</CancelButton>
              </>
            ) : (
              <>
                <ProfilePicWrapper>
                  <ProfilePic src={user.profilePic} alt="Profile" />
                </ProfilePicWrapper>
                <div style={{ marginTop: '0.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiMapPin style={{ color: '#007bff', fontSize: '1.2rem' }} />
                  <span>{user.country}, {user.city}</span>
                </div>
              </>
            )}
          </Section>
          {/* Contact Information */}
          <Section>
            <EditIconButton onClick={() => handleEdit('contact')} type="button" aria-label="Edit contact info"><FiEdit /></EditIconButton>
            <Label>Contact Information</Label>
            {edit.contact ? (
              <>
                <Input value={form.email} onChange={e => handleChange(e, 'email')} placeholder="Email" />
                <Input value={form.phone} onChange={e => handleChange(e, 'phone')} placeholder="Phone" />
                <SaveButton onClick={() => handleSave('contact')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('contact')}>Cancel</CancelButton>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '0.5rem' }}>Email: {user.email}</div>
                <div>Phone: {user.phone}</div>
              </>
            )}
          </Section>
          {/* Social Platforms */}
          <Section>
            <EditIconButton onClick={() => handleEdit('social')} type="button" aria-label="Edit social platforms"><FiEdit /></EditIconButton>
            <Label>Social Platforms</Label>
            {edit.social ? (
              <>
                <Input value={form.social.linkedin} onChange={e => handleChange(e, 'social', null, 'linkedin')} placeholder="LinkedIn" />
                <Input value={form.social.twitter} onChange={e => handleChange(e, 'social', null, 'twitter')} placeholder="Twitter" />
                <Input value={form.social.instagram} onChange={e => handleChange(e, 'social', null, 'instagram')} placeholder="Instagram" />
                <Input value={form.social.facebook} onChange={e => handleChange(e, 'social', null, 'facebook')} placeholder="Facebook" />
                <SaveButton onClick={() => handleSave('social')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('social')}>Cancel</CancelButton>
              </>
            ) : (
              <>
                {user.social.linkedin && (
                  <div><a href={user.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></div>
                )}
                {user.social.twitter && (
                  <div><a href={user.social.twitter} target="_blank" rel="noopener noreferrer">Twitter</a></div>
                )}
                {user.social.instagram && (
                  <div><a href={user.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></div>
                )}
                {user.social.facebook && (
                  <div><a href={user.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></div>
                )}
              </>
            )}
          </Section>
          {/* Interests */}
          <Section>
            <EditIconButton onClick={() => handleEdit('interests')} type="button" aria-label="Edit interests"><FiEdit /></EditIconButton>
            <Label>Interests</Label>
            {edit.interests ? (
              <>
                {form.interests.map((interest, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Input
                      value={interest}
                      onChange={e => handleChange(e, 'interests', idx)}
                      placeholder="Interest"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <CancelButton type="button" onClick={() => handleRemoveListItem('interests', idx)} style={{ marginLeft: '0.5rem', marginTop: 0 }}>Remove</CancelButton>
                  </div>
                ))}
                <SaveButton onClick={() => handleSave('interests')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('interests')}>Cancel</CancelButton>
                <AddIconButton type="button" onClick={() => handleAddListItem('interests', '')} aria-label="Add interest"><FiPlus /></AddIconButton>
              </>
            ) : (
              <OutlinedList>
                {user.interests.map((interest, idx) => (
                  <OutlinedItem key={idx}>{interest}</OutlinedItem>
                ))}
              </OutlinedList>
            )}
          </Section>
        </LeftColumn>
        <RightColumn>
          {/* Summary / Biography */}
          <Section>
            <EditIconButton onClick={() => handleEdit('summary')} type="button" aria-label="Edit summary"><FiEdit /></EditIconButton>
            <Label>Summary / Biography</Label>
            {edit.summary ? (
              <>
                <TextArea value={form.summary} onChange={e => handleChange(e, 'summary')} placeholder="Summary or biography" />
                <SaveButton onClick={() => handleSave('summary')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('summary')}>Cancel</CancelButton>
              </>
            ) : (
              <div>{user.summary}</div>
            )}
          </Section>
          {/* Work Experiences */}
          <Section>
            <EditIconButton onClick={() => handleEdit('experiences')} type="button" aria-label="Edit work experiences"><FiEdit /></EditIconButton>
            <Label>Work Experiences</Label>
            {edit.experiences ? (
              <>
                {form.experiences.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
                    <ListInput value={exp.role} onChange={e => handleChange(e, 'experiences', idx, 'role')} placeholder="Role" />
                    <ListInput value={exp.company} onChange={e => handleChange(e, 'experiences', idx, 'company')} placeholder="Company" />
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select value={exp.startMonth || ''} onChange={e => handleChange(e, 'experiences', idx, 'startMonth')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">Start Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={exp.startYear || ''} onChange={e => handleChange(e, 'experiences', idx, 'startYear')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">Start Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={exp.endMonth || ''} onChange={e => handleChange(e, 'experiences', idx, 'endMonth')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">End Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={exp.endYear || ''} onChange={e => handleChange(e, 'experiences', idx, 'endYear')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">End Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                        <option value="Present">Present</option>
                      </select>
                    </div>
                    <TextArea value={exp.summary || ''} onChange={e => handleChange(e, 'experiences', idx, 'summary')} placeholder="Summary of work" />
                    <CancelButton type="button" onClick={() => handleRemoveListItem('experiences', idx)}>Remove</CancelButton>
                  </div>
                ))}
                <SaveButton onClick={() => handleSave('experiences')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('experiences')}>Cancel</CancelButton>
                <AddIconButton type="button" onClick={() => handleAddListItem('experiences', { company: '', role: '', years: '', summary: '', startMonth: '', startYear: '', endMonth: '', endYear: '' })} aria-label="Add experience"><FiPlus /></AddIconButton>
              </>
            ) : (
              <ul style={{ padding: 0, margin: 0 }}>
                {user.experiences.map((exp, idx) => (
                  <li key={idx} style={{ listStyle: 'none', marginBottom: '1rem', textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {exp.role} at {exp.company}
                      {exp.startMonth && exp.startYear && (
                        <> ({exp.startMonth} {exp.startYear}
                          {exp.endMonth && exp.endYear
                            ? ` - ${exp.endMonth} ${exp.endYear})`
                            : exp.endYear === 'Present'
                              ? ' - Present)'
                              : ')'}
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.95em', color: '#333', marginTop: '0.2em', textAlign: 'left' }}>{exp.summary}</div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          {/* Education */}
          <Section>
            <EditIconButton onClick={() => handleEdit('education')} type="button" aria-label="Edit education"><FiEdit /></EditIconButton>
            <Label>Education</Label>
            {edit.education ? (
              <>
                {form.education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
                    <ListInput value={edu.degree} onChange={e => handleChange(e, 'education', idx, 'degree')} placeholder="Degree" />
                    <ListInput value={edu.school} onChange={e => handleChange(e, 'education', idx, 'school')} placeholder="School" />
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select value={edu.startMonth || ''} onChange={e => handleChange(e, 'education', idx, 'startMonth')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">Start Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={edu.startYear || ''} onChange={e => handleChange(e, 'education', idx, 'startYear')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">Start Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={edu.endMonth || ''} onChange={e => handleChange(e, 'education', idx, 'endMonth')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">End Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={edu.endYear || ''} onChange={e => handleChange(e, 'education', idx, 'endYear')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">End Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                        <option value="Present">Present</option>
                      </select>
                    </div>
                    <TextArea value={edu.summary || ''} onChange={e => handleChange(e, 'education', idx, 'summary')} placeholder="Summary of what you studied" />
                    <div style={{ marginBottom: '0.5rem' }}>
                      <input type="file" accept="application/pdf,image/*" onChange={e => handleDegreeFileChange(e, idx)} />
                      {edu.degreeFileName && <span style={{ marginLeft: '0.5rem' }}>{edu.degreeFileName}</span>}
                    </div>
                    <CancelButton type="button" onClick={() => handleRemoveListItem('education', idx)}>Remove</CancelButton>
                  </div>
                ))}
                <SaveButton onClick={() => handleSave('education')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('education')}>Cancel</CancelButton>
                <AddIconButton type="button" onClick={() => handleAddListItem('education', { degree: '', school: '', years: '', summary: '', startMonth: '', startYear: '', endMonth: '', endYear: '', degreeFileName: '' })} aria-label="Add education"><FiPlus /></AddIconButton>
              </>
            ) : (
              <ul style={{ padding: 0, margin: 0 }}>
                {user.education.map((edu, idx) => (
                  <li key={idx} style={{ textAlign: 'left', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>
                      {edu.degree} at {edu.school}
                      {edu.startMonth && edu.startYear && (
                        <> ({edu.startMonth} {edu.startYear}
                          {edu.endMonth && edu.endYear
                            ? ` - ${edu.endMonth} ${edu.endYear})`
                            : edu.endYear === 'Present'
                              ? ' - Present)'
                              : ')'}
                        </>
                      )}
                    </div>
                    {edu.summary && <div style={{ color: '#333', marginTop: '0.2em' }}>{edu.summary}</div>}
                    {edu.degreeFileName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiFile style={{ color: '#007bff' }} />
                        <a href="#" style={{ color: '#007bff' }} download>{edu.degreeFileName}</a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
          {/* Skills */}
          <Section>
            <EditIconButton onClick={() => handleEdit('skills')} type="button" aria-label="Edit skills"><FiEdit /></EditIconButton>
            <Label>Skills</Label>
            {edit.skills ? (
              <>
                {form.skills.map((skill, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Input
                      value={skill}
                      onChange={e => handleChange(e, 'skills', idx)}
                      placeholder="Skill"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <CancelButton type="button" onClick={() => handleRemoveListItem('skills', idx)} style={{ marginLeft: '0.5rem', marginTop: 0 }}>Remove</CancelButton>
                  </div>
                ))}
                <SaveButton onClick={() => handleSave('skills')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('skills')}>Cancel</CancelButton>
                <AddIconButton type="button" onClick={() => handleAddListItem('skills', '')} aria-label="Add skill"><FiPlus /></AddIconButton>
              </>
            ) : (
              <OutlinedList>
                {user.skills.map((skill, idx) => (
                  <OutlinedItem key={idx}>{skill}</OutlinedItem>
                ))}
              </OutlinedList>
            )}
          </Section>
          {/* Languages */}
          <Section>
            <EditIconButton onClick={() => handleEdit('languages')} type="button" aria-label="Edit languages"><FiEdit /></EditIconButton>
            <Label>Languages</Label>
            {edit.languages ? (
              <>
                {form.languages.map((language, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Input
                      value={language}
                      onChange={e => handleChange(e, 'languages', idx)}
                      placeholder="Language"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <CancelButton type="button" onClick={() => handleRemoveListItem('languages', idx)} style={{ marginLeft: '0.5rem', marginTop: 0 }}>Remove</CancelButton>
                  </div>
                ))}
                <SaveButton onClick={() => handleSave('languages')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('languages')}>Cancel</CancelButton>
                <AddIconButton type="button" onClick={() => handleAddListItem('languages', '')} aria-label="Add language"><FiPlus /></AddIconButton>
              </>
            ) : (
              <OutlinedList>
                {user.languages.map((language, idx) => (
                  <OutlinedItem key={idx}>{language}</OutlinedItem>
                ))}
              </OutlinedList>
            )}
          </Section>
          {/* Certificates */}
          <Section>
            <EditIconButton onClick={() => handleEdit('certificates')} type="button" aria-label="Edit certificates"><FiEdit /></EditIconButton>
            <Label>Certificates</Label>
            {edit.certificates ? (
              <>
                {form.certificates.map((cert, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
                    <ListInput value={cert.title || ''} onChange={e => handleChange(e, 'certificates', idx, 'title')} placeholder="Certificate Title" />
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <select value={cert.startMonth || ''} onChange={e => handleChange(e, 'certificates', idx, 'startMonth')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">Start Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={cert.startYear || ''} onChange={e => handleChange(e, 'certificates', idx, 'startYear')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">Start Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={cert.endMonth || ''} onChange={e => handleChange(e, 'certificates', idx, 'endMonth')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">End Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={cert.endYear || ''} onChange={e => handleChange(e, 'certificates', idx, 'endYear')} style={{ borderRadius: '8px', padding: '0.3rem' }}>
                        <option value="">End Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                        <option value="Present">Present</option>
                      </select>
                    </div>
                    <TextArea value={cert.summary || ''} onChange={e => handleChange(e, 'certificates', idx, 'summary')} placeholder="Summary of what you learned" />
                    <div style={{ marginBottom: '0.5rem' }}>
                      <input type="file" accept="application/pdf,image/*" onChange={e => handleCertificateFileChange(e, idx)} />
                      {cert.certificateFileName && <span style={{ marginLeft: '0.5rem' }}>{cert.certificateFileName}</span>}
                    </div>
                    <CancelButton type="button" onClick={() => handleRemoveListItem('certificates', idx)}>Remove</CancelButton>
                  </div>
                ))}
                <SaveButton onClick={() => handleSave('certificates')}>Save</SaveButton>
                <CancelButton onClick={() => handleCancel('certificates')}>Cancel</CancelButton>
                <AddIconButton type="button" onClick={() => handleAddListItem('certificates', { title: '', summary: '', certificateFileName: '', startMonth: '', startYear: '', endMonth: '', endYear: '' })} aria-label="Add certificate"><FiPlus /></AddIconButton>
              </>
            ) : (
              <OutlinedList>
                {user.certificates.map((cert, idx) => (
                  <li key={idx} style={{ textAlign: 'left', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{cert.title || cert}</div>
                    {(cert.startMonth && cert.startYear) && <div style={{ color: '#555', fontSize: '0.95em' }}>{cert.startMonth} {cert.startYear}{(cert.endMonth && cert.endYear) ? ` - ${cert.endMonth} ${cert.endYear}` : cert.endYear === 'Present' ? ' - Present' : ''}</div>}
                    {cert.summary && <div style={{ color: '#333', marginTop: '0.2em' }}>{cert.summary}</div>}
                    {cert.certificateFileName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiFile style={{ color: '#007bff' }} />
                        <a href="#" style={{ color: '#007bff' }} download>{cert.certificateFileName}</a>
                      </div>
                    )}
                  </li>
                ))}
              </OutlinedList>
            )}
          </Section>
        </RightColumn>
      </FlexRow>
    </Container>
  );
};

export default Profile;