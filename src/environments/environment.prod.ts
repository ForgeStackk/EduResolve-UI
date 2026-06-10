export const environment = {
  production: true,
  apiBaseUrl: '/api',
  keycloakIssuer: '/auth/realms/eduresolve',
  keycloakClientId: 'eduresolve-frontend',
  features: {
    homeworkSubmission: true,
    askTeacher:         true,
    progressDashboard:  true,
    offlineAccess:      false,
    pushNotifications:  false,
    aiTab:              true,
  }
};
