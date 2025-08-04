import offlineIntegrationService from '../services/offlineIntegrationService';

/**
 * Offline Form Handler Utility
 * Handles form submissions with offline support
 */
class OfflineFormHandler {
  constructor() {
    this.pendingSubmissions = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for network status changes
    window.addEventListener('online', () => {
      this.processPendingSubmissions();
    });

    // Listen for custom sync events
    window.addEventListener('offlineSync', (event) => {
      if (event.detail.type === 'complete') {
        this.clearCompletedSubmissions();
      }
    });
  }

  /**
   * Submit a form with offline support
   * @param {string} url - The API endpoint
   * @param {Object} data - Form data to submit
   * @param {Object} options - Additional options
   * @returns {Promise} - Resolves when submitted or queued
   */
  async submitForm(url, data, options = {}) {
    const {
      method = 'POST',
      headers = {},
      onlineCallback = null,
      offlineCallback = null,
      successMessage = 'Submitted successfully',
      offlineMessage = 'Saved offline. Will sync when connection restored.'
    } = options;

    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...headers
    };

    // Generate unique submission ID
    const submissionId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (navigator.onLine) {
      try {
        // Try online submission
        const response = await fetch(url, {
          method,
          headers: defaultHeaders,
          body: JSON.stringify(data)
        });

        if (response.ok) {
          const result = await response.json();
          
          // Call online callback if provided
          if (onlineCallback) {
            onlineCallback(result);
          }

          // Show success notification
          this.showNotification(successMessage, 'success');
          
          return { success: true, data: result, online: true };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn('⚠️ Online submission failed, queuing for offline sync:', error);
        // Fall through to offline handling
      }
    }

    // Offline submission - queue for later
    try {
      await this.queueSubmission(submissionId, {
        url,
        method,
        headers: defaultHeaders,
        data,
        timestamp: new Date().toISOString(),
        successMessage,
        onlineCallback: onlineCallback ? onlineCallback.toString() : null
      });

      // Call offline callback if provided
      if (offlineCallback) {
        offlineCallback({ submissionId, data });
      }

      // Show offline notification
      this.showNotification(offlineMessage, 'info');

      return { success: true, submissionId, data, online: false };
    } catch (error) {
      console.error('❌ Failed to queue offline submission:', error);
      this.showNotification('Failed to save submission', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Queue a submission for offline sync
   */
  async queueSubmission(submissionId, submissionData) {
    // Store in memory
    this.pendingSubmissions.set(submissionId, submissionData);

    // Store in persistent storage via offline service
    await offlineIntegrationService.queueOfflineAction({
      type: 'form_submission',
      id: submissionId,
      url: submissionData.url,
      method: submissionData.method,
      headers: submissionData.headers,
      data: submissionData.data
    });

    console.log(`📋 Form submission queued: ${submissionId}`);
  }

  /**
   * Process all pending submissions when online
   */
  async processPendingSubmissions() {
    if (this.pendingSubmissions.size === 0) {
      return;
    }

    console.log(`🔄 Processing ${this.pendingSubmissions.size} pending form submissions...`);

    const results = [];
    for (const [submissionId, submission] of this.pendingSubmissions) {
      try {
        const response = await fetch(submission.url, {
          method: submission.method,
          headers: submission.headers,
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          const result = await response.json();
          
          // Execute stored callback if available
          if (submission.onlineCallback) {
            try {
              const callback = new Function('return ' + submission.onlineCallback)();
              callback(result);
            } catch (callbackError) {
              console.warn('⚠️ Failed to execute stored callback:', callbackError);
            }
          }

          // Show success notification
          this.showNotification(submission.successMessage || 'Submission synced successfully', 'success');
          
          this.pendingSubmissions.delete(submissionId);
          results.push({ submissionId, success: true, result });
          
          console.log(`✅ Synced form submission: ${submissionId}`);
        } else {
          console.warn(`⚠️ Failed to sync submission ${submissionId}:`, response.status);
          results.push({ submissionId, success: false, error: response.status });
        }
      } catch (error) {
        console.error(`❌ Error syncing submission ${submissionId}:`, error);
        results.push({ submissionId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Clear completed submissions
   */
  clearCompletedSubmissions() {
    const completedCount = this.pendingSubmissions.size;
    this.pendingSubmissions.clear();
    
    if (completedCount > 0) {
      console.log(`🗑️ Cleared ${completedCount} completed form submissions`);
    }
  }

  /**
   * Get pending submissions count
   */
  getPendingCount() {
    return this.pendingSubmissions.size;
  }

  /**
   * Get all pending submissions
   */
  getPendingSubmissions() {
    return Array.from(this.pendingSubmissions.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Try to use app's notification system if available
    if (window.showNotification) {
      window.showNotification(message, type);
      return;
    }

    // Fallback to console and browser notification
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Try browser notification if supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      new Notification(`RefuLearn - ${icon}`, {
        body: message,
        icon: '/logo192.png',
        tag: 'offline-form'
      });
    }
  }

  /**
   * Submit course enrollment with offline support
   */
  async submitCourseEnrollment(courseId, additionalData = {}) {
    return this.submitForm('/api/courses/enroll', {
      courseId,
      ...additionalData
    }, {
      successMessage: 'Successfully enrolled in course!',
      offlineMessage: 'Course enrollment saved. Will sync when online.'
    });
  }

  /**
   * Submit job application with offline support
   */
  async submitJobApplication(jobId, applicationData) {
    return this.submitForm(`/api/jobs/${jobId}/apply`, applicationData, {
      successMessage: 'Application submitted successfully!',
      offlineMessage: 'Application saved offline. Will submit when online.'
    });
  }

  /**
   * Submit scholarship application with offline support
   */
  async submitScholarshipApplication(scholarshipId, applicationData) {
    return this.submitForm(`/api/scholarships/${scholarshipId}/apply`, applicationData, {
      successMessage: 'Scholarship application submitted!',
      offlineMessage: 'Scholarship application saved offline. Will submit when online.'
    });
  }

  /**
   * Submit assessment results with offline support
   */
  async submitAssessmentResults(assessmentId, results) {
    return this.submitForm(`/api/assessments/${assessmentId}/submit`, results, {
      successMessage: 'Assessment submitted successfully!',
      offlineMessage: 'Assessment results saved offline. Will submit when online.'
    });
  }

  /**
   * Submit help ticket with offline support
   */
  async submitHelpTicket(ticketData) {
    return this.submitForm('/api/help/tickets', ticketData, {
      successMessage: 'Help ticket submitted successfully!',
      offlineMessage: 'Help ticket saved offline. Will submit when online.'
    });
  }
}

// Create and export singleton instance
const offlineFormHandler = new OfflineFormHandler();
export default offlineFormHandler; 