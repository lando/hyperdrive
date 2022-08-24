/*
 * TBD
 */
module.exports = () => {
  // probably running in a browser
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') return 'browser'; // eslint-disable-line no-undef
  // running on a remote development option
  if (process.env.GITPOD_WORKSPACE_ID || process.env.CODESPACES) return 'remote';
  // running on a remote linux server
  if (process.platform === 'linux' && (process.env.SSH_CLIENT || process.env.SSH_TTY) && !process.DISPLAY) return 'server';
  // running in a CI environment
  if (process.env.CI) return 'ci';
  // running locally
  return 'local';
};
