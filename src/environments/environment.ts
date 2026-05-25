export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  keycloakIssuer: 'http://localhost:8180/realms/eduresolve',
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
