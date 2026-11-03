//  export const API_HOST = "http://103.133.215.182:8951";
// export const API_HOST = "http://localhost:8951";
export const API_HOST = "http://192.168.1.200:8951";
export const DEFAULT_RSA_PUBLIC_KEY ="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAocY0eeeK1s9dAqEBsrN1bg+G4Ux4uTDq2mdlMAoQ14N+ME9Sd4+CYk9iF86InOTJ9e2n9w0L8vEWSku3oAzNRYBzHp46oBJuUhFAC3sJ0Xwkfz96cW9HkS+YrEoPy716J2rDAaedjgeSsLOL6QwitGGKyy8g1jUKOCZV26iQOSKbU1S9QjKO8NnAyoExVFDqrNXy8j3HnHB0NXSYjNJk6Sv/zMkijotHKp+u4NNxBnP69uEoMfLPmDslErh9uDzc4nrKYm94RbzJ/JxhRl3gXV/sXNhHSpSA0rA/5w66uh6JZYq0G+0FbnHwBUBgOIoLVQ8Zg+Di3zqF3nEMLJKYwwIDAQAB";

export const getApiUrl = (endpoint) => {
  const apiUrl = new URL(endpoint, `${API_HOST.replace(/\/+$/, "")}/`);
  const apiHost = new URL(API_HOST);
  const useSameOriginProxy =
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    apiHost.protocol === "http:" &&
    apiUrl.origin === apiHost.origin;

  return useSameOriginProxy
    ? `${apiUrl.pathname}${apiUrl.search}${apiUrl.hash}`
    : apiUrl.toString();
};

export const ENDPOINTS = {
  LOGIN: "/api/auth/login",
  AUTH_PROFILE: "/api/auth/me",
  SWITCH_ROLE: "/api/auth/switch-role",
  OBSERVATIONS: "/api/observations",
  APPROVED_OBSERVATIONS: "/api/observations/approved",
  ASSIGNED_OBSERVATIONS: "/api/observations/assigned",
  PENDING_OBSERVATIONS: "/api/observations/pending",
  REJECTED_OBSERVATIONS: "/api/observations/rejected",
  OBSERVATION: (id) => `/api/observations/${encodeURIComponent(id)}`,
  FIELD_SUBMISSION: (id) => `/api/observations/${encodeURIComponent(id)}/field-submission`,
  OBSERVATION_UPDATE: (id) => `/api/observations/${encodeURIComponent(id)}/update`,
  ASSIGN_OBSERVATION: (id) => `/api/observations/${encodeURIComponent(id)}/assign`,
  CAPA_RECOMMENDATIONS: (id) => `/api/observations/${encodeURIComponent(id)}/capa-recommendations`,
  OBSERVATION_DECISION: (id) => `/api/observations/${encodeURIComponent(id)}/decision`,
  USERS: "/api/users",
  USER_ROLES: (userId) => `/api/users/${encodeURIComponent(userId)}/roles`,
  CATALOG_BUSINESS_UNIT: "/api/catalog/business_unit",
  CATALOG_PLANT: "/api/catalog/plant",
  CATALOG_DEPARTMENT: "/api/catalog/department",
  CATALOG_ROLE: "/api/catalog/role",
  CATALOG_RESPONSIBLE_PEOPLE: (departmentId, plantId) => `/api/catalog/responsible_people?department_id=${encodeURIComponent(departmentId)}&plant_id=${encodeURIComponent(plantId)}`,
  PROFILE: "/api/profile/me",
  PROFILE_BY_ID: (userId) => `/api/profile/${encodeURIComponent(userId)}`,
  CHAT: "/api/chat",
  TRANSLATE_BATCH: "/api/translate/batch",
};