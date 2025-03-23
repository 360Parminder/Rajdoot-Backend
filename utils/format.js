const formatMemory = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
};

module.exports = { formatMemory, formatUptime };
