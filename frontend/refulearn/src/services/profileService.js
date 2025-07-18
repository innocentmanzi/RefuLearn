class ProfileService {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('token');
  }

  // Helper to get auth headers
  getAuthHeaders(contentType = 'application/json') {
    const headers = {
      'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
    };
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    return headers;
  }

  // Helper for API requests
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(options.contentType),
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ API Error Details:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: `${this.baseURL}${url}`,
          method: options.method || 'GET'
        });
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'}] ${url}:`, error);
      throw error;
    }
  }

  // Get user profile
  async getProfile() {
    return await this.makeRequest('/users/profile');
  }

  // Update basic profile information
  async updateProfile(profileData) {
    return await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePic', file);

    return await this.makeRequest('/users/profile-picture', {
      method: 'POST',
      contentType: null, // Let browser set content-type for FormData
      body: formData
    });
  }

  // Update education
  async updateEducation(education) {
    return await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ education })
    });
  }

  // Update work experience
  async updateExperience(experiences) {
    return await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ experiences })
    });
  }

  // Update skills
  async updateSkills(skills) {
    return await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ skills })
    });
  }

  // Update languages
  async updateLanguages(languages) {
    return await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ languages })
    });
  }

  // Update certificates
  async updateCertificates(certificates) {
    return await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ certificates })
    });
  }

  // Update contact information
  async updateContactInfo(contactData) {
    console.log('📤 Sending contact data to backend:', contactData);
    const result = await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
    console.log('📥 Backend response for contact update:', result);
    return result;
  }

  // Update social platforms
  async updateSocialPlatforms(social) {
    console.log('📤 Sending social platforms to backend:', social);
    const result = await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ social })
    });
    console.log('📥 Backend response for social update:', result);
    return result;
  }

  // Update interests
  async updateInterests(interests) {
    console.log('📤 Sending interests to backend:', interests);
    const result = await this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ interests })
    });
    console.log('📥 Backend response for interests update:', result);
    return result;
  }

  // Add education entry
  async addEducation(educationEntry) {
    const profile = await this.getProfile();
    const education = [...(profile.data.user.education || []), educationEntry];
    return await this.updateEducation(education);
  }

  // Remove education entry
  async removeEducation(index) {
    const profile = await this.getProfile();
    const education = [...(profile.data.user.education || [])];
    education.splice(index, 1);
    return await this.updateEducation(education);
  }

  // Add experience entry
  async addExperience(experienceEntry) {
    const profile = await this.getProfile();
    const experiences = [...(profile.data.user.experiences || []), experienceEntry];
    return await this.updateExperience(experiences);
  }

  // Remove experience entry
  async removeExperience(index) {
    const profile = await this.getProfile();
    const experiences = [...(profile.data.user.experiences || [])];
    experiences.splice(index, 1);
    return await this.updateExperience(experiences);
  }

  // Add certificate
  async addCertificate(certificateEntry) {
    const profile = await this.getProfile();
    const certificates = [...(profile.data.user.certificates || []), certificateEntry];
    return await this.updateCertificates(certificates);
  }

  // Remove certificate
  async removeCertificate(index) {
    const profile = await this.getProfile();
    const certificates = [...(profile.data.user.certificates || [])];
    certificates.splice(index, 1);
    return await this.updateCertificates(certificates);
  }
}

const profileService = new ProfileService();
export default profileService; 