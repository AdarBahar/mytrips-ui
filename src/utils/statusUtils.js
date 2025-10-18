// Status utility functions for trip status management

export const statusConfig = {
  draft: {
    label: 'Draft',
    emoji: '📝',
    description: 'Trip is being planned',
    color: '#856404',
    backgroundColor: '#fff3cd'
  },
  active: {
    label: 'Active', 
    emoji: '✈️',
    description: 'Trip is happening or confirmed',
    color: '#0c5460',
    backgroundColor: '#d1ecf1'
  },
  completed: {
    label: 'Completed',
    emoji: '✅', 
    description: 'Trip has been completed',
    color: '#155724',
    backgroundColor: '#d4edda'
  },
  archived: {
    label: 'Archived',
    emoji: '📦',
    description: 'Trip is archived for reference',
    color: '#721c24',
    backgroundColor: '#f8d7da'
  }
};

export const getStatusInfo = (status) => {
  return statusConfig[status] || statusConfig.draft;
};

export const getStatusDescription = (status) => {
  return getStatusInfo(status).description;
};

export const getStatusLabel = (status) => {
  const info = getStatusInfo(status);
  return `${info.emoji} ${info.label}`;
};

export const isValidStatusTransition = (fromStatus, toStatus) => {
  // Business rules for status transitions
  if (fromStatus === 'completed' && toStatus === 'active') {
    return false; // Cannot change from completed back to active
  }
  return true;
};

export const getAllStatusOptions = () => {
  return Object.entries(statusConfig).map(([value, config]) => ({
    value,
    ...config
  }));
};
