const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// const BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok || !responseData.success) {
    const errorMsg = responseData.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = responseData.data;
    throw error;
  }

  return responseData.data;
}

export const api = {
  auth: {
    login: (email, password) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (fullName, email, password) => 
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      }),
  },

  publicArticles: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.tag) query.append('tag', params.tag);
      if (params.category) query.append('category', params.category);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request(`/public/articles${queryString}`);
    },
    getBySlug: (slug) => request(`/public/articles/${slug}`),
  },

  publicCategories: {
    list: () => request('/public/categories'),
    getBySlug: (slug) => request(`/public/categories/${slug}`),
  },

  publicTags: {
    list: () => request('/public/tags'),
    getBySlug: (slug) => request(`/public/tags/${slug}`),
  },

  articles: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.visibility) query.append('visibility', params.visibility);
      if (params.tag) query.append('tag', params.tag);
      if (params.category) query.append('category', params.category);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request(`/articles${queryString}`);
    },
    getById: (id) => request(`/articles/${id}`),
    create: (data) => 
      request('/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) => 
      request(`/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => 
      request(`/articles/${id}`, {
        method: 'DELETE',
      }),
    publish: (id) => 
      request(`/articles/${id}/publish`, {
        method: 'POST',
      }),
    archive: (id) => 
      request(`/articles/${id}/archive`, {
        method: 'POST',
      }),
  },

  categories: {
    list: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`),
    create: (data) => 
      request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) => 
      request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => 
      request(`/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  tags: {
    list: () => request('/tags'),
    getById: (id) => request(`/tags/${id}`),
    create: (data) => 
      request('/tags', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) => 
      request(`/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => 
      request(`/tags/${id}`, {
        method: 'DELETE',
      }),
  },

  media: {
    list: () => request('/media'),
    getById: (id) => request(`/media/${id}`),
    create: (data) => 
      request('/media', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) => 
      request(`/media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => 
      request(`/media/${id}`, {
        method: 'DELETE',
      }),
  },

  users: {
    list: () => request('/users'),
    getById: (id) => request(`/users/${id}`),
    create: (data) => 
      request('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) => 
      request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => 
      request(`/users/${id}`, {
        method: 'DELETE',
      }),
    subscribe: (authorId) => 
      request(`/users/subscribe/${authorId}`, {
        method: 'POST',
      }),
    unsubscribe: (authorId) => 
      request(`/users/unsubscribe/${authorId}`, {
        method: 'POST',
      }),
    checkSubscription: (authorId) => request(`/users/subscriptions/check/${authorId}`),
    getSubscriptions: () => request('/users/subscriptions'),
  },

  notifications: {
    list: () => request('/notifications'),
    markAsRead: (id) => 
      request(`/notifications/${id}/read`, {
        method: 'PUT',
      }),
    markAllAsRead: () => 
      request('/notifications/read-all', {
        method: 'PUT',
      }),
  },
};
