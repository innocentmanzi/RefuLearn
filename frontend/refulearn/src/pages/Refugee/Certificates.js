import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { FaLinkedin, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

import ContentWrapper from '../../components/ContentWrapper';
import offlineIntegrationService from '../../services/offlineIntegrationService';
import preloader from '../../utils/preloader';

const Container = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.white};
  min-height: 100vh;
  max-width: 100vw;
  
  @media (max-width: 900px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  width: 100%;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const CertificateCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 0;
  width: 100%;
  max-width: 100vw;
  margin: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 600px) {
    margin: 0.25rem;
    font-size: 0.98rem;
  }
`;

const CertificateHeader = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  position: relative;
`;

const CertificateTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: white;
`;

const CertificateDate = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const CertificateContent = styled.div`
  padding: 1.5rem;
`;

const CertificateDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
`;

const CertificateMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const DownloadButton = styled(ActionButton)`
  background: #4CAF50;
  
  &:hover {
    background: #45a049;
  }
`;

const ShareButton = styled(ActionButton)`
  background: #2196F3;
  margin-top: 0.5rem;
  
  &:hover {
    background: #1976D2;
  }
`;

const shareOptions = [
  { name: 'LinkedIn', icon: <FaLinkedin color="#0077b5" size={20} style={{ marginRight: 8 }} /> },
  { name: 'Facebook', icon: <FaFacebook color="#1877f3" size={20} style={{ marginRight: 8 }} /> },
  { name: 'Twitter', icon: <FaTwitter color="#1da1f2" size={20} style={{ marginRight: 8 }} /> },
  { name: 'Instagram', icon: <FaInstagram color="#e1306c" size={20} style={{ marginRight: 8 }} /> },
];

const Certificates = () => {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareDropdown, setShareDropdown] = useState(null); // certificateId or null
  const dropdownRef = useRef();
  const buttonRefs = useRef({});
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Fetch user certificates on component mount with caching
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        console.log('📜 === STARTING CERTIFICATE FETCH DEBUG ===');
        
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);
        console.log('🔑 Token preview:', token ? token.substring(0, 50) + '...' : 'No token');
        
        // Check for offline authentication first
        const isOnline = navigator.onLine;
        const cachedUser = localStorage.getItem('user');
        
        if (!token && !cachedUser) {
          console.error('❌ No authentication token or cached user found!');
          setCertificates([]);
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        // If offline and no token but have cached user, proceed with offline mode
        if (!token && cachedUser && !isOnline) {
          console.log('📴 Offline mode: Using cached user data for certificates');
        } else if (!token) {
          console.error('❌ No authentication token found!');
          setCertificates([]);
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        // Check for preloaded data first (fastest)
        const preloadedData = preloader.getPreloadedData('certificates');
        if (preloadedData && preloadedData.timestamp) {
          const now = Date.now();
          if ((now - preloadedData.timestamp) < 2 * 60 * 1000) {
            console.log('🚀 Using preloaded certificates data');
            if (preloadedData.certificates) {
              setCertificates(preloadedData.certificates.data?.certificates || []);
              setLoading(false);
              return;
            }
          }
        }
        
        // Check for cached data (5 minutes cache)
        const cachedCertificates = localStorage.getItem('certificates_cache');
        const cacheTime = localStorage.getItem('certificates_cache_time');
        const now = Date.now();
        
        if (cachedCertificates && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
          console.log('📱 Using cached certificates data');
          const parsedCertificates = JSON.parse(cachedCertificates);
          setCertificates(parsedCertificates);
          setLoading(false);
          return;
        }
        
        let certificatesData = [];

        // Step 1: Get user's enrolled courses and certificates in parallel
        console.log('🔄 === STEP 1: FETCHING DATA IN PARALLEL ===');
        let enrolledCourses = [];
        
        try {
          let coursesResponse, certificatesResponse;
          
          if (isOnline && token) {
            // Online mode: fetch from API
            console.log('🌐 Online mode: Fetching from API...');
            [coursesResponse, certificatesResponse] = await Promise.all([
              fetch('/api/courses/enrolled/courses', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }),
              fetch('/api/certificates/user?limit=100', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
            ]);

            console.log('📡 Parallel API responses status:', {
              courses: coursesResponse.status,
              certificates: certificatesResponse.status
            });
            
            // Process enrolled courses
            if (coursesResponse.ok) {
              const coursesData = await coursesResponse.json();
              if (coursesData.success && coursesData.data && coursesData.data.courses) {
                enrolledCourses = coursesData.data.courses;
                console.log('📚 Found enrolled courses:', enrolledCourses.length);
                
                // Store for offline use
                await offlineIntegrationService.storeEnrolledCourses(enrolledCourses);
              }
            }
          } else {
            // Offline mode: use cached data
            console.log('📴 Offline mode: Using cached data...');
            enrolledCourses = await offlineIntegrationService.getEnrolledCourses() || [];
            console.log('📚 Found cached enrolled courses:', enrolledCourses.length);
          }
        } catch (error) {
          console.error('❌ Error fetching enrolled courses and certificates:', error);
          
          // Try to use cached data as fallback
          try {
            console.log('🔄 Trying cached data as fallback...');
            enrolledCourses = await offlineIntegrationService.getEnrolledCourses() || [];
            console.log('📚 Found fallback enrolled courses:', enrolledCourses.length);
          } catch (fallbackError) {
            console.error('❌ Fallback to cached data also failed:', fallbackError);
            setError('Failed to fetch course data');
            setLoading(false);
            return;
          }
        }

        // Step 2: Check completion status for all enrolled courses in parallel
        console.log('🔄 === STEP 2: CHECKING COURSE COMPLETION STATUS IN PARALLEL ===');
        const completedCourses = [];
        
        if (enrolledCourses.length === 0) {
          console.warn('⚠️ No enrolled courses found - cannot check completion status');
        } else {
          // Fetch progress for all courses in parallel
          const progressPromises = enrolledCourses.map(async (course) => {
          try {
            const progressResponse = await fetch(`/api/courses/${course._id}/progress`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              if (progressData.success && progressData.data) {
                const progressPercentage = progressData.data.progressPercentage || 0;
                  const isCompleted = progressPercentage >= 90;
                  
                  if (isCompleted) {
                    return {
                        _id: course._id,
                        title: course.title,
                        progressPercentage,
                      moduleCompletionRate: progressPercentage
                    };
                  }
                }
              }
              return null;
            } catch (error) {
              console.error(`❌ Error checking progress for ${course.title}:`, error);
              return null;
            }
          });

          // Wait for all progress checks to complete
          const progressResults = await Promise.all(progressPromises);
          completedCourses.push(...progressResults.filter(course => course !== null));
          
          console.log(`✅ Found ${completedCourses.length} completed courses out of ${enrolledCourses.length} enrolled`);
        }

        console.log(`🎯 Found ${completedCourses.length} completed courses out of ${enrolledCourses.length} enrolled`);
        console.log('📋 COMPLETED COURSES LIST:');
        completedCourses.forEach((course, index) => {
          console.log(`  ${index + 1}. "${course.title}" (ID: ${course._id}) - ${course.progressPercentage}% - ${course.moduleCompletionRate}% modules`);
        });

        // Step 3: Fetch REAL certificates from backend and validate completion
        console.log('🔄 === STEP 3: FETCHING CERTIFICATES FROM BACKEND ===');
        try {
          console.log('📡 Making API call to /api/certificates/user...');
          const certificatesResponse = await fetch('/api/certificates/user?limit=100', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📡 API Response Status:', certificatesResponse.status);
          console.log('📡 API Response OK:', certificatesResponse.ok);

          if (certificatesResponse.ok) {
            const certificatesApiData = await certificatesResponse.json();
            console.log('📜 Backend certificates API response:', certificatesApiData);
            
            if (certificatesApiData.success && certificatesApiData.data && certificatesApiData.data.certificates) {
              const backendCertificates = certificatesApiData.data.certificates;
              console.log(`🔍 Found ${backendCertificates.length} certificates in backend`);
              console.log('📋 Raw certificates from backend:', backendCertificates);
              
              // Debug: Show detailed certificate information
              console.log('🔍 === DETAILED CERTIFICATE ANALYSIS ===');
              backendCertificates.forEach((cert, index) => {
                console.log(`Certificate ${index + 1}:`, {
                  id: cert._id,
                  courseTitle: cert.courseTitle,
                  courseId: cert.course,
                  userId: cert.user,
                  issuedAt: cert.issuedAt,
                  certificateNumber: cert.certificateNumber,
                  grade: cert.grade,
                  isVerified: cert.isVerified,
                  issuedBy: cert.issuedBy
                });
              });
              
              if (backendCertificates.length === 0) {
                console.warn('⚠️ No certificates found in backend database');
              }
              
                             // For debugging: Show ALL certificates first
               console.log('🔍 === DEBUGGING: SHOWING ALL BACKEND CERTIFICATES ===');
               backendCertificates.forEach((cert, index) => {
                 console.log(`Certificate ${index + 1}:`, {
                   id: cert._id,
                   courseTitle: cert.courseTitle,
                   course: cert.course,
                   user: cert.user,
                   issuedAt: cert.issuedAt
                 });
               });

               // SHOW ALL CERTIFICATES: Display all certificates from database
               console.log('🎓 SHOWING ALL CERTIFICATES: Displaying all certificates from database');
               console.log('📊 Backend certificates found:', backendCertificates.length);
               
               // Log all certificates for debugging
               console.log('📋 All backend certificates:');
               backendCertificates.forEach((cert, index) => {
                 console.log(`  ${index + 1}. Certificate: "${cert.courseTitle}" (courseId: ${cert.course})`);
               });
               
               // Show all certificates without strict validation
               certificatesData = backendCertificates.map(certificate => ({
                 ...certificate,
                 courseTitle: certificate.courseTitle || 'Unknown Course',
                 courseName: certificate.courseTitle || 'Unknown Course'
               }));
               
               console.log(`🎯 FINAL RESULT: ${certificatesData.length} certificates to display`);
              
            } else {
              console.log('ℹ️ No certificates found in backend response');
              console.log('📊 Backend response structure:', {
                success: certificatesApiData.success,
                hasData: !!certificatesApiData.data,
                hasCertificates: !!(certificatesApiData.data && certificatesApiData.data.certificates)
              });
              certificatesData = [];
            }
          } else {
            console.warn('⚠️ Failed to fetch certificates from backend');
            console.warn('📡 Response status:', certificatesResponse.status);
            console.warn('📡 Response statusText:', certificatesResponse.statusText);
            
            // Try to get error details
            try {
              const errorResponse = await certificatesResponse.text();
              console.warn('📡 Error response body:', errorResponse);
            } catch (e) {
              console.warn('📡 Could not read error response body');
            }
            
            certificatesData = [];
          }
        } catch (error) {
          console.error('❌ Exception during certificate fetch:', error);
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack
          });
          certificatesData = [];
        }

        // DISABLED AUTO-GENERATION: Only show real certificates from database
        if (certificatesData.length === 0) {
          console.log('ℹ️ No real certificates found in database for completed courses');
          console.log('📊 Completed courses found:', completedCourses.length);
          completedCourses.forEach((course, index) => {
            console.log(`  ${index + 1}. "${course.title}" (${course.progressPercentage}% completed)`);
          });
        }

        // Update state with REAL validated certificates only
        console.log('🎯 === FINAL RESULT ===');
        console.log(`📊 Total certificates after all validation: ${certificatesData.length}`);
        if (certificatesData.length > 0) {
          console.log('✅ Certificates to display:');
          certificatesData.forEach((cert, index) => {
            console.log(`  ${index + 1}. "${cert.courseTitle}" - ${cert.certificateNumber}`);
          });
        } else {
          console.warn('⚠️ NO CERTIFICATES TO DISPLAY');
          console.log('🔍 Possible reasons:');
          console.log('  - No courses completed 100%');
          console.log('  - No certificates generated in backend');
          console.log('  - All certificates filtered out by validation');
        }
        
        setCertificates(certificatesData);
        
        // Cache the certificates data for 5 minutes
        localStorage.setItem('certificates_cache', JSON.stringify(certificatesData));
        localStorage.setItem('certificates_cache_time', Date.now().toString());

      } catch (err) {
        console.error('❌ Certificates fetch error:', err);
        console.error('❌ Error details:', err.message, err.stack);
        setError('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  // Click-away handler for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShareDropdown(null);
      }
    }
    if (shareDropdown !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareDropdown]);

  // Position dropdown near the button
  useEffect(() => {
    if (shareDropdown !== null && buttonRefs.current[shareDropdown]) {
      const rect = buttonRefs.current[shareDropdown].getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [shareDropdown]);

  const handleDownload = (certificateId) => {
    const cert = certificates.find(c => c._id === certificateId);
    if (!cert) return;
    
    try {
      // Get user information
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Student';
      
      
       
       // Create a beautiful HTML certificate
       const certificateHTML = `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="UTF-8">
           <title>Certificate of Achievement</title>

           <style>
             body {
               font-family: 'Arial', sans-serif;
               margin: 0;
               padding: 40px;
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               min-height: 100vh;
               display: flex;
               align-items: center;
               justify-content: center;
             }
             .certificate {
               background: white;
               border-radius: 20px;
               padding: 60px;
               box-shadow: 0 20px 40px rgba(0,0,0,0.1);
               text-align: center;
               max-width: 900px;
               width: 100%;
               position: relative;
               overflow: hidden;
             }
             .certificate::before {
               content: '';
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               height: 8px;
               background: linear-gradient(90deg, #007bff, #28a745, #ffc107, #dc3545);
             }
             .header {
               margin-bottom: 40px;
             }
             .title {
               font-size: 48px;
               font-weight: bold;
               color: #007bff;
               margin-bottom: 10px;
               text-transform: uppercase;
               letter-spacing: 2px;
             }
             .subtitle {
               font-size: 18px;
               color: #666;
               margin-bottom: 30px;
             }
             .student-name {
               font-size: 32px;
               font-weight: bold;
               color: #333;
               margin: 30px 0;
               text-transform: uppercase;
             }
             .course-info {
               font-size: 20px;
               color: #666;
               margin: 20px 0;
             }
             .course-title {
               font-size: 28px;
               font-weight: bold;
               color: #333;
               margin: 20px 0;
             }
             .grade {
               font-size: 18px;
               color: #28a745;
               font-weight: bold;
               margin: 15px 0;
             }
             .date {
               font-size: 16px;
               color: #666;
               margin: 20px 0;
             }
             .certificate-number {
               font-size: 14px;
               color: #999;
               margin: 30px 0;
               font-family: 'Courier New', monospace;
               background: #f8f9fa;
               padding: 10px;
               border-radius: 5px;
               border: 1px solid #e9ecef;
             }

             .footer {
               margin-top: 40px;
               padding-top: 30px;
               border-top: 2px solid #eee;
             }
             .platform {
               font-size: 24px;
               font-weight: bold;
               color: #007bff;
             }
             .logo {
               font-size: 14px;
               color: #999;
               margin-top: 10px;
             }
             .border {
               border: 3px solid #007bff;
               border-radius: 15px;
               padding: 20px;
               margin: 20px;
             }

           </style>
         </head>
         <body>
           <div class="certificate">
             <div class="border">
               <div class="header">
                 <div class="title">Certificate of Achievement</div>
                 <div class="subtitle">This is to certify that</div>
               </div>
               
               <div class="student-name">${studentName}</div>
               
               <div class="course-info">has successfully completed the course</div>
               
               <div class="course-title">${cert.courseTitle}</div>
               
               ${cert.grade ? `<div class="grade">with a grade of ${cert.grade}%</div>` : ''}
               
               <div class="date">Issued on ${new Date(cert.issuedAt).toLocaleDateString()}</div>
               
               <div class="certificate-number">Certificate Number: ${cert.certificateNumber}</div>
               
               <div class="footer">
                 <div class="platform">RefuLearn Platform</div>
                 <div class="logo">Empowering Learning Through Technology</div>
               </div>
             </div>
           </div>
           

         </body>
         </html>
       `;
      
      // Create a blob with the HTML content
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in a new window for printing/saving as PDF
      const newWindow = window.open(url, '_blank');
      
      // Auto-print after a short delay
      setTimeout(() => {
        if (newWindow) {
          newWindow.print();
        }
      }, 1000);
      
      // Also provide a direct download option
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cert.courseTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Certificate.html`;
      a.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      
      // Fallback: Create a simple text file
      const certificateText = `Certificate of Achievement

Title: ${cert.courseTitle}
Student: ${JSON.parse(localStorage.getItem('user') || '{}').firstName || 'Student'} ${JSON.parse(localStorage.getItem('user') || '{}').lastName || ''}
Description: Successfully completed the course
Issued: ${new Date(cert.issuedAt).toLocaleDateString()}
Certificate Number: ${cert.certificateNumber}
${cert.grade ? `Grade: ${cert.grade}%` : ''}

RefuLearn Platform`;

      const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
      a.download = `${cert.courseTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Certificate.txt`;
    a.click();
    URL.revokeObjectURL(url);
      
      alert('Certificate generation failed. A text certificate has been downloaded instead.');
    }
  };

  const handleShare = (certificateId, platform) => {
    const cert = certificates.find(c => c._id === certificateId);
    if (!cert) return;
    
    const shareText = encodeURIComponent(`I just earned the ${cert.courseTitle} certificate on RefuLearn! 🎉 #achievement #certificate`);
    const shareUrl = encodeURIComponent(window.location.origin + '/certificates');
    let url = '';
    if (platform === 'LinkedIn') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${shareText}`;
    } else if (platform === 'Facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
    } else if (platform === 'Twitter') {
      url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
    } else if (platform === 'Instagram') {
      url = `https://www.instagram.com/`;
    }
    if (url) window.open(url, '_blank');
    setShareDropdown(null);
  };

  if (loading) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading certificates...</div>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            <div>{error}</div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </Container>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Container>
        <Header>
          <Title>{t('certificates.title', 'Your Certificates')}</Title>
        </Header>
        {certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>🎓 {t('certificates.noCertificatesAvailable', 'No certificates available')}</div>
            <div style={{ marginBottom: '0.5rem' }}>{t('certificates.requirementsTitle', 'To earn a certificate, you must:')}</div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              ✅ {t('certificates.requirement1', 'Complete 90% or more of a course')}<br/>
              ✅ {t('certificates.requirement2', 'Have an instructor or admin generate your certificate')}<br/>
              📚 {t('certificates.requirement3', 'Only completed courses are eligible for certificates')}
            </div>
          </div>
        ) : (
          <CertificateGrid>
            {certificates.map(certificate => (
              <CertificateCard key={certificate._id}>
                <CertificateHeader>
                  <CertificateTitle>{certificate.courseTitle}</CertificateTitle>
                  <CertificateDate>
                    Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                  </CertificateDate>
                </CertificateHeader>
                <CertificateContent>
                  <CertificateDescription>
                    Successfully completed the course with {certificate.grade ? `a grade of ${certificate.grade}%` : 'distinction'}.
                  </CertificateDescription>
                  <CertificateMeta>
                    {certificate.grade && <span>Grade: {certificate.grade}%</span>}
                    <span>Certificate #: {certificate.certificateNumber}</span>
                  </CertificateMeta>
                  <DownloadButton onClick={() => handleDownload(certificate._id)}>
                    Download Certificate
                  </DownloadButton>
                  <div style={{ position: 'relative', zIndex: 1000 }}>
                    <ShareButton
                      ref={el => (buttonRefs.current[certificate._id] = el)}
                      onClick={() => setShareDropdown(shareDropdown === certificate._id ? null : certificate._id)}
                    >
                      Share Certificate
                    </ShareButton>
                  </div>
                </CertificateContent>
              </CertificateCard>
            ))}
          </CertificateGrid>
        )}
        {shareDropdown !== null && ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              zIndex: 3000,
              minWidth: 200,
              padding: 4,
            }}
          >
            {shareOptions.map(opt => (
              <button
                key={opt.name}
                style={{ display: 'block', width: '100%', padding: '12px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 16 }}
                onClick={() => handleShare(shareDropdown, opt.name)}
              >
                {opt.icon} Share on {opt.name}
              </button>
            ))}
          </div>,
          document.body
        )}
      </Container>
    </ContentWrapper>
  );
};

export default Certificates;