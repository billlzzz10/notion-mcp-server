// frontend/src/gcp-credentials.ts
export const googleServiceAccount = {
  type: "service_account",
  project_id: "unicorn-start-00000-h1",
  private_key_id: "e111e88427965029bfaa2cbbd75738450d49ff73",
  private_key: process.env.GCP_PRIVATE_KEY || "",
  client_email: "notion-to-gsheet@unicorn-start-00000-h1.iam.gserviceaccount.com",
  client_id: "106511454273294155788",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/notion-to-gsheet%40unicorn-start-00000-h1.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};
