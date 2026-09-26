/** Route table shared by every feature. Features navigate only through these, never by importing each other. */
export const routes = {
  home: '/',
  language: '/language',
  login: '/login',
  profile: '/profile',
  schemes: '/schemes',
  scheme: (schemeId = ':schemeId') => `/schemes/${schemeId}`,
  cost: (schemeId = ':schemeId') => `/schemes/${schemeId}/cost`,
  partners: (schemeId = ':schemeId') => `/schemes/${schemeId}/partners`,
  documents: (schemeId = ':schemeId') => `/schemes/${schemeId}/documents`,
  status: '/status',
  application: (applicationId = ':applicationId') => `/status/${applicationId}`,
  verify: '/verify',
  officer: '/officer',
  officerApplication: (applicationId = ':applicationId') => `/officer/applications/${applicationId}`,
  officerPartners: '/officer/partners',
  officerRules: '/officer/rules',
} as const
