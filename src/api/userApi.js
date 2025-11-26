import { apiCaller } from './apiCaller.js';

// Get current user info
export const getMe = async () => {
  try {
    const response = await apiCaller.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
};

// Update user profile (username and email)
export const updateProfile = async (userData) => {
  try {
    const response = await apiCaller.put('/user', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (passwordData) => {
  try {
    const response = await apiCaller.put('/user/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Update avatar
export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    const response = await apiCaller.put('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

// Delete account
export const deleteAccount = async () => {
  try {
    const response = await apiCaller.delete('/user');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
