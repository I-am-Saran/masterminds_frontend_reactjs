import { del, get, post, put } from "./api";

export const MASKED_PASSWORD = "********";

export async function fetchEmailConfigurations() {
  return get("/email/configurations");
}

export async function createEmailConfiguration(payload) {
  return post("/email/configurations", payload);
}

export async function updateEmailConfiguration(id, payload) {
  return put(`/email/configurations/${id}`, payload);
}

export async function deleteEmailConfiguration(id) {
  return del(`/email/configurations/${id}`);
}

export async function testEmailConfiguration(payload) {
  return post("/email/configurations/test", payload);
}

export async function testSavedEmailConfiguration(id) {
  return post(`/email/configurations/${id}/test`);
}

export async function fetchEmailNotifications() {
  return get("/email/notifications");
}

export async function saveEmailNotifications(notifications) {
  return put("/email/notifications", { notifications });
}

export async function fetchEmailTemplates() {
  return get("/email/templates");
}

export async function createEmailTemplate(payload) {
  return post("/email/templates", payload);
}

export async function updateEmailTemplate(id, payload) {
  return put(`/email/templates/${id}`, payload);
}

export async function deleteEmailTemplate(id) {
  return del(`/email/templates/${id}`);
}

export async function fetchEmailEvents() {
  return get("/email/events");
}

export async function fetchEmailProviders() {
  return get("/email/providers");
}

export async function fetchTemplateVariables() {
  return get("/email/template-variables");
}

export async function fetchEmailBranding() {
  return get("/email/branding");
}

export async function fetchDefaultCreateTicketTemplate() {
  return get("/email/templates/default/create-ticket");
}
