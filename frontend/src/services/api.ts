import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hooks_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('hooks_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Post Services
export const postService = {
  getPosts: (params?: { page?: number; limit?: number; filter?: 'saved' | 'following' }) =>
    api.get('/posts', { params }),
  createPost: (data: { content: string; imageUrl?: string }) => api.post('/posts', data),
  precheckPost: (data: { content: string; imageUrl?: string }) => api.post('/posts/precheck', data),
  likePost: (id: string) => api.post(`/posts/${id}/like`),
  unlikePost: (id: string) => api.delete(`/posts/${id}/like`),
  toggleSavePost: (id: string) => api.post(`/posts/${id}/save`),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
};

// Comment Services
export const commentService = {
  getComments: (postId: string) => api.get(`/comments/${postId}`),
  createComment: (postId: string, data: { content: string; parentCommentId?: string }) =>
    api.post(`/comments/${postId}`, data),
  likeComment: (id: string) => api.post(`/comments/${id}/like`),
  deleteComment: (id: string) => api.delete(`/comments/${id}`),
};

// Club Services
export const clubService = {
  getClubs: () => api.get('/clubs'),
  joinClub: (id: string) => api.post(`/clubs/${id}/join`),
  leaveClub: (id: string) => api.delete(`/clubs/${id}/join`),
};

// Event Services
export const eventService = {
  getEvents: () => api.get('/events'),
  rsvpEvent: (id: string) => api.post(`/events/${id}/rsvp`),
  cancelRsvp: (id: string) => api.delete(`/events/${id}/rsvp`),
};

// User & Network Services
export const userService = {
  getUsers: (params?: { q?: string }) => api.get('/users', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateMe: (data: any) => api.patch('/users/me', data),
  getMyConnections: () => api.get('/users/me/connections'),
  getSavedPosts: () => api.get('/users/me/saved-posts'),
  toggleConnection: (id: string) => api.post(`/users/${id}/connect`),
  toggleFollow: (id: string) => api.post(`/users/${id}/follow`),
};

// Notification Services
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string | 'all') => api.patch(`/notifications/${id}/read`),
};

// Live Campus Sessions Services
export const liveService = {
  getLiveSessions: () => api.get('/live'),
  createLiveSession: (data: { title: string; category?: string; tags?: string[] }) =>
    api.post('/live', data),
  joinLiveSession: (id: string) => api.post(`/live/${id}/join`),
  endLiveSession: (id: string) => api.post(`/live/${id}/end`),
};

export default api;
